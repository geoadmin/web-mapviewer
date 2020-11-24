/// <reference types="cypress" />

describe('Test the deploy script', () => {

    const scriptExec = 'node scripts/deploy.js';

    const checkResult = (result, expected) => {
        const {stderr, stdout, code} = result;
        console.log(result)
        const {firstLine: expectedFirstLine, contains: expectContains, exitCode: expectedExitCode = 0} = expected
        if (expectedExitCode === 0) {
            expect(stderr).to.be.empty;
            expect(stdout).to.not.be.empty;
        } else {
            expect(stderr).to.not.be.empty;
        }
        expect(code).to.be.eq(expectedExitCode);
        if (expectedFirstLine) {
            const firstLine = (expectedExitCode === 0 ? stdout : stderr).split('\n')[0];
            expect(firstLine).to.eq(expectedFirstLine);
        }
        if (expectContains) {
            expect(expectedExitCode === 0 ? stdout : stderr).to.contain(expectContains);
        }
    };

    context('help', () => {

        const helpFirstLine = 'Usage: deploy.js <target> [options]';

        it('Shows help when no target is specified', () => {
            cy.exec(`${scriptExec}`, {failOnNonZeroExit: false})
                .then(result => {
                    expect(result.stderr).to.contain('a target is needed');
                    expect(result.stderr).to.contain(helpFirstLine)
                })
        })
        it('Shows help when --help param is used', () => {
            cy.exec(`${scriptExec} --help`)
                .then(result => checkResult(result, {firstLine: helpFirstLine}));
        })
        it('Shows target help when --help param is used with a target', () => {
            cy.exec(`${scriptExec} dev --help`)
                .then(result => checkResult(result, {contains: 'Deploy dist/* files to DEV bucket'}));
        })

    });
    context('targets', () => {

        it('Fails with exit code 1 when wrong command/target is entered', () => {
            cy.exec(`${scriptExec} a_totally_wrong_target`, {failOnNonZeroExit: false})
                .then(result => checkResult(result, {contains: 'Non-existing target specified', exitCode: 1}));
        })
        it('Fails with exit code 1 if more than 1 target is given', () => {
            cy.exec(`${scriptExec} dev int`, {failOnNonZeroExit: false})
                .then(result => checkResult(result, {
                    firstLine: 'To many arguments, only one target must be provided',
                    exitCode: 1
                }))
        })
    })
})
