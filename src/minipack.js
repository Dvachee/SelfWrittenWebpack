/**
 * Сборщики модулей компилируют маленькие кусочки кода в более сложные и цельные
 * структуры, подходящие для запуска в среде веб-браузера. Эти маленькие кусочки являются
 * JavaScript-файлами, а зависимости между ними описываются с помощью какой-либо модульной
 * системы (ES2015, CommonJS, AMD). Подробнее об этом можно прочитать тут:
 * https://webpack.js.org/concepts/modules
 *
 * У сборщиков модулей есть концепция точки входа (entry file). Вместо того, чтобы добавлять несколько
 * тегов <script> на веб-страницу, мы заранее собираем бандл (bundle), или иначе сборку, предоставляя
 * один из файлов в качестве той самой точки входа. Из нее мы узнаем о зависимостях и
 * зависимостях зависимостей и так далее. Так наше приложение и собирается воедино.
 *
 * Сборщик начинает анализ а entry-файла и пробует выяснить от каких модулей он зависит.
 * Затем, для этих зависимостей выясняет уже их зависимости. И все это продолжается до полного
 * выяснения структуры проекта. Такая структура называется деревом зависимостей (dependency graph)
 *
 * В данном примере мы создадим дерево зависимостей и используем его для сборки модулей в бандл.
 *
 * Что ж, начнем :)
 *
 * Примечание: Это очень упрощенный пример. Мы не рассматриваем обработку случаев зацикленных
 * зависимостей, кэширования модулей, парсинга модуля только один раз, если зависимость
 * уже была где-то использована и т.д. Но общий принцип передан верно.
 */

const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const {transformFromAst} = require('babel-core');

let ID = 0;

// Начнем с создания функции, которая будет принимать относительный путь к файлу,
// считывать его содержимое и извлекать все его зависимости.
function createAsset(filename) {
  // Считываем содержимое файла как строку.
  const content = fs.readFileSync(filename, 'utf-8');

  // Теперь пытаемся выяснить, от каких модулей данный файл зависит
  // Это можно понять, считав все строки с импортами. Можно делать
  // посимвольный парсинг, однако это очень трудоемко, поэтому воспользуемся
  // готовым решением - JavaScript-парсером Babylon. На выходе он генерирует
  // модель под названием "абстрактное синтаксическое дерево" (Abstract Syntax Tree, AST).
  // Оно содержит в себе всю информацию о нашем коде, которую мы можем считать и использовать.
  //
  // Рекомендую поэкспериментировать с AST Explorer (https://astexplorer.net).
  // Он даст вам понимание, как устроено AST, если повводить простейшие JavaScript инструкции.
  const ast = babylon.parse(content, {
    sourceType: 'module',
  });

  // Этот массив будет содержать относительные пути тех модулей, от которых
  // зависит данный модуль.
  const dependencies = [];

  // Тут мы проходимся по AST и пытаемся выяснить список конкретных зависимостей.
  // Для этого мы проверяем все объявления типа 'ImportDeclaration'
  traverse(ast, {
    // Модули ECMAScript очень просты и предсказуемы, потому что они статические.
    // Это значит, что нельзя импортировать что-то, в зависимости от значения
    // уже во время выполнения скрипта или основываясь на каком-либо условии.
    //
    // Каждый раз, когда мы встречаем ноду типа 'ImportDeclaration' ...
    ImportDeclaration: ({node}) => {
      // ... мы добавляем ее в массив зависимостей, созданный ранее.
      dependencies.push(node.source.value);
    },
  });

  // Также, мы присваиваем модулю уникальный идентификатор путем инкрементирования счетчика
  const id = ID++;

  // Мы используем ECMAScript-модули и другие новые возможности, которые
  // могут не поддерживаться всеми браузерами. Чтобы быть уверенными что сборка
  // запустится везде, нужно транспилировать код с помощью Babel (https://babeljs.io).
  //
  // Опция `presets` это набор правил, говорящих Babel, как именно транспилировать наш код.
  // Мы используем пресет `babel-preset-env` для перевода всего ES6-кода в ES5-совместимый
  const {code} = transformFromAst(ast, null, {
    presets: ['env'],
  });

  // Возвращаем всю информацию о модуле.
  return {
    id,
    filename,
    dependencies,
    code,
  };
}

