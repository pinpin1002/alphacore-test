<template>
	<div class="container">
		<h1 class="q-mb-xl">Log In</h1>
		<div class="q-pa-md" style="min-width: 400px">
			<q-form @submit="onSubmit" class="q-gutter-md">
				<q-input
					filled
					v-model="loginParams.username"
					label="Account"
					lazy-rules
					:rules="[(val) => (val && val.length > 0) || 'Please type something']"
				/>

				<q-input
					filled
					v-model="loginParams.password"
					label="Password"
					:type="showPassword ? 'password' : 'text'"
					:rules="[(val) => (val && val.length > 0) || 'Please type something']"
				>
					<template v-slot:append>
						<q-icon
							:name="showPassword ? 'visibility_off' : 'visibility'"
							class="cursor-pointer"
							@click="showPassword = !showPassword"
						/>
					</template>
				</q-input>

				<q-toggle v-model="rememberMe" label="Remember me" />

				<div class="login-button">
					<q-btn label="Login" type="submit" color="primary" />
				</div>
			</q-form>
		</div>
	</div>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref } from "vue";

const $q = useQuasar();

const showPassword = ref(true);

const rememberMe = ref(false);

const loginParams = ref({
	username: "",
	password: "",
});

function onSubmit() {
	$q.notify({
		color: "green-4",
		textColor: "white",
		icon: "cloud_done",
		message: "Submitted",
	});
}
</script>

<style lang="scss">
.login-button {
	display: flex;
	align-items: center;
	justify-content: center;
}
.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
}
</style>
