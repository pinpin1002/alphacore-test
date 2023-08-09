<template>
    <div class="container">
        <q-layout
            view="lHh Lpr lFf"
            container
            style="height: 50px"
        >
            <q-header class="bg-blue-grey">
                <q-toolbar>
                    <q-toolbar-title>Hello {{userName}}</q-toolbar-title>

                    <q-btn
                        color="white"
                        text-color="black"
                        label="Log out"
                        @click="logout"
                    />
                </q-toolbar>
            </q-header>
        </q-layout>

        <div class="q-pa-md">
            <div class="filter">
                <q-select
                    outlined
                    v-model="apiQuery.city"
                    :options="selectOptions.city"
                    :multiple="true"
                    label="City"
                />

                <q-input
                    outlined
                    v-model="apiQuery.delivery_date"
                    type="date"
                    mask="date"
                >
                </q-input>

                <q-select
                    outlined
                    v-model="apiQuery.order_status"
                    :options="selectOptions.status"
                    :clearable="true"
                    label="Status"
                />

                <q-select
                    outlined
                    v-model="apiQuery.financial_status"
                    :options="selectOptions.financialStatus"
                    :clearable="true"
                    label="Payment"
                />

                <q-select
                    outlined
                    v-model="apiQuery.fulfillment_status"
                    :options="selectOptions.fulfillmentStatus"
                    :clearable="true"
                    label="Fulfillment"
                />

                <q-btn
                    class="search"
                    color="white"
                    text-color="black"
                    label="Reset"
                    @click="reset"
                />

                <q-btn
                    class="search"
                    color="primary"
                    label="Search"
                    @click="search"
                />
            </div>
            <div class="table-container">
                <q-table
                    :rows="rows"
                    :columns="columns"
                    row-key="name"
                    :rows-per-page-options="[]"
                >
                    <template v-slot:top>
                        <div v-show="true">
                            <q-pagination
                                v-model="pagination.page"
                                color="grey-8"
                                :max="10"
                                size="md"
                            />
                        </div>
                    </template>

                    <template v-slot:pagination="scope">
                        <div class="pagination">
                            <div class="arrow arrow-left">
                                <svg viewBox="0 0 24 24">
                                    <path
                                        fill="#616161"
                                        d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
                                    ></path>
                                </svg>
                            </div>
                            <q-pagination
                                v-model="pagination.page"
                                color="grey-8"
                                :max="10"
                                size="md"
                            />
                            <div class="arrow arrow-right">
                                <svg viewBox="0 0 24 24">
                                    <path
                                        fill="#616161"
                                        d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
                                    ></path>
                                </svg>
                            </div>
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
    is_descending: true,
    order_status: null,
    page: 0,
    size: 20,
    sort_by: 'created_at',
});
const apiQuery = ref(JSON.parse(JSON.stringify(apiQueryDefault.value)));

const pagination = ref({
    sortBy: 'created_at',
    descending: false,
    page: 1,
    rowsPerPage: 5,
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
    { name: 'created_at', label: 'Time', field: 'created_at', sortable: true },
    {
        name: 'order_status',
        label: 'Status',
        field: 'order_status',
        sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
    },
    {
        name: 'financial_status',
        label: 'Payment',
        field: 'financial_status',
        sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
    },
    {
        name: 'fulfillment_status',
        label: 'Fulfillment',
        field: 'fulfillment_status',
        sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
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
    const params = apiQuery.value;
    const result = await API.GetOrder(params);
    const { data, status } = result;

    if (status !== 200) {
        responseFilter(result.status, $q);
        localStorage.removeItem('auth');

        router.push({ name: 'login' });

        return null;
    }

    rows.value = data.content;

    console.log(result);
}

getOrder();

function priceConvert(value) {
    const price = value.toString().split('.');
    price[0] = price[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${price.join('.')}`;
}

function logout(value) {
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
        .pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            .arrow {
                color: #fff;
                width: 28px;
                height: 30px;
                display: flex;
                align-items: center;
                cursor: pointer;
                svg {
                    color: #fff;
                }
                &.arrow-right {
                    transform: scale(-1);
                }
            }
        }
    }
}
</style>
