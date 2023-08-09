import axios from 'axios';

const $axios = axios.create({
    baseURL: 'https://dev.tapgo.cc/test/',
    timeout: 30 * 1000,
});

$axios.interceptors.request.use(
    function (config) {
        config.headers['Authorization'] = JSON.parse(localStorage.getItem('auth'))?.token ?? null;
        return config;
    },
    function (error) {
        return error;
    },
);

$axios.interceptors.response.use(
    function (response) {
        const { status, data } = response;
        let result = {
            status,
            data,
        };

        return result;
    },

    function (error) {
        const { status, data } = error.response;
        let result = {
            status,
            data,
        };

        return result;
    },
);

export const Login = async function (data) {
    let result = await $axios.post('/auth/login', data);

    return result;
};

export const GetOrder = async function (query) {
    let params = {
        ...query,
    };
    let result = await $axios.get('/orders', { params });

    return result;
};
