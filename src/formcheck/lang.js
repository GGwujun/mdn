export function USPhone(val) {
    return /^\(?(\d{3})\)?[\- ]?\d{3}[\- ]?\d{4}$/.test(val);
}

// matches mm/dd/yyyy (requires leading 0's (which may be a bit silly, what do you think?)
export function date(val) {
    return /^(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[01])\/(?:\d{4})/.test(val);
}


export function email(val) {
    return /^(?:\w+\.?\+?)*\w+@(?:\w+\.)+\w+$/.test(val);
}

export function minLength(val, length) {
    return val.length >= length;
}

export function maxLength(val, length) {
    return val.length <= length;
}

export function equal(val1, val2) {
    return (val1 == val2);
} 