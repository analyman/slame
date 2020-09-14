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

    let goto_top_showed: boolean = false;
    let goto_top_timeout: number = 0;
    function hide_goto_top() {
        gl.goto_top.classList.add("hide");
        goto_top_showed = false;
        goto_top_timeout = 0;
    }
    function show_goto_top() {
        if(!goto_top_showed) {
            gl.goto_top.classList.remove("hide");
            goto_top_showed = true;
        } else {
            window.clearTimeout(goto_top_timeout);
        }
        goto_top_timeout = window.setTimeout(hide_goto_top, 3000);
    }

    /** goto top handler */
    utils.register_function_call(() => {
        show_goto_top();
        document.addEventListener("scroll", (ev: Event) => {
            show_goto_top();
        });
    });
}

