import * as utils from './utils'
import * as gl from './global'
import { assert_expr } from './utils'
import * as fold from './fold'

/** generate Table of Contents base on <h?> tags */

class TOCEntry {
    private m_classList: string[];
    private m_level: number;
    private m_children: TOCEntry[];
    private m_link: string;
    private m_name: string;

    private generate_html(no: number, show_title: boolean): string {
        let ret = "<div";
        if(this.m_classList.length > 0) {
            ret += " class='";
            for(let cls of this.m_classList)
                ret += (" " + cls);
            ret += "'";
        }
        ret += ">";

        if(show_title) {
            ret += "<div class='toc-title'>";
            ret += `<div><span class='toc-number'>${no + 1}</span><a href="${this.m_link}">${this.m_name}</a></div>`;
            /** toggle hide-the-toc class of this controller to switch the icon */
            if (this.m_children.length > 0) {
                ret += `<div class='toc-controller'>
                        <i class='fas fa-angle-down toc-show'></i>
                        <i class='fas fa-angle-right toc-hide'></i>
                    </div>`;
            }
            ret += "</div>";
        }

        ret += "<div class='toc-children'>";
        for(let c=0;c<this.m_children.length;c++) {
            let cld = this.m_children[c];
            ret += cld.generate_html(c, true);
        }
        ret += "</div>";

        ret += "</div>";
        return ret;
    }

    public constructor(name: string='', link: string='', level: number=-1, classList: string[] = []) {
        this.m_name = name;
        this.m_link = link;
        this.m_level = level;
        this.m_classList = classList.slice();
        this.m_children = [];
    }

    public insertChild(child: TOCEntry) {
        this.m_children.push(child);
    }

    public children(): TOCEntry[] {return this.m_children;}
    public level(): number {return this.m_level;}

    public generateHtml() {return this.generate_html(0, false);}
}

type TocEntryPredicate = (elem: HTMLElement) => boolean;
type getEntryLevel = (elem: HTMLElement) => number;

function try_toc(stack: TOCEntry[], pred: TocEntryPredicate, level: getEntryLevel,
                 elem: HTMLElement, child: boolean) {
    if(pred(elem)) {
        let l = level(elem);
        while(stack.length > 0 && l <= stack[stack.length - 1].level())
            stack.pop();
        assert_expr(stack.length > 0);
        let n = elem.innerText;
        let attr_id = elem.attributes['id'];
        let link = "#" + (attr_id ? attr_id.value : '');
        let new_entry = new TOCEntry(n, link, l, ["toc-entry"]);
        stack[stack.length - 1].insertChild(new_entry);
        stack.push(new_entry);
    }

    if(child) {
        for(let c=0;c<elem.children.length;c++) {
            let cc = elem.children[c] as HTMLElement;
            try_toc(stack, pred, level, cc, true);
        }
    }
}
function get_toc_from_html(pred: TocEntryPredicate, level: getEntryLevel): TOCEntry 
{
    let stack = [];
    let the_top = new TOCEntry('', '', 0, ['toc-first']);
    stack.push(the_top);
    let root = window.document.body;
    try_toc(stack, pred, level, root, true);
    return stack[0];
}

function getTOC(): TOCEntry {
    let valid_tag = /^[hH]([1234567])$/;
    let pred = (elem: HTMLElement) => {
        return (elem.tagName.match(valid_tag) != null &&
                elem.attributes['id'] != null &&
                elem.attributes['id'] != '');
    };
    let level = (elem: HTMLElement) => {
        let x = elem.tagName.match(valid_tag);
        utils.assert_expr(x!=null);
        return parseInt(x[1]);
    };
    return get_toc_from_html(pred, level);
}

function hide_toc() {
    gl.toc_container.classList.add("hide-toc");
    gl.toc_container.classList.remove("toc-in-show");
}

function show_toc() {
    gl.toc_container.classList.remove("hide-toc");
    gl.toc_container.classList.add("toc-in-show");
}

/** toc */
const _toc_ = `
<div class="toc-name">
TOC
</div>
`;
export function do_toc() {
    if(!gl.in_post_section) return;

    utils.register_function_call(() => {
        let toc = getTOC();
        let toc_html = toc.generateHtml();
        let toc_container = gl.toc_container;
        assert_expr(toc_container != null);
        toc_container.innerHTML = _toc_ + toc_html;

        let toc_controllers = toc_container.querySelectorAll(".toc-controller");
        for(let i=0;i<toc_controllers.length;i++) {
            let controller = toc_controllers[i] as HTMLElement;
            controller.addEventListener("click", function (ev: MouseEvent) {
                this.classList.toggle('hide-the-toc');
                let title = this.parentElement;
                let children = title.nextElementSibling;
                children.classList.toggle('toc-children-hide');
                ev.stopPropagation();
                ev.preventDefault();
            });
        }

        function reg_show_the_(elem: HTMLElement, head_id: string) {
            elem.addEventListener("click", (ev) => {
                for(let i=1;i<=6;i++) {
                    let f = document.querySelector(`h${i}[id='${head_id}']`) as HTMLElement;
                    if(f == null) continue;
                    fold.show(f);
                    return;
                }
            })
        }
        let links = toc_container.querySelectorAll(".toc-title a");
        for(let i=0;i<links.length;i++) {
            let link = links[i] as HTMLElement;
            let tag = link.attributes["href"].value.substr(1);
            reg_show_the_(link, tag);
        }

        /** hide toc */
        let toc_show = true;
        document.addEventListener("click", (ev: MouseEvent) => {
            if(!toc_show) return;
            let r = ev.target as Element;
            while (r != null) {
                if (r == gl.toc_container || r == gl.toc_switcher)
                    return;
                r = r.parentElement;
            }
            hide_toc();
        });
        document.addEventListener("scroll", (ev) => {
            if(toc_show) hide_toc();
        });

        /** toggle switcher */
        utils.timeout_add_class(gl.toc_switcher, 'hide', true, 2500, (e, f) => {
            document.addEventListener("scroll", (ev) => {
                f();
            });
        });
        gl.toc_switcher.addEventListener("click", (ev) => {
            show_toc();
        });
    });
}

