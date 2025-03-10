export const vortex_wnx = {
    maxWindowLayerCount: 256,
    maxSuperLayerCount: 32,

    wcount: 0,
    windows: [],

    Window: class {
        classList = {
            list: [],

            valueOf() {
                return this.list;
            },

            has(class_name) {
                return this.list.indexOf(class_name) >= 0;
            },

            append(class_name) {
                if(this.has(class_name))
                    return;

                this.list.push(class_name);
            },

            remove(class_name) {
                const idx = this.list.indexOf(class_name);
                if(idx >= 0)
                    this.list.splice(idx, 1);
            }
        };

        id = null;
        sz_x = 200;
        sz_y = 200;

        pos_x = -1;
        pos_y = -1;
        pos_z = 0;

        title = "Untitled window";
        
        visible = true;

        

        constructor(id, sz_x = 200, sz_y = 200) {
            this.id = id;
            this.sz_x = sz_x;
            this.sz_y = sz_y;
            this.pos_x = 0;
            this.pos_y = 0;
            this.pos_z = vortex_wnx.wcount;
            this.visible = true;

            vortex_wnx.windows.push(this);
            vortex_wnx.wcount++;
        };

        setTitle(title) {
            this.title = title;
        }

        build() {
            this.element = document.createElement("div");
            this.element.classList.add("vortex-window");
            this.element.style.width = `${this.width}px`;
            this.element.style.height = `${this.height}px`;
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
            this.element.style.zIndex = this.zIndex;

            this.element.innerHTML = `
                <div class="vortex-window-header">
                    <span>${this.title}</span>
                    <button class="vortex-close-btn">X</button>
                </div>
                <div class="vortex-window-body"></div>
            `;

            document.body.appendChild(this.element);

            this.element.querySelector(".vortex-close-btn").addEventListener("click", () => this.close());
            this.element.addEventListener("mousedown", () => this.toFront());

            this.enableDragging();
        }

        enableDragging() {
            let offset_x, offset_y;
            let isdragging = false;

            const header = this.element.querySelector(".vortex-window-header");

            header.addEventListener("mousedown", (ev) => {
                isdragging = true;

                offset_x = ev.clientX - this.element.offsetLeft;
                offset_y = ev.clientY - this.element.offsetTop;
                
                this.toFront();
            });

            document.addEventListener("mousemove", (ev) => {
                if(isdragging)
                    this.move(ev.clientX - offset_x, ev.clientY - offset_y);
            });

            document.addEventListener("mouseup", (ev) => {
                isdragging = false;
            });
        }

        create(pos_x = 0, pos_y = 0) {
            this.build();

            this.pos_x = pos_x;
            this.pos_y = pos_y;

            this.element.style.left = pos_x + "px";
            this.element.style.top = pos_y + "px";
        }

        move(n_pos_x = 0, n_pos_y = 0) {
            this.pos_x = n_pos_x;
            this.pos_y = n_pos_y;

            this.element.style.left = this.pos_x + "px";
            this.element.style.top = this.pos_y + "px";
        }

        resize(n_sz_x, n_sz_y) {
            this.sz_x = n_sz_x;
            this.sz_y = n_sz_y;

            this.element.style.width = n_sz_x + "px";
            this.element.style.height = n_sz_y + "px";
        }

        close() {
            this.element.remove();
            vortex_wnx.windows = vortex_wnx.windows.filter(w => w !== this);
        }

        toFront() {
            this.pos_z = vortex_wnx.maxWindowLayerCount++;
            this.element.style.zIndex = this.pos_z;
        }
    },

    window_register(window) {
        if(vortex_wnx.wcount >= vortex_wnx.maxWindowLayerCount)
            return 1;

        this.windows.push(window);
        return 0;
    },

    window_create(title, sz_x = 200, sz_y = 200) {
        if (vortex_wnx.wcount >= vortex_wnx.maxWindowLayerCount) {
            console.error("Could not register window: Max window count reached.");
            return null;
        }
        
        return new vortex_wnx.Window(title, sz_x, sz_y);
    },

    window_closeAll() {
        this.windows.forEach(win => win.close());
        this.windows = [];
    },

    window_list() {
        return this.windows.map(win => win.title);
    }
};

