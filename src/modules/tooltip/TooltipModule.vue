<template>
    <div>
        <TooltipBox />
        <LocationPopup />
    </div>
</template>

<script>
import TooltipBox from './components/TooltipBox'
import LocationPopup from './components/LocationPopup'

export default {
    components: {
        TooltipBox,
        LocationPopup,
    },
}
</script>
