<template>
    <div
        ref="toTopButton"
        class="backToTopButton"
    >
        <q-btn
            round
            color="orange"
            @click="backToTop"
        >
            <q-icon name="keyboard_arrow_up" />
        </q-btn>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const toTopButton = ref(null);

onMounted(() => {
    window.addEventListener('scroll', showButton);
});

function showButton() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        toTopButton.value.style.display = 'block';
    } else {
        toTopButton.value.style.display = 'none';
    }
}

function backToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<style scoped lang="scss">
.backToTopButton {
    display: none;
    position: fixed;
    bottom: 30px;
    right: 30px;
    opacity: 0.8;
}
</style>