// Теперь мы можем извлечь все зависимости конкретного модуля, начная с entry-файла
//
// Затем, мы извлекаем зависимости всех найденных зависимостей и так далее.
// Это продолжается до тех пор, пока не будет выяснена вся информация обо всех
// зависимостях приложения и их взаимоотношениях.
//
// Модель, представляющая все эти вазимоотношения, называется dependency graph,
// то есть, дерево зависимостей.
function createGraph(entry) {
  // Начинаем с парсинга entry-файла
  const mainAsset = createAsset(entry); // Это наш ассет, т.е. объект с информацией о модуле

  // Используем очередь для парсинга зависимостей каждого ассета.
  // Реализацией очереди тут является массив.
  const queue = [mainAsset];

  // Используем цикл `for ... of` для прохода по очереди. Вначале очередь содержит только
  // один ассет, но по мере прохождения по зависимостям, список будет пополняться и постепенно
  // обрабатываться. Цикл окончится, когда очередь опустеет.
  for (const asset of queue) {
    // Каждый ассет содержит список относительных путей к модулям, от которых он зависит.
    // Мы итерируемся по ним, парсим их через функцию `createAsset()` и запоминаем зависимости.
    asset.mapping = {};

    // Здесь сохраняем папку, в которой находится текущий модуль.
    const dirname = path.dirname(asset.filename);

    // Итерируемся по списку относительных путей к зависимостям
    asset.dependencies.forEach(relativePath => {
      // Функция `createAsset()` аргументом ожидает абсолютный путь,
      // а массив зависимостей содержит пути относительные.
      // Причем пути эти заданы относительно модулей, импортирующих зависимость.
      // Мы можем превратить относительный путь в абсолютный склеив его
      // с путем к папке родительского ассета.
      const absolutePath = path.join(dirname, relativePath);

      // Парсим ассет, считываем его содержимое и извлекаем зависимости.
      const child = createAsset(absolutePath);

      // Для нас важно знать, что ассет зависит от завиисмостей с конкретными id.
      // Мы выражаем эти отношения добавляя свойства в поле mapping нашего ассета.
      asset.mapping[relativePath] = child.id;

      // Наконец, мы пушим ассет-зависимость в очередь для дальнейшей обработки.
      queue.push(child);
    });
  }

  // На данном этапе очередь это просто массив со всеми модулями собираемого проекта.
  // Это и есть тот самый граф зависимостей, просто выполненный в форме очереди,
  // а если еще проще, то массива.
  return queue;
}

// Далее, определяем функцию которая будет использовать граф и возвращать готовый бандл.
// В сущности, он будет сожержать толко одну анонимную самовызывающуюся функцию:
// (function() {})()
//
// Она будет принимать один параметр - сгенерированный на предыдущем этапе граф
function bundle(graph) {
  let modules = '';

  // Перед тем, как написать код функции самого сборщика, необходимо сконструировать
  // объект, который будет в нее передаваться аргументом. Обратите внимание, что
  // конструируема строка оборачивается при интерполяции в фигурные скодки, так что
  // здесь нам в них оборачивать не нужно. Формат будет такой:
  // key: value, key: value, key: value, ...
  graph.forEach(mod => {
    // Мы используем id модуля в качестве ключа и массив в качестве значения
    // (в нем будет 2 элемента для каждого модуля)
    //
    // Первое значение это транспилированный через Babel исходный код, обернутый
    // в функцию. Это сделано для изоляции области видимости каждого модуля, ведь
    // они между собой и тем более глобальной областью видимости, не должны пересекаться.
    //
    // Наши модули после трансрпиляции будут в формате модулей CommonJS. Они будут ожидать
    // передачи через аргументы функции require и объектов module и exports.
    // В браузерах нативно такой функции нет, потому мы сами пишем ее и внедряем в обертки модулей.
    //
    // Второе значение это преобразованный в строку объект mapping, содержащий информацию
    // о связи данного модуля с его зависимостями в таком виде:
    // { './relative/path': 1 }
    //
    // Дело в том, что транспилированный код модулей содержит вызовы с подключением
    // через `require()` с относительными путями в качестве аргумента. Так что мы должны
    // знать какой модуль в графе какому относительному пути соответствует.
    modules += `${mod.id}: [
      function (require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)},
    ],`;
  });

  // Ну и нацонец, напишем тело нашей самовызывающейся функции.
  //
  // Начнем с функции `require()`. Она принимает id модуля в качестве аругумента,
  // ища его на объекте modules, который мы передали при вызове.
  //
  // Деструктурируем массив извлекая два наших значения, содержащих код функции
  // модуля в обертке и объект mapping.
  //
  // Код наших модулей вызывает `require()` с относительным путем. вместо id нужного модуля.
  // Кроме того, два модуля могут зареквайрить один и тот же относительный путь,
  // который будет указывать на разные файлы в переложении на абсолютные пути.
  //
  // Чтобы грамотно обработать эту ситуацию, при подключении модуля, мы создаем новую,
  // локальную функцию `require()` для подключения именно этого модуля. Она будет знать,
  // как превратить относительный код данного модуля в его реальный id, по которому его можно
  // будет взять. Именно для этого и нужен объект mapping, содержащий отношения между
  // относительными путями к зависимостям данного модуля и реальными id.
  //
  // Наконец, когда модуль зареквайрен, он может изменить объект exports. После изменения кодом
  // модуля, этот объект возвращается из функции `require()`
  const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];

        function localRequire(name) {
          return require(mapping[name]);
        }

        const module = { exports : {} };

        fn(localRequire, module, module.exports);

        return module.exports;
      }

      require(0);
    })({${modules}})
  `;

  // Ура! Наконец-то можно возвратить результат =)
  return result;
}

const graph = createGraph('./example/entry.js');
const result = bundle(graph);

console.log(result);
