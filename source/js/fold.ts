import * as utils from './utils';
import { assert_expr } from './utils';
import * as gl from './global';

/** fold section */

/** TODO reconstruct code, currently that seem's ugly */

/** TODO */
const save_sym = "sub_elements";
const parent_sym = "parent_head";

const fold_expr = `<span class='fold-button'>
                       <i class='fas fa-angle-down show'></i>
                       <i class='fas fa-angle-right hide'></i>
                   </span>`;
const valid_tag = /[hH]([123456])/;
const hide_elem = "--hide--";
let markdown_body_children = [];
let show_all = null;
let hide_all = null;
let show_a_elem = null;

function ignored_element(elem) {
    /** skip bibliography */
    if(elem.classList.contains("bibliography")) return true;

    return false;
}

function insert_fold_button_to_h(elem: HTMLElement)
{
    const all_h: HTMLElement[] = [];
    markdown_body_children = [];
    show_all = null;
    hide_all = null;
    show_a_elem = null;
    function get_level_by_tag(tag: string) {
        let m = tag.match(valid_tag);
        if(m == null) return 7;
        return parseInt(m[1]);
    }

    let s: HTMLElement[] = [];
    for(let i=0;i<elem.children.length;i++) {
        let c = elem.children[i];

        /** skip elements */
        if(ignored_element(c)) continue;

        markdown_body_children.push(c);
        let m = c.tagName.match(valid_tag);
        /** skip unnecessary elements */
        if(s.length == 0 && m == null)
            continue;
        let nl = get_level_by_tag(c.tagName);
        while(s.length > 0) {
            let ol = get_level_by_tag(s[s.length - 1].tagName);
            if(nl <= ol) s.pop();
            else break;
        }
        for(let j=0;j<s.length;j++) {
            let x = s[j];
            x[save_sym] = x[save_sym] || [];
            x[save_sym].push(c);
        }
        if(s.length > 0)
            c[parent_sym] = s[s.length - 1];
        if(m) {
            all_h.push(c as HTMLElement);
            s.push(c as HTMLElement);
        }
    }

    function show__(elem__: HTMLElement) {
        elem__.classList.remove("hide");
        let head: [HTMLElement, boolean][] = [];
        if (elem__[save_sym] != null) {
            for(let xyz of elem__[save_sym]) {
                let is_head = valid_tag.test(xyz.tagName);
                if (is_head) {
                    let show = !xyz.classList.contains("hide");
                    head.push([xyz, show]);
                }
                xyz.classList.remove(hide_elem);
            }
        }
        for(let [e, show] of head) {
            if (show) show__(e);
            else      hide__(e);
        }
    }
    function hide__(elem__: HTMLElement) {
        elem__.classList.add("hide");
        if (elem__[save_sym] != null) {
            for(let xyz of elem__[save_sym])
                xyz.classList.add(hide_elem);
        }
    }
    function uninstall() {
        for(let c of all_h) {
            show__(c);
            c[save_sym] = undefined;
            let bt = c.querySelector(".fold-button");
            if(bt != null && bt.parentElement == c)
                c.removeChild(bt);
        }
    }
    function show_all__() {
        for(let bb of all_h)
            show__(bb);
    }
    function hide_all__() {
        for(let bb of all_h)
            hide__(bb);
    }
    function show_a_elem__(elem: HTMLElement) {
        let idx = all_h.indexOf(elem);
        if(idx < 0) return;
        while(elem != null) {
            show__(elem);
            elem = elem[parent_sym];
        }
    }
    show_all = show_all__;
    hide_all = hide_all__;
    show_a_elem = show_a_elem__;

    for(let button of all_h) {
        if(Array.isArray(button[save_sym]) && button[save_sym].length > 0)
            button.appendChild(utils.text2html(fold_expr));

        let x = button.querySelector(".fold-button");
        if(x == null)
            continue;

        x.addEventListener("click", function (ev) {
            let n: HTMLElement = ev.target as HTMLElement;
            while(n != null && !n.tagName.toLowerCase().match(valid_tag))
                n = n.parentElement;
            if (n != null) {
                let show = !n.classList.contains("hide");
                if(show) hide__(n);
                else     show__(n);
            }
            ev.stopPropagation();
            ev.preventDefault();
        });
    }

    return uninstall;
}

function need_update(): boolean {
    let m = document.querySelector(".markdown-body") as HTMLElement;
    if (m == null) {
        console.error("bad selector");
        return false;
    }
    if(m.children.length < markdown_body_children.length) return true;
    let j=0;
    for(let i=0;i<markdown_body_children.length;i++) {
        /** skip ignored elements */
        if(ignored_element(m.children[i])) continue;

        if(m.children[i] != markdown_body_children[j])
            return true;
        j++;
    }
    if(j != markdown_body_children.length) return true;
    return false;
}

const ins = () => {
    let m = document.querySelector(".markdown-body") as HTMLElement;
    if (m == null) {
        console.error("bad selector");
        return;
    }
    return insert_fold_button_to_h(m);
}
let unins = null;

export function refresh() {
    unins && unins();
    unins = ins();
}

export function hideAll() {
    if(hide_all) hide_all();
}
export function showAll() {
    if(show_all) show_all();
}
export function show(elem: HTMLElement) {
    assert_expr(elem && elem.tagName && valid_tag.test(elem.tagName));
    if(show_a_elem) show_a_elem(elem);
}

export function do_fold() {
    let m = false;
    if (m) return;
    utils.register_function_call(() => {
        if(!gl.in_post_section) return;
        refresh();

        window.setInterval(() => {
            if(need_update()) refresh();
        }, 1000);
    });
}

