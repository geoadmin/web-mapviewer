<template>
    <div class="flex flex-col gap-2 p-2">
        <div class="grid grid-cols-6 gap-2 text-center">
            <span class="text-left">Theme / Variant</span>
            <span>no variant</span>
            <span>solid variant</span>
            <span>subtle variant</span>
            <span>outline variant</span>
            <span>soft variant</span>
        </div>
        <div class="grid grid-cols-6 gap-2">
            <span>Default</span>
            <SwissGeoButton> Button </SwissGeoButton>
            <SwissGeoButton variant="solid"> Button </SwissGeoButton>
            <SwissGeoButton variant="subtle"> Button </SwissGeoButton>
            <SwissGeoButton variant="outline"> Button </SwissGeoButton>
            <SwissGeoButton variant="soft"> Button </SwissGeoButton>
        </div>
        <div class="grid grid-cols-6 gap-2">
            <span>Primary</span>
            <SwissGeoButton theme="primary">Button</SwissGeoButton>
            <SwissGeoButton
                theme="primary"
                variant="solid"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="primary"
                variant="subtle"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="primary"
                variant="outline"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="primary"
                variant="soft"
            >
                Button
            </SwissGeoButton>
        </div>
        <div class="grid grid-cols-6 gap-2">
            <span>Warning</span>
            <SwissGeoButton theme="warning">Button</SwissGeoButton>
            <SwissGeoButton
                theme="warning"
                variant="solid"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="warning"
                variant="subtle"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="warning"
                variant="outline"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="warning"
                variant="soft"
            >
                Button
            </SwissGeoButton>
        </div>
        <div class="grid grid-cols-6 gap-2">
            <span>Error</span>
            <SwissGeoButton theme="error">Button</SwissGeoButton>
            <SwissGeoButton
                theme="error"
                variant="solid"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="error"
                variant="subtle"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="error"
                variant="outline"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="error"
                variant="soft"
            >
                Button
            </SwissGeoButton>
        </div>
        <div class="grid grid-cols-6 gap-2">
            <span>Success</span>
            <SwissGeoButton theme="success">Button</SwissGeoButton>
            <SwissGeoButton
                theme="success"
                variant="solid"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="success"
                variant="subtle"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="success"
                variant="outline"
            >
                Button
            </SwissGeoButton>
            <SwissGeoButton
                theme="success"
                variant="soft"
            >
                Button
            </SwissGeoButton>
        </div>
    </div>
</template>
