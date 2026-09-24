import Alpine from "alpinejs";

// Mirrors the JSON contract of LogsReader in @smuzi/logger.
type TagFilter = {
    key: string,
    value: string,
}

type TagValue = string | boolean | number;

type LogEntry = {
    id: number,
    trace_id: string | null,
    level: number,
    tags: Record<string, TagValue>,
    message: string,
    created_at: string,
}

type LogGroup = {
    trace_id: string | null,
    level: number,
    started_at: string,
    finished_at: string,
    logs: LogEntry[],
}

type LogGroupsPage = {
    total: number,
    limit: number,
    offset: number,
    groups: LogGroup[],
}

type LevelView = {
    name: string,
    badge: string,
}

const LEVEL_VIEWS: Record<number, LevelView> = {
    200: { name: "info", badge: "bg-sky-100 text-sky-800 ring-sky-200" },
    400: { name: "error", badge: "bg-rose-100 text-rose-800 ring-rose-200" },
};

const UNKNOWN_LEVEL_BADGE = "bg-slate-100 text-slate-700 ring-slate-200";
const PAGE_SIZE = 50;

function levelView(level: number): LevelView {
    return LEVEL_VIEWS[level] ?? { name: String(level), badge: UNKNOWN_LEVEL_BADGE };
}

function pad(value: number, length = 2): string {
    return String(value).padStart(length, "0");
}

async function readError(response: Response): Promise<string> {
    try {
        const body: unknown = await response.json();
        if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
            return body.error;
        }
    } catch {
        // non-JSON error body
    }

    return `Request failed: ${response.status} ${response.statusText}`;
}

let request_counter = 0;

