export const $responseFilter = function (data, $q) {
    switch (data) {
        case 401:
            $q.notify({
                type: 'negative',
                message: 'Unauthorized',
            });
            break;
        default:
    }
};
