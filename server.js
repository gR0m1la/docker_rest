const express = require('express');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const methodOverride = require('method-override');
const session = require('express-session');

// Подключение к PostgreSQL
const sequelize = new Sequelize({
    database: 'postgres',
    username: 'admin',
    password: '1234',
    host: 'db',
    port: 5432,
    dialect: 'postgres',
});

// Проверка подключения к базе данных
sequelize.authenticate()
    .then(() => console.log('Connected to DB'))
    .catch((error) => console.error('Error connecting to DB:', error));

// Определение моделей для таблиц в базе данных
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const Item = sequelize.define('Item', {
    // Определите поля для таблицы Item
});

const Order = sequelize.define('Order', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    petname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vetname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

sequelize.sync()
    .then(() => console.log('Database synchronized'))
    .catch((error) => console.error('Error synchronizing database:', error));

const app = express();

app.set('view engine', 'ejs');

const PORT = 3000;

const createPath = (page) => path.resolve(__dirname, 'views', `${page}.ejs`);

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`listening port ${PORT}` );
});

app.use((req, res, next) => {
    console.log(`path: ${req.path}`);
    console.log(`method: ${req.method}`);
    next();
});
app.use(express.static('styles'));
app.use(express.static('photo'));
app.use(express.static('scripts'));

app.use(methodOverride('_method'));

app.use(express.urlencoded({extended: false}));

app.use(session({
    secret: 'restoran', // Замените на ваш секретный ключ
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    const userLogin = req.session.login || null;
    const userRole = req.session.role || 'guest';
    const userName = req.session.name || null;
    res.render(createPath('index'), {userRole, userLogin, userName});
});

app.get('/index.html', (req, res) => {
    res.redirect('/');
});

app.get('/registration', (req, res) => {
    res.render(createPath('registration'));
});

app.get('/login', (req, res) => {
    // Извлекаем сообщение об ошибке из параметров запроса
    const errorMessage = req.query.error;

    // Рендерим страницу /login, передавая сообщение об ошибке
    res.render(createPath('login'), { errorMessage });
});

app.get('/logincheck', async (req, res) => {
    const { login, password } = req.query;

    try {
        // Асинхронная проверка: есть ли пользователь с таким логином?
        const user = await User.findOne({
            where: {
                login,
            },
        });
        //(await - пока findOne что-то не найдет, дальше идти прога не будет)
        if (!user || user.password !== password) {
            // Если что-то идет не так, перенаправляем обратно на /login с сообщением об ошибке
            return res.redirect('/login?error=Неверные данные');
        }

        // Если проверка входа успешна, перенаправляем пользователя на главную, но зная роль
        req.session.name = user.name;
        req.session.login = user.login;
        req.session.role = user.role;
        return res.redirect(`/`);
    } catch (error) {
        console.error(error);
        // Перенаправляем обратно на /login с сообщением об ошибке
        return res.redirect('/login?error=Ошибка сервера');
    }
});

app.get('/edit-item/:id', (req, res) => {
    const number = req.query.number;
    Item
        .findById(req.params.id)
        .then((item) => {res.render(createPath('edit-item'), { item, number})})
        .catch((error) => {
            console.log(error);
            res.render(createPath('error'))});
});

app.put('/edit-item/:id', (req, res) => {
    const number = req.query.number;
    const {type, imgSrc, title, grammar, price, desc} = req.body;
    const id = req.params.id;
    Item
        .findByIdAndUpdate(id, {type, imgSrc, title, grammar, price, desc})
        .then((result => res.redirect(`/#${number}`)))
        .catch((error) => {
            console.log(error);
            res.render(createPath('error'))});
});

app.get('/logout', (req, res) => {
    // Очистка данных сессии
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/');
        }
    });
});

app.post('/', async (req, res) => {
    const { name, petname, vetname, time, login, status } = req.body;

    try {
        // Создание нового заказа в базе данных
        const order = await Order.create({
            name,
            petname,
            vetname,
            time,
            login,
            status,
        });

        // Отправка ответа с перенаправлением на главную страницу
        res.redirect('/?number=t1');
    } catch (error) {
        console.error(error);
        // Отправка ответа с ошибкой
        res.render(createPath('error'));
    }
});

app.get('/orders', async (req, res) => {
    const userRole = req.session.role || 'guest';
    const userLogin = req.session.login || null;

    try {
        // Асинхронный запрос к базе данных для получения всех заказов
        const orders = await Order.findAll();
        res.render(createPath('orders'), { orders, userRole, userLogin });
    } catch (error) {
        console.error(error);
        res.render(createPath('error'));
    }
});

app.put('/orders/:id', async (req, res) => {
    const { status } = req.body;
    const id = req.params.id;

    try {
        // Асинхронное обновление заказа в базе данных
        const result = await Order.update({ status }, {
            where: {
                id,
            },
        });

        console.log(result);
        res.redirect('/orders');
    } catch (error) {
        console.error(error);
        res.render(createPath('error'));
    }
});

app.post('/registration', async (req, res) => {
    const { name, login, password } = req.body;
    const role = 'user';

    try {
        // Создание нового пользователя в базе данных
        const user = await User.create({
            name,
            login,
            password,
            role,
        });

        // Отправка ответа с данными нового пользователя
        res.send("Успешная Регистрация");
    } catch (error) {
        console.error(error);
        // Отправка ответа с ошибкой
        res.render(createPath('error'));
    }
});

app.use((req, res) => {
    res
        .status(400)
        .render(createPath('error'));
});