Alpine.data("logsViewer", () => ({
    api_url: "api/logs",
    logout_url: "api/logout",
    login_url: "login",
    trace_id: "",
    message: "",
    tags: [] as TagFilter[],
    tag_modal_open: false,
    tag_draft: [] as TagFilter[],
    groups: [] as LogGroup[],
    total: 0,
    limit: PAGE_SIZE,
    offset: 0,
    loading: false,
    error_message: "",
    expanded: {} as Record<string, boolean>,

    init() {
        this.api_url = this.$root.dataset.api ?? this.api_url;
        this.logout_url = this.$root.dataset.logout ?? this.logout_url;
        this.login_url = this.$root.dataset.login ?? this.login_url;
        this.load();
    },

    async load() {
        const request_id = ++request_counter;
        this.loading = true;
        this.error_message = "";

        const trace_id = this.trace_id.trim();
        const message = this.message.trim();

        try {
            const response = await fetch(this.api_url, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    trace_id: trace_id === "" ? undefined : trace_id,
                    message: message === "" ? undefined : message,
                    tags: this.tags,
                    limit: this.limit,
                    offset: this.offset,
                }),
            });

            if (request_id !== request_counter) {
                return;
            }

            if (response.status === 401) {
                window.location.href = this.login_url;
                return;
            }

            if (!response.ok) {
                this.error_message = await readError(response);
                return;
            }

            const page: LogGroupsPage = await response.json();
            if (request_id !== request_counter) {
                return;
            }

            this.groups = page.groups;
            this.total = page.total;
            this.expanded = {};
            if (trace_id !== "" || page.groups.length === 1) {
                page.groups.forEach(group => this.expanded[this.groupKey(group)] = true);
            }
        } catch (error) {
            if (request_id === request_counter) {
                this.error_message = error instanceof Error ? error.message : String(error);
            }
        } finally {
            if (request_id === request_counter) {
                this.loading = false;
            }
        }
    },

    async logout() {
        try {
            await fetch(this.logout_url, { method: "POST" });
        } finally {
            window.location.href = this.login_url;
        }
    },

    search() {
        this.offset = 0;
        this.load();
    },

    hasTag(key: string, value: string): boolean {
        return this.tags.some(tag => tag.key === key && tag.value === value);
    },

    openTagModal() {
        this.tag_draft = this.tags.length > 0
            ? this.tags.map(tag => ({ ...tag }))
            : [{ key: "", value: "" }];
        this.tag_modal_open = true;
    },

    closeTagModal() {
        this.tag_modal_open = false;
    },

    addDraftTag() {
        this.tag_draft.push({ key: "", value: "" });
    },

    removeDraftTag(index: number) {
        this.tag_draft.splice(index, 1);
    },

    applyTagModal() {
        this.tags = this.tag_draft
            .map(tag => ({ key: tag.key.trim(), value: tag.value.trim() }))
            .filter(tag => tag.key !== "");
        this.tag_modal_open = false;
        this.search();
    },

    removeTag(index: number) {
        this.tags.splice(index, 1);
        this.search();
    },

    filterByTag(key: string, value: TagValue) {
        const tag_value = String(value);
        if (this.hasTag(key, tag_value)) {
            return;
        }

        this.tags.push({ key, value: tag_value });
        this.search();
    },

    filterByTrace(trace_id: string | null) {
        if (trace_id === null) {
            return;
        }

        this.trace_id = trace_id;
        this.search();
    },

    clearFilters() {
        this.trace_id = "";
        this.message = "";
        this.tags = [];
        this.search();
    },

    hasFilters(): boolean {
        return this.trace_id.trim() !== "" || this.message.trim() !== "" || this.tags.length > 0;
    },

    hasPrevPage(): boolean {
        return this.offset > 0;
    },

    hasNextPage(): boolean {
        return this.offset + this.groups.length < this.total;
    },

    prevPage() {
        this.offset = Math.max(0, this.offset - this.limit);
        this.load();
    },

    nextPage() {
        this.offset += this.limit;
        this.load();
    },

    pageRange(): string {
        if (this.groups.length === 0) {
            return "0";
        }

        return `${this.offset + 1}–${this.offset + this.groups.length}`;
    },

    groupKey(group: LogGroup): string {
        return group.trace_id !== null ? "trace:" + group.trace_id : "log:" + (group.logs[0]?.id ?? "");
    },

    isExpanded(group: LogGroup): boolean {
        return this.expanded[this.groupKey(group)] === true;
    },

    toggle(group: LogGroup) {
        const key = this.groupKey(group);
        this.expanded[key] = !this.expanded[key];
    },

    summary(group: LogGroup): string {
        return group.logs[0]?.message ?? "";
    },

    levelName(level: number): string {
        return levelView(level).name;
    },

    levelBadge(level: number): string {
        return levelView(level).badge;
    },

    tagEntries(tags: Record<string, TagValue>): { key: string, value: TagValue }[] {
        return Object.entries(tags).map(([key, value]) => ({ key, value }));
    },

    formatTime(iso: string): string {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) {
            return iso;
        }

        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
    },

    formatDate(iso: string): string {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) {
            return iso;
        }

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${this.formatTime(iso)}`;
    },

    formatDuration(group: LogGroup): string {
        const duration_ms = new Date(group.finished_at).getTime() - new Date(group.started_at).getTime();
        if (!Number.isFinite(duration_ms) || duration_ms <= 0) {
            return "";
        }

        return duration_ms < 1000 ? `${duration_ms} ms` : `${(duration_ms / 1000).toFixed(2)} s`;
    },

    formatMessage(message: string): string {
        const trimmed = message.trim();
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
            return message;
        }

        try {
            return JSON.stringify(JSON.parse(trimmed), null, 2);
        } catch {
            return message;
        }
    },
}));

Alpine.data("loginForm", () => ({
    api_url: "api/login",
    home_url: "./",
    email: "",
    password: "",
    loading: false,
    error_message: "",

    init() {
        this.api_url = this.$root.dataset.api ?? this.api_url;
        this.home_url = this.$root.dataset.home ?? this.home_url;
    },

    async submit() {
        this.loading = true;
        this.error_message = "";

        try {
            const response = await fetch(this.api_url, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: this.email, password: this.password }),
            });

            if (!response.ok) {
                this.error_message = await readError(response);
                return;
            }

            window.location.href = this.home_url;
        } catch (error) {
            this.error_message = error instanceof Error ? error.message : String(error);
        } finally {
            this.loading = false;
        }
    },
}));

Alpine.start();
