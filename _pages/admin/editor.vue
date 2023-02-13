<template>
    <div id="editor-component">
        <iframe :src="urlIframe" name="iframe-editor" class="editor-component__iframe" allowfullscreen/>
        <!-- <form method="post" target="iframe-editor" ref="form-editor" :action="urlIframe">
            <button type="submit">Enviar</button>
        </form> -->
        <Panel/>
    </div>
</template>
<script>
    import Panel from "@imagina/qbuilder/_components/editor/panel";
    export default {
        name: "Editor",
        props: {},
        components: {
            Panel
        },
        data(){
            return {
                urlIframe: 'https://layout-4.weygo.co/'
            }
        },
        watch: {},
        mounted(){
            this.$nextTick(() => {
                //this.$refs['form-editor'].submit();
            })
        },
        computed: {},
        methods: {
            sendForm(){
                console.log("XD");
            },
        }
    }
</script>
<style lang="stylus">
    #editor-component
        .editor-component__iframe
            width: 100%
            min-height: 100vh
</style>