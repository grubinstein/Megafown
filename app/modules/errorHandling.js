'use strict'
require('regenerator-runtime/runtime');
import { $ } from './bling';

/**
 * Wraps function, returning new function that will catch errors, present an optional user-friendly error (or actual error) in a flash, log actual error to the console, and run and optional callback on error
 * @param {function} fn - Function to be wrapped
 * @param {object} options - Optional object containing: {msg: String to replace actual error in flash, onFail: function to run on error for cleanup}
 * @returns {function} - Wrapped function 
 */
const catchErrors = (fn, { msg, onFail } = {}) => function() {
    removeErrorFlash();
    return fn(...arguments).catch(err => {
        onFail && onFail();
        newErrorFlash(err, msg);
        console.log("Handled by .catch")
    });
}

/**
 * Presents flash to user and logs error to console. For flash will prefer messages from errors with "specific" parameter > msg > message from other errors > errors
 * @param {Error} err - Error to log to console (and possibly show in flash) 
 * @param {string} msg - User friendly error message for flash
 */
const newErrorFlash = (err, msg) => {
    err & console.log(err);
    removeErrorFlash();
    const flashDiv = $(".client-flash");
    const p = $(".client-flash > .alert > p")
    p.innerText = (err && err.specific && err.message) || msg || (err && err.message) || err;
    flashDiv.style.display = "block";
    $(".remove-client-flash").on("click", removeErrorFlash);
}

/**
 * Removes any error flashes present on screen
 */
const removeErrorFlash = () => {
    const flashDiv = $(".client-flash");
    const p = $(".client-flash > .alert > p")
    flashDiv.style.display = "none";
    p.innerText = "";
}

/**
 * Creates error with specific parameter so if caught by catchErrors the message will be shown to the user
 * @param {string} msg 
 */
const newUserFriendlyError = (msg) => {
    const err = new Error(msg);
    err.specific = true;
    return err;
}

const promiseTimeout = (ms, promise) => {

    let timeout = new Promise((resolve, reject) => {
      let id = setTimeout(() => {
        clearTimeout(id);
        resolve(false)
      }, ms)
    })
  
    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeout
    ])
  }

export { newErrorFlash, removeErrorFlash, catchErrors, newUserFriendlyError, promiseTimeout };