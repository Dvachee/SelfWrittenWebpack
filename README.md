## 📦 Minipack

> A simplified example of a modern module bundler written in JavaScript
> Перед вами вариант простейшего сборщика JavaScript-модулей, работающего по тем же принципам, что и распространенные сегодня популярные инструменты для генерации бандлов.

Процесс его написания в реальном времени переведен на русский. Можно посмотреть и поднять свой левел тут: 
[(http://img.youtube.com/vi/MdAuW9n2iec/maxresdefault.jpg)](https://www.youtube.com/watch?v=MdAuW9n2iec)

### Введение

Сегодня, фронтенд-разработчики очень много времени тратят на настройку инструментов вроде [Webpack](https://github.com/webpack/webpack), [Browserify](https://github.com/browserify/browserify), [Parcel](https://github.com/parcel-bundler/parcel) и др.

Понимание принципов по которым работают эти инструменты, помогает принимать правильные решения при написании кода. Если вы знаете как модульный код превращается в готовую сборку (бандл, bundle) и из каких элементов она состоит, то отладка и другие вещи значительгно упростятся.

Цель данного проекта в том, чтобы объяснить, как сборщики работают, что называется, "под капотом". Реализация механизма минималистична и примитивна, однако принцип работы современных сборщиков показывает совершенно четко. Все строки кода тщательно прокомментированы, так что вкупе с просмотром вышеуказанного видеоролика, вы вполне сможете освоить представленный материал, имея некоторую базу во фронтенде.

### Хорошо, а с чего начать?

Собственно, сначала смотрите доклад с переводом, а затем изучайте исходники: [src/minipack.js](src/minipack.js).

### Запуск пример

Сначала нужно установить Node-зависимости через NPM:

```sh
$ npm install
```

или через Yarn:
```sh
$ yarn install
```

Затем запускаем скрипт:

```sh
$ node src/minipack.js
```

### Дополнительные ссылки

- [Генератор абстрактного синтаксического дерева для JS-кода (AST Explorer)](https://astexplorer.net)
- [Realtime-песочница с транспилятором Babel (REPL)](https://babeljs.io/repl)
- [Про Babylon](https://github.com/babel/babel/tree/master/packages/babel-parser)
- [Про плагины Babel](https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/plugin-handbook.md)
- [Про модули в Webpack](https://webpack.js.org/concepts/modules)

- [Ссылка на оригинальный репозитория Ronen Amiel, автора доклада и данного кода](https://github.com/ronami/minipack)
