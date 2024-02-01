<template>
    <section id="panel-editor-component">
        <draggable v-model="myArray" group="components" @start="drag = true" @end="drag = false">
            <div class="panel-editor-component__component" v-for="element in myArray" :key="element.id">{{ element.name }}</div>
        </draggable>
    </section>
</template>
<script>
import draggable from 'vuedraggable'
export default {
    name: "Panel",
    props: {},
    components: {
        draggable
    },
    data() {
        return {
            myArray: [
                {
                    "name": "Component 1",
                    "order": 1,
                    "fixed": false
                },
                {
                    "name": "Component 2",
                    "order": 2,
                    "fixed": false
                },
                {
                    "name": "Component 3",
                    "order": 3,
                    "fixed": false
                },
                {
                    "name": "Component 4",
                    "order": 4,
                    "fixed": false
                },
                {
                    "name": "Component 5",
                    "order": 5,
                    "fixed": false
                },
            ]
        }
    },
    watch: {},
    computed: {},
    methods: {}
}
</script>
<style lang="scss">
    #panel-editor-component
        position: absolute;
        top: 20%;
        right: 100px;
        min-height: 500px;
        width: 300px;
        background-color: white;
        border-radius: 10px;
        border: 1px solid #ccc;

        .panel-editor-component__component
            width: 100%;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid black;
            &:last-child{
                border: none;
            }
</style>
