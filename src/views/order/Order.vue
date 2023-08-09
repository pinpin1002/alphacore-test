<template>
    <div class="container">
        <q-layout view="lHh Lpr lFf" container style="height: 50px">
            <q-header class="bg-blue-grey">
                <q-toolbar>
                    <q-toolbar-title>Hello {{ userName }}</q-toolbar-title>

                    <q-btn color="white" text-color="black" label="Log out" @click="logout" />
                </q-toolbar>
            </q-header>
        </q-layout>

        <div class="q-pa-md">
            <div class="filter">
                <q-select outlined v-model="apiQuery.city" :options="selectOptions.city" :multiple="true" label="City" />

                <q-input outlined v-model="apiQuery.delivery_date" type="date" mask="date"> </q-input>

                <q-select outlined v-model="apiQuery.order_status" :options="selectOptions.status" :clearable="true" label="Status" />

                <q-select outlined v-model="apiQuery.financial_status" :options="selectOptions.financialStatus" :clearable="true" label="Payment" />

                <q-select
                    outlined
                    v-model="apiQuery.fulfillment_status"
                    :options="selectOptions.fulfillmentStatus"
                    :clearable="true"
                    label="Fulfillment"
                />

                <q-btn class="search" color="white" text-color="black" label="Reset" @click="reset" />

                <q-btn class="search" color="primary" label="Search" @click="search" />
            </div>
            <div class="table-container">
                <q-table :rows="rows" :columns="columns" row-key="name" :rows-per-page-options="pagination.pageSize" v-model:pagination="pagination">
                    <template v-slot:top>
                        <div v-show="true">
                            <q-pagination
                                v-model="apiQuery.page"
                                color="grey-8"
                                :max="pagination.totalPage"
                                :max-pages="6"
                                size="md"
                                direction-links
                            />
                        </div>
                    </template>

                    <template v-slot:pagination="scope">
                        <div class="pagination">
                            <q-pagination
                                v-model="apiQuery.page"
                                color="grey-8"
                                :max="pagination.totalPage"
                                :max-pages="6"
                                size="md"
                                direction-links
                            />
                        </div>
                    </template>
                </q-table>
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

const userName = JSON.parse(localStorage.getItem('auth'))?.username ?? null;

const apiQueryDefault = ref({
    city: [],
    delivery_date: null,
    financial_status: null,
    fulfillment_status: null,
    order_status: null,
    page: 1,
});
const apiQuery = ref(JSON.parse(JSON.stringify(apiQueryDefault.value)));
const pagination = ref({
    rowsPerPage: 10,
    sortBy: 'created_at',
    descending: false,
    pageSize: [5, 10, 20, 50, 70, 100],
    totalPage: 0,
});

const columns = [
    {
        name: 'order_name',
        required: true,
        label: 'Order',
        align: 'left',
        field: 'order_name',
        sortable: true,
    },
    {
        name: 'customer_name',
        align: 'center',
        label: 'Customer',
        field: 'customer_name',
    },
    { name: 'total_price', label: 'Price', field: 'total_price', sortable: true, format: (price) => priceConvert(price) },
    { name: 'receiver_address', label: 'Address', field: 'receiver_address', sortable: true },
    {
        name: 'delivery_date',
        label: 'Delivery Date',
        field: 'delivery_date',
        sortable: true,
    },
    {
        name: 'created_at',
        label: 'Time',
        field: 'created_at',
        sortable: true,
    },
    {
        name: 'order_status',
        label: 'Status',
        field: 'order_status',
    },
    {
        name: 'financial_status',
        label: 'Payment',
        field: 'financial_status',
    },
    {
        name: 'fulfillment_status',
        label: 'Fulfillment',
        field: 'fulfillment_status',
    },
];

const rows = ref([]);

const selectOptions = ref({
    city: ['台北市', '新北市', '新竹市', '台南市', '高雄市'],
    status: ['open', 'cancelled', 'closed'],
    financialStatus: ['paid', 'pending', 'refunded'],
    fulfillmentStatus: ['received', 'preparing'],
});

async function getOrder() {
    const params = {
        ...apiQuery.value,
        page: apiQuery.value.page - 1,
        is_descending: pagination.descending,
        size: pagination.value.rowsPerPage,
        sort_by: pagination.value.sortBy,
    };
    const result = await API.GetOrder(params);
    const { data, status } = result;

    if (status !== 200) {
        responseFilter(result.status, $q);
        localStorage.removeItem('auth');

        router.push({ name: 'login' });

        return null;
    }

    rows.value = data.content;
    pagination.value.totalPage = data.total_pages;

    console.log(data);
}

getOrder();

function priceConvert(value) {
    const price = value.toString().split('.');
    price[0] = price[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${price.join('.')}`;
}

function logout() {
    localStorage.removeItem('auth');
    router.push({ name: 'login' });
}

function search() {
    getOrder();
}

function reset() {
    apiQuery.value = JSON.parse(JSON.stringify(apiQueryDefault.value));
}
</script>

<style scoped lang="scss">
.container {
    .q-toolbar,
    .table-container,
    .filter {
        max-width: 1400px;
        margin: 0 auto;
    }

    .q-toolbar {
        padding: 0;
    }

    .filter {
        display: flex;
        margin-bottom: 20px;

        gap: 0 20px;

        > label {
            flex: 1;
        }
        .search {
            flex-basis: 50px;
        }
    }

    .q-table__container {
        :deep(.q-table__top) {
            justify-content: end;
            padding-right: 14px;
        }
    }
}
</style>
