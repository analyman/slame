import * as gl from './global'
import * as utils from './utils'

function select_section() {
    if (gl.in_home_section)    gl.home_button.classList.add("active");
    if (gl.in_archive_section) gl.archive_button.classList.add("active");
    if (gl.in_about_section)   gl.about_button.classList.add("active");
}

export function do_misc() {
    utils.register_function_call(select_section);

    /** tags and categories toggle */
    utils.register_function_call(() => {
        gl.tags_button.addEventListener("click", function (ev: MouseEvent) {
            this.classList.toggle("click-show");
        })
        gl.category_button.addEventListener("click", function () {
            this.classList.toggle("click-show");
        });
    });

    /** goto top handler */
    utils.register_function_call(() => {
        utils.timeout_add_class(gl.goto_top, "hide", true, 3000, (e, func) => {
            document.addEventListener("scroll", (ev: Event) => {
                func()
            });
        });
    });
}

