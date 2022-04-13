export const jsonParse = (jsonStr: string) => {
    let idx = 0;

    const parseValue = (): any => {
        skipSpaces();

        const value = parseObj()
        ?? parseArray()
        ?? parseString()
        ?? parseNum()
        ?? parseTrue()
        ?? parseFalse()
        ?? parseNull();

        skipSpaces();

        return value;
    };

    const parseObj = (): object | undefined => {
        if (getChar() !== "{") return undefined;
        /* Move to char next to "{" */
        moveNext();
        /* Consume the white spaces */
        skipSpaces();

        const obj: {[index: string]: any} = {};
        let initial = true;
        while(getChar() !== "}") {
            /* Check for comma if not initial key-value pair */
            if (!initial) consumeComma();
            skipSpaces();
            /* Parse the key */
            const key = parseString();
            skipSpaces();
            if (key === undefined) { throw "Expected key but got nothing"; }
            /* Check colon */
            consumeColon();
            /* Parse the value */
            obj[key] = parseValue();
            initial = false;
        }

        /* Move to char next to "}" */
        moveNext();
        /* Return the parsed object */
        return obj;
    }

    const parseArray = (): any[] | undefined => {
        if (getChar() !== "[") return;
        /* Move to char next to "[" */
        moveNext();

        const array: any[] = [];
        let initial = true;
        while (getChar() !== "]") {
            /* If not the first item, check for comma */
            if (!initial) consumeComma();
            array.push(parseValue());
            initial = false;
        }

        /* Move to char next to "]" */
        moveNext();
        return array;
    }

    const parseString = (): string | undefined => {
        if (getChar() !== `"`) return undefined;
        moveNext();
        const start = idx;
        //TODO: This does not consider escaped `"`
        const end = jsonStr.indexOf('"', idx + 1);
        /* If there is no closing double quote, throw error */
        if (end < 0) expectedButGotNothing(`"`);
        /* Move to char next to `"` */
        idx = end + 1;
        return jsonStr.slice(start, end)
    };

    const parseNum = (): number | undefined => {
        const start = idx;
        /* Integral part */
        if (getChar() === "-") moveNext();
        if (getChar() === "0") moveNext();
        else consumeDigits();
        /* Fractional part */
        if (jsonStr[idx] === ".") { moveNext(); consumeDigits(); }
        /* Exponent */
        if (["e", "E"].includes(jsonStr[idx])) {
            moveNext();
            if (["+", "-"].includes(jsonStr[idx])) idx++;
            consumeDigits();
        }

        if (start === idx) return undefined;
        return Number(jsonStr.slice(start, idx));
    }

    const parseTrue = (): boolean | undefined => parseSingleValue("true", true);

    const parseFalse = (): boolean | undefined => parseSingleValue("false", false);

    const parseNull = (): null | undefined => parseSingleValue("null", null);

    const parseSingleValue = <T>(strValue: string, returnValue: T): T | undefined => {
        if (jsonStr.slice(idx, idx + strValue.length) !== strValue) return undefined;
        idx += strValue.length;
        return returnValue;
    }

    const consumeComma = (): void => {
        if (getChar() === ",") moveNext();
        else throw expectedButGot(":", getChar());
    };

    const consumeColon = (): void => {
        if (getChar() === ":") moveNext();
        else throw expectedButGot(",", getChar());
    };

    const skipSpaces = (): void =>  { while ([" ", "\n", "\r", "\t"].includes(getChar())) moveNext(); };

    const consumeDigits = (): void => { while (!isNaN(parseInt(getChar()))) moveNext(); }

    const getChar = (): string => {
        return jsonStr[idx];
    }

    const moveNext = (): void => { idx++; }

    return parseValue();
}

const expectedButGot = (expected: string, actual: string): string => `Expected ${expected} but got ${actual}`;
const expectedButGotNothing = (expected: string) => `Expected ${expected} but found no occurrence of it`;