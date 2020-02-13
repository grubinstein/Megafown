'use strict'
require('regenerator-runtime/runtime');
import { $ } from './bling';

const catchErrors = (fn, options) => async () => {
    if(options) {
        const { msg, onFail } = options;
    };
    removeErrorFlash();
    return await fn(...arguments).catch(err => {
        onFail && onFail();
        newErrorFlash(err, msg);
    });
}

const newErrorFlash = (err, msg) => {
    console.log(err);
    removeErrorFlash();
    const flashDiv = $(".client-flash");
    const text = $(".client-flash > .alert > p")
    text.innerText = msg || err.message || err;
    flashDiv.classList.add('showing');
    $(".remove-client-flash").on("click", removeErrorFlash);
}

const removeErrorFlash = () => {
    const flashDiv = $(".client-flash");
    const text = $(".client-flash > .alert > p")
    flashDiv.classList.remove("showing");
    text.innerText = "";
}

export { newErrorFlash, removeErrorFlash, catchErrors };