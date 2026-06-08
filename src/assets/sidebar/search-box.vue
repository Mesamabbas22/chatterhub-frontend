<script setup>
defineProps({
    msg: {
        type: String,
        required: true,
    },
})
</script>

<template>
    <div class="search-box">
        <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control" placeholder="Search conversations...">
        </div>
    </div>
</template>
