<template>
    <div class="container">
        <q-layout
            view="lHh Lpr lFf"
            container
            style="height: 50px"
        >
            <q-header class="bg-blue-grey q-px-md">
                <q-toolbar>
                    <q-toolbar-title>Hello {{ userName }}</q-toolbar-title>

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
            <div class="filter row justify-between">
                <q-select
                    class="col-sm-2 col-12"
                    outlined
                    v-model="apiQueryTemp.city"
                    :options="selectOptions.city"
                    :multiple="true"
                    :clearable="true"
                    clear-icon="close"
                    label="City"
                />

                <q-select
                    class="col-sm-2 col-12"
                    outlined
                    v-model="apiQueryTemp.order_status"
                    :options="selectOptions.status"
                    :clearable="true"
                    clear-icon="close"
                    label="Status"
                />

                <q-select
                    class="col-sm-2 col-12"
                    outlined
                    v-model="apiQueryTemp.financial_status"
                    :options="selectOptions.financialStatus"
                    :clearable="true"
                    clear-icon="close"
                    label="Payment"
                />

                <q-select
                    class="col-sm-2 col-12"
                    outlined
                    v-model="apiQueryTemp.fulfillment_status"
                    :options="selectOptions.fulfillmentStatus"
                    :clearable="true"
                    clear-icon="close"
                    label="Fulfillment"
                />

                <q-input
                    class="col-sm-2 col-12"
                    outlined
                    v-model="apiQueryTemp.delivery_date"
                    :clearable="true"
                    clear-icon="close"
                    label="Delivery date"
                    stack-label
                >
                    <template v-slot:append>
                        <q-icon
                            name="event"
                            class="cursor-pointer"
                        >
                            <q-popup-proxy :offset="[188, 16]">
                                <q-date
                                    v-model="apiQueryTemp.delivery_date"
                                    mask="YYYY-MM-DD"
                                ></q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>

                <q-btn
                    class="actionButton col-auto"
                    color="white"
                    text-color="black"
                    label="Reset"
                    @click="reset"
                />

                <q-btn
                    class="actionButton col-auto"
                    label="Search"
                    color="blue"
                    :loading="loading"
                    @click="search"
                />
            </div>

            <div class="table-container">
                <q-table
                    class="sticky-header-table"
                    :rows="rows"
                    :columns="columns"
                    row-key="name"
                    :rows-per-page-options="pagination.pageSize"
                    v-model:pagination="pagination"
                    :loading="loading"
                    rows-per-page-label="Orders per page"
                >
                    <template v-slot:loading>
                        <q-inner-loading
                            showing
                            color="primary"
                        />
                    </template>

                    <template v-slot:top>
                        <div v-show="showTopPage">
                            <q-pagination
                                v-model="page"
                                color="grey-8"
                                text-color="white"
                                :max="pagination.totalPage"
                                :max-pages="6"
                                size="md"
                                direction-links
                            />
                        </div>
                    </template>

                    <template v-slot:body-cell-order_status="props">
                        <q-td :props="props">
                            <div>
                                <q-badge
                                    :color="convertColor(props)"
                                    :label="props.value"
                                />
                            </div>
                        </q-td>
                    </template>

                    <template v-slot:pagination="scope">
                        <div class="pagination">
                            <q-pagination
                                v-model="page"
                                color="grey-8"
                                text-color="white"
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
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

import { useQuasar } from 'quasar';
import dayjs from 'dayjs';
import { API, responseFilter } from '@/helpers/';

const router = useRouter();
const $q = useQuasar();
const $dayJs = dayjs();
const today = $dayJs.format('YYYY-MM-DD');

const userName = JSON.parse(localStorage.getItem('auth'))?.username ?? null;

const apiQueryDefault = ref({
    city: [],
    delivery_date: null,
    financial_status: null,
    fulfillment_status: null,
    order_status: null,
});
const apiQuery = ref(JSON.parse(JSON.stringify(apiQueryDefault.value)));
const apiQueryTemp = ref({ ...JSON.parse(JSON.stringify(apiQueryDefault.value)), delivery_date: today });

const page = ref(1);
const pagination = ref({
    rowsPerPage: 10,
    sortBy: 'created_at',
    descending: true,
    pageSize: [5, 10, 20, 50, 70, 100],
    totalPage: 0,
});

const loading = ref(false);

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
    { name: 'total_price', label: 'Price', field: 'total_price', sortable: true, format: (price) => convertPrice(price) },
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
    loading.value = true;

    const params = {
        ...apiQuery.value,
        page: page.value - 1,
        is_descending: pagination.value.descending,
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
    loading.value = false;
}

function logout() {
    localStorage.removeItem('auth');
    router.push({ name: 'login' });
}

function search() {
    apiQuery.value = {
        ...JSON.parse(JSON.stringify(apiQueryTemp.value)),
        delivery_date: apiQueryTemp.value.delivery_date === '' ? null : apiQueryTemp.value.delivery_date,
    };
    page.value === 1 ? getOrder() : (page.value = 1);
}

function reset() {
    apiQueryTemp.value = JSON.parse(JSON.stringify(apiQueryDefault.value));
}

function convertPrice(value) {
    const price = value.toString().split('.');
    price[0] = price[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${price.join('.')}`;
}

function convertColor(item) {
    switch (item.value) {
        case 'open':
            return 'blue';
        case 'cancelled':
            return 'red';
        case 'closed':
            return 'grey-8';
        default:
    }
}

// computed
const showTopPage = computed(() => {
    return pagination.value.rowsPerPage >= 20 && rows.value.length >= 20;
});

// watch
watch([pagination, () => page.value], (newVal, oldVal) => {
    getOrder();
});
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
        margin-bottom: 20px;
        gap: 0 5px;
    }

    .q-table__container {
        :deep(.q-table__top) {
            justify-content: end;
            padding-right: 14px;
        }
    }
}

@media screen and (max-width: 600px) {
    .filter {
        justify-content: flex-end;

        .actionButton {
            margin-top: 20px;
        }
    }
}
</style>
