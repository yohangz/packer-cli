import { conf } from './conf2';

describe('A suite is just a function', function () {
    var a;

    it('and so is a spec', function () {
        a = true;

        expect(conf.lang).toBe('Typescript 2');

        expect(a).toBe(true);
    });
});
