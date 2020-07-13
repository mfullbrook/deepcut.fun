<template>
    <v-calendar color="green" is-dark is-expanded :attributes="jsDates" firstDayOfWeek="2" />
</template>

<script>
    export default {
        props: ['dates'],
        mounted () {
            console.log(this.jsDates);
        },
        computed: {
            jsDates() {
                return this.dates.map(item => {
                    if (item.is_open) {
                        return new Date(item.date)
                    }
                    return null;
                }).filter(Boolean).map(date => {
                    return {
                        highlight: true,
                        dates: date
                    }
                })

            }
        }
    }
</script>
