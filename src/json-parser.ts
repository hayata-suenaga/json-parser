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
        idx++;
        /* Object can be empty. Consume the white spaces */
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
        idx++;
        /* Return the parsed object */
        return obj;
    }

    const parseArray = (): any[] | undefined => {
        if (getChar() !== "[") return;
        /* Move to char next to "[" */
        idx++;

        const array: any[] = [];
        let initial = true;
        while (getChar() !== "]") {
            /* If not the first item, check for comma */
            if (!initial) consumeComma();
            array.push(parseValue());
            initial = false;
        }

        /* Move to char next to "]" */
        idx++;
        return array;
    }

    const parseString = (): string | undefined => {
        if (getChar() !== `"`) return undefined;
        idx++;
        const start = idx;
        //TODO: This does not consider escaped `"`
        const end = jsonStr.indexOf('"', idx + 1);

        /* Move to char next to `"` */
        idx = end + 1;
        return jsonStr.slice(start, end)
    };

    const parseNum = (): number | undefined => {
        const start = idx;
        /* Integral part */
        if (getChar() === "-") idx++;
        if (getChar() === "0") idx++;
        else consumeDigits();
        /* Fractional part */
        if (jsonStr[idx] === ".") { idx++; consumeDigits(); }
        /* Exponent */
        if (["e", "E"].includes(jsonStr[idx])) {
            idx++;
            if (["+", "-"].includes(jsonStr[idx])) idx++;
            consumeDigits();
        }

        if (start === idx) return undefined;
        return parseInt(jsonStr.slice(start, idx));
    }

    const parseTrue = (): boolean | undefined => parseSingleValue("true", true);

    const parseFalse = (): boolean | undefined => parseSingleValue("false", false);

    const parseNull = (): null | undefined => parseSingleValue("null", null);

    const parseSingleValue = <T>(strValue: string, returnValue: T): T | undefined => {
        if (jsonStr.slice(idx, idx + strValue.length) !== strValue) return undefined;
        idx += strValue.length;
        return returnValue;
    }

    const getChar = (): string => jsonStr[idx];

    const consumeComma = (): void => { if (getChar() === ",") idx++ };

    const consumeColon = (): void => { if (getChar() === ":") idx++ };

    const skipSpaces = (): void =>  { while ([" ", "\n", "\r", "\t"].includes(getChar())) idx++; };

    const consumeDigits = (): void => { while (!isNaN(parseInt(getChar()))) idx++; }

    return parseValue();
}