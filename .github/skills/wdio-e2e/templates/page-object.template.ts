class {{PageObject}} {

    {{#each selectors}}
    get {{this.name}}() {
        return $('{{this.selector}}');
    }
    {{/each}}

    {{#each actions}}
    async {{this.name}}({{this.params}}) {
        {{#each this.steps}}
        {{this}}
    }
    {{/each}}

}

export default new {{PageObject}}();
