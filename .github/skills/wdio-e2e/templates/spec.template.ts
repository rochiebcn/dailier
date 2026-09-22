import {{PageObject}} from '../../pageobjects/{{pageFile}}';

describe('Feature: {{featureName}}', () => {

    beforeEach(async () => {
        await browser.url('{{basePath}}');
    });

    it('should execute {{scenarioName}}', async () => {

        {{#each steps}}
        {{this}}
        {{/each}}

    });
});