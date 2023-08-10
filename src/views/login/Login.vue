<template>
    <div class="container">
        <h1 class="q-mb-xl">LOGIN</h1>

        <div
            class="q-pa-md"
            style="min-width: 400px"
        >
            <q-form
                @submit="login"
                class="q-gutter-md"
            >
                <q-input
                    filled
                    v-model="loginForm.username"
                    label="Account"
                    lazy-rules
                    :rules="[(val) => (val && val.length > 0) || 'Account is required']"
                />

                <q-input
                    filled
                    v-model="loginForm.password"
                    label="Password"
                    :type="hidePassword ? 'password' : 'text'"
                    :rules="[(val) => (val && val.length > 0) || 'Password is required']"
                >
                    <template v-slot:append>
                        <q-icon
                            :name="hidePassword ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="hidePassword = !hidePassword"
                        />
                    </template>
                </q-input>

                <q-toggle
                    v-model="rememberMe"
                    label="Remember me"
                />

                <div class="login-button">
                    <q-btn
                        label="Login"
                        type="submit"
                        color="primary"
                        :loading="loading"
                    />
                </div>
            </q-form>

            <div class="footer">
                <span>Made by Ivan</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useQuasar } from 'quasar';
import { API, responseFilter } from '@/helpers/';

const router = useRouter();
const $q = useQuasar();

const hidePassword = ref(true);

const rememberMe = ref(false);

const loading = ref(false);

const loginForm = ref({
    username: '',
    password: '',
});

async function login() {
    loading.value = true;

    const payload = loginForm.value;
    const result = await API.Login(payload);

    if (result.status !== 200) {
        responseFilter(result.status, $q);
        localStorage.removeItem('auth');

        loading.value = false;
        return null;
    }

    localStorage.setItem('auth', JSON.stringify(result.data));

    if (rememberMe.value) {
        localStorage.setItem('userInfo', JSON.stringify(payload));
    } else {
        localStorage.removeItem('userInfo');
    }

    loading.value = false;
    router.push({ name: 'order' });
}

function checkRememberMe() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!!userInfo) {
        const { username, password } = userInfo;
        loginForm.value.username = username;
        loginForm.value.password = password;

        rememberMe.value = true;
    }
}
checkRememberMe();
</script>

<style scoped lang="scss">
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;

    .login-button {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .footer {
        margin-top: 50px;
        width: 100%;
        text-align: right;
        color: gray;
    }
}
</style>
