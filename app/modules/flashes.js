'use strict'
require('regenerator-runtime/runtime');
import { $ } from './bling';

const catchErrors = (fn, options = {}) => function() {
    const { msg, onFail } = options;
    removeErrorFlash();
    return fn(...arguments).catch(err => {
        onFail && onFail();
        newErrorFlash(err, msg);
        console.log("Handled by .catch")
    });
}

const newErrorFlash = (err, msg) => {
    console.log(err);
    removeErrorFlash();
    const flashDiv = $(".client-flash");
    const p = $(".client-flash > .alert > p")
    p.innerText = (err.specific && err.message) || msg || (err && err.message) || err;
    flashDiv.style.display = "block";
    $(".remove-client-flash").on("click", removeErrorFlash);
}

const removeErrorFlash = () => {
    const flashDiv = $(".client-flash");
    const p = $(".client-flash > .alert > p")
    flashDiv.style.display = "none";
    p.innerText = "";
}

export { newErrorFlash, removeErrorFlash, catchErrors };