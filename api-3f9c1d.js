// @ts-nocheck
import { createRequire as __cr } from "node:module";
import { Buffer as __Buf } from "node:buffer";
import __proc from "node:process";
const require = __cr("file:///src/index.ts");
globalThis.Buffer = globalThis.Buffer || __Buf;
globalThis.process = globalThis.process || __proc;
var Dr = Object.create;
var Xn = Object.defineProperty;
var Mr = Object.getOwnPropertyDescriptor;
var Pr = Object.getOwnPropertyNames;
var Or = Object.getPrototypeOf, Ur = Object.prototype.hasOwnProperty;
var be = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, {
  get: (t, a) => (typeof require < "u" ? require : t)[a]
}) : e)(function(e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var M = (e, t) => () => {
  try {
    return t || e((t = { exports: {} }).exports, t), t.exports;
  } catch (a) {
    throw t = 0, a;
  }
};
var Br = (e, t, a, n) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let s of Pr(t))
      !Ur.call(e, s) && s !== a && Xn(e, s, { get: () => t[s], enumerable: !(n = Mr(t, s)) || n.enumerable });
  return e;
};
var Zn = (e, t, a) => (a = e != null ? Dr(Or(e)) : {}, Br(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  t || !e || !e.__esModule ? Xn(a, "default", { value: e, enumerable: !0 }) : a,
  e
));

// src/trace.js
var Ya = M((oa) => {
  "use strict";
  var { AsyncLocalStorage: Lr } = be("async_hooks"), za = new Lr();
  oa.run = (e) => za.run({ t0: Date.now(), marks: [] }, e);
  oa.mark = (e) => {
    let t = za.getStore();
    t && t.marks.length < 40 && t.marks.push(`${e}@${Date.now() - t.t0}`);
  };
  oa.summary = () => {
    let e = za.getStore();
    return e ? e.marks.join(" ") : "";
  };
});

// supa/pgdb.js
var Ot = M((cd, ts) => {
  "use strict";
  var qr = be("crypto"), { mark: tt } = Ya(), Gr = {
    increment: (e) => ({ __op: "inc", n: e }),
    serverTimestamp: () => ({ __op: "ts" })
  }, xr = {
    count: () => ({ aggregateType: "count" }),
    sum: (e) => ({ aggregateType: "sum", _field: e })
  }, jr = (e) => Object.defineProperties({ __ts: e }, {
    toMillis: { value: () => e },
    toDate: { value: () => new Date(e) },
    seconds: { value: Math.floor(e / 1e3) },
    nanoseconds: { value: e % 1e3 * 1e6 }
  });
  function ra(e) {
    if (Array.isArray(e)) return e.map(ra);
    if (e && typeof e == "object") {
      if (typeof e.__ts == "number" && Object.keys(e).length === 1) return jr(e.__ts);
      let t = {};
      for (let [a, n] of Object.entries(e)) t[a] = ra(n);
      return t;
    }
    return e;
  }
  function Ue(e) {
    if (e instanceof Date) return { __ts: e.getTime() };
    if (Array.isArray(e)) return e.map(Ue);
    if (e && typeof e == "object") {
      if (e.__op) return e;
      if (typeof e.toMillis == "function" && typeof e.__ts == "number") return { __ts: e.__ts };
      let t = {};
      for (let [a, n] of Object.entries(e)) n !== void 0 && (t[a] = Ue(n));
      return t;
    }
    return e;
  }
  function ia(e, t) {
    if (t && t.__op === "inc") return (Number(e) || 0) + t.n;
    if (t && t.__op === "ts") return { __ts: Date.now() };
    if (Array.isArray(t)) return t.map((a) => ia(void 0, a));
    if (t && typeof t == "object" && typeof t.__ts != "number") {
      let a = {};
      for (let [n, s] of Object.entries(t)) a[n] = ia(void 0, s);
      return a;
    }
    return t;
  }
  function Qn(e, t, a) {
    let n = t.split("."), s = e;
    for (let r = 0; r < n.length - 1; r++)
      (typeof s[n[r]] != "object" || s[n[r]] === null) && (s[n[r]] = {}), s = s[n[r]];
    let o = n[n.length - 1];
    s[o] = ia(s[o], a);
  }
  function at(e, t) {
    for (let [a, n] of Object.entries(t))
      n && typeof n == "object" && !n.__op && !Array.isArray(n) && typeof n.__ts != "number" && e[a] && typeof e[a] == "object" && !Array.isArray(e[a]) && typeof e[a].__ts != "number" ? at(e[a], n) : e[a] = ia(e[a], n);
    return e;
  }
  var Ja = (e) => {
    let t = e.lastIndexOf("/");
    return { collection: e.slice(0, t), id: e.slice(t + 1) };
  }, bt = class {
    constructor(t, a) {
      this.ref = t, this.id = t.id, this._d = a, this.exists = a !== void 0;
    }
    data() {
      return this._d === void 0 ? void 0 : ra(JSON.parse(JSON.stringify(this._d)));
    }
  }, es = (e) => {
    let t = new Error("ALREADY_EXISTS " + e);
    return t.code = 6, t;
  }, Fr = (e) => {
    let t = new Error("NOT_FOUND " + e);
    return t.code = 5, t;
  }, Xa = class {
    /** @param sql a `postgres` (porsager) client */
    constructor(t) {
      this.sql = t;
    }
    doc(t) {
      return new At(this, t);
    }
    collection(t) {
      return new ca(this, t);
    }
    batch() {
      let t = [], a = {
        set: (n, s, o = {}) => (t.push({ type: "set", path: n.path, data: s, merge: !!o.merge }), a),
        update: (n, s) => (t.push({ type: "update", path: n.path, data: s }), a),
        delete: (n) => (t.push({ type: "delete", path: n.path }), a),
        commit: async () => {
          await this.sql.begin((n) => this._applyAll(n, t));
        }
      };
      return a;
    }
    async _lockRead(t, a) {
      let [, n] = await Promise.all([t`select pg_advisory_xact_lock(hashtextextended(${a}, 0))`, t`select data from public.docs where path = ${a}`]);
      return tt("get"), n.length ? n[0].data : void 0;
    }
    /**
     * Apply a list of buffered ops with a constant number of round trips (the DB may be far from the Edge Function):
     * 1 sorted advisory-lock statement, 1 read of every touched doc, 1 bulk upsert (+1 bulk delete, pipelined).
     * Ops on the same path are folded in order in memory, so semantics equal the old one-op-at-a-time loop.
     */
    async _applyAll(t, a) {
      if (!a.length) return;
      let n = [...new Set(a.map((d) => d.path))].sort(), [, s] = await Promise.all([
        t`select pg_advisory_xact_lock(hashtextextended(s.p, 0)) from (select p from unnest(${n}::text[]) as p order by p) s`,
        t`select path, data from public.docs where path = any(${n}::text[])`
      ]);
      tt("lock+read");
      let o = /* @__PURE__ */ new Map();
      for (let d of s) o.set(d.path, d.data);
      for (let d of a) {
        let l = o.get(d.path);
        if (d.type === "delete") {
          o.set(d.path, void 0);
          continue;
        }
        let u;
        if (d.type === "create") {
          if (l !== void 0) throw es(d.path);
          u = at({}, Ue(d.data));
        } else if (d.type === "set") u = d.merge && l ? at(JSON.parse(JSON.stringify(l)), Ue(d.data)) : at({}, Ue(d.data));
        else if (d.type === "update") {
          if (l === void 0) throw Fr(d.path);
          u = JSON.parse(JSON.stringify(l));
          for (let [m, p] of Object.entries(Ue(d.data))) Qn(u, m, p);
        } else throw new Error("bad op " + d.type);
        o.set(d.path, u);
      }
      let r = [], i = [];
      for (let d of n) {
        let l = o.get(d);
        if (l === void 0) {
          s.some((p) => p.path === d) && i.push(d);
          continue;
        }
        let { collection: u, id: m } = Ja(d);
        r.push({ path: d, collection: u, id: m, data: l });
      }
      let c = [];
      r.length && c.push(t`insert into public.docs (path, collection, id, data)
        select t.path, t.collection, t.id, t.data from jsonb_to_recordset(${t.json(r)}::jsonb) as t(path text, collection text, id text, data jsonb)
        on conflict (path) do update set data = excluded.data`), i.length && c.push(t`delete from public.docs where path = any(${i}::text[])`), await Promise.all(c), tt("write");
    }
    async _one(t) {
      return this.sql.begin((a) => this._applyAll(a, [t]));
    }
    /** Reads first, writes buffered and applied atomically (retried on deadlock / serialization failure like Firestore). */
    async runTransaction(t) {
      for (let a = 0; ; a++)
        try {
          return await this.sql.begin(async (n) => {
            tt("txopen");
            let s = [], o = {
              get: async (i) => i instanceof At ? new bt(i, await this._lockRead(n, i.path)) : typeof i._exec == "function" ? i._exec(n) : i.get(),
              getAll: async (...i) => Promise.all(i.map(async (c) => new bt(c, await this._lockRead(n, c.path)))),
              set: (i, c, d = {}) => (s.push({ type: "set", path: i.path, data: c, merge: !!d.merge }), o),
              update: (i, c) => (s.push({ type: "update", path: i.path, data: c }), o),
              create: (i, c) => (s.push({ type: "create", path: i.path, data: c }), o),
              delete: (i) => (s.push({ type: "delete", path: i.path }), o)
            }, r = await t(o);
            return tt("fn"), await this._applyAll(n, s), tt("applied"), r;
          });
        } catch (n) {
          if ((n.code === "40P01" || n.code === "40001") && a < 4) {
            await new Promise((s) => setTimeout(s, 30 * (a + 1) + Math.random() * 40));
            continue;
          }
          throw n;
        }
    }
  }, At = class {
    constructor(t, a) {
      this.db = t, this.path = a, this.id = a.split("/").pop();
    }
    async get() {
      let t = await this.db.sql`select data from public.docs where path = ${this.path}`;
      return new bt(this, t.length ? t[0].data : void 0);
    }
    /** Plain overwrite = one atomic upsert statement (1 round trip, no transaction). */
    async set(t, a = {}) {
      if (a.merge) return this.db._one({ type: "set", path: this.path, data: t, merge: !0 });
      let { collection: n, id: s } = Ja(this.path);
      await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${n}, ${s}, ${this.db.sql.json(at({}, Ue(t)))}::jsonb)
                      on conflict (path) do update set data = excluded.data`;
    }
    update(t) {
      return this.db._one({ type: "update", path: this.path, data: t });
    }
    /** create = one `insert … on conflict do nothing` (1 round trip); no row back → ALREADY_EXISTS. */
    async create(t) {
      let { collection: a, id: n } = Ja(this.path), s = await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${a}, ${n}, ${this.db.sql.json(at({}, Ue(t)))}::jsonb)
                                on conflict (path) do nothing returning path`;
      if (tt("create"), !s.length) throw es(this.path);
    }
    delete() {
      return this.db._one({ type: "delete", path: this.path });
    }
    collection(t) {
      return new ca(this.db, `${this.path}/${t}`);
    }
  }, Za = class e {
    constructor(t, a, n = [], s = [], o = null, r = null) {
      Object.assign(this, { db: t, path: a, f: n, o: s, lim: o, after: r });
    }
    where(t, a, n) {
      return new e(this.db, this.path, [...this.f, [t, a, Ue(n)]], this.o, this.lim, this.after);
    }
    orderBy(t, a = "asc") {
      return new e(this.db, this.path, this.f, [...this.o, [t, a]], this.lim, this.after);
    }
    limit(t) {
      return new e(this.db, this.path, this.f, this.o, t, this.after);
    }
    startAfter(t) {
      return new e(this.db, this.path, this.f, this.o, this.lim, t);
    }
    async _exec(t) {
      let n = (await t`select * from public.fs_query(${this.path}::text, ${t.json(this.f)}::jsonb, ${t.json(this.o)}::jsonb, ${this.lim}::int, ${this.after ? this.after.ref.path : null}::text)`).map((s) => new bt(new At(this.db, s.path), s.data));
      return { docs: n, empty: !n.length, size: n.length, forEach: (s) => n.forEach(s) };
    }
    get() {
      return this._exec(this.db.sql);
    }
    count() {
      return { get: async () => {
        let t = await this.db.sql`select public.fs_agg(${this.path}::text, ${this.db.sql.json(this.f)}::jsonb, null::text) as a`;
        return { data: () => ({ count: Number(t[0].a.count) }) };
      } };
    }
    aggregate(t) {
      return { get: async () => {
        let a = {};
        for (let [n, s] of Object.entries(t)) {
          let o = await this.db.sql`select public.fs_agg(${this.path}::text, ${this.db.sql.json(this.f)}::jsonb, ${s.aggregateType === "sum" ? s._field : null}::text) as a`;
          a[n] = s.aggregateType === "count" ? Number(o[0].a.count) : Number(o[0].a.sum);
        }
        return { data: () => a };
      } };
    }
  }, ca = class extends Za {
    constructor(t, a) {
      super(t, a);
    }
    doc(t) {
      return new At(this.db, `${this.path}/${t || qr.randomBytes(10).toString("hex")}`);
    }
    async add(t) {
      let a = this.doc();
      return await a.set(t), a;
    }
  };
  ts.exports = { PgDb: Xa, FieldValue: Gr, AggregateField: xr, revive: ra, plain: Ue, merge: at, setPath: Qn };
});

// supa/runtime.js
var Ut = M((dd, as) => {
  "use strict";
  var Be = { sql: null, db: null, env: {}, fetch: (...e) => fetch(...e) };
  Be.configure = ({ sql: e, env: t, fetch: a }) => {
    let { PgDb: n } = Ot();
    return Be.sql = e, Be.db = new n(e), Be.env = t || {}, globalThis.__ENV = Be.env, a && (Be.fetch = a), Be;
  };
  Be.requireVerified = () => String(Be.env.REQUIRE_VERIFIED || "0") === "1";
  as.exports = Be;
});

// supa/shims/functions-https.js
var se = M((ud, ns) => {
  "use strict";
  var Qa = class extends Error {
    constructor(t, a, n) {
      super(a), this.code = t, this.details = n, this.name = "HttpsError";
    }
  }, Hr = (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "call", a;
  }, Kr = (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "request", a;
  };
  ns.exports = { HttpsError: Qa, onCall: Hr, onRequest: Kr };
});

// supa/shims/functions-v1.js
var rs = M((ld, os) => {
  "use strict";
  var ss = () => {
    let e = () => {
    };
    return e.__kind = "trigger", e;
  };
  os.exports = { region: () => ({ auth: { user: () => ({ onCreate: ss, onDelete: ss }) } }) };
});

// supa/shims/firebase-admin.js
var ps = M((md, en) => {
  "use strict";
  var V = Ut(), { FieldValue: us, AggregateField: Vr } = Ot(), ls = () => V.db;
  ls.FieldValue = us;
  var Wr = new Proxy(ls, { get: (e, t) => t === "FieldValue" ? us : t === "AggregateField" ? Vr : V.db[t] && typeof V.db[t] == "function" ? V.db[t].bind(V.db) : e[t] }), is = (e) => e && {
    uid: e.id,
    email: e.email || "",
    emailVerified: !!e.email_confirmed_at || !V.requireVerified(),
    displayName: e.raw_user_meta_data && (e.raw_user_meta_data.displayName || e.raw_user_meta_data.name) || "",
    disabled: !!e.banned_until && new Date(e.banned_until).getTime() > Date.now(),
    customClaims: e.raw_app_meta_data || {}
  }, cs = (e) => {
    let t = new Error(e || "There is no user record");
    return t.code = "auth/user-not-found", t;
  }, zr = {
    async getUser(e) {
      let t = await V.sql`select * from auth.users where id = ${e}::uuid`;
      if (!t.length) throw cs();
      return is(t[0]);
    },
    async getUserByEmail(e) {
      let t = await V.sql`select * from auth.users where lower(email) = lower(${e}) limit 1`;
      if (!t.length) throw cs();
      return is(t[0]);
    },
    async updateUser(e, t) {
      t.displayName !== void 0 && await V.sql`update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || ${V.sql.json({ displayName: t.displayName })}::jsonb where id = ${e}::uuid`, t.disabled !== void 0 && (await V.sql`update auth.users set banned_until = case when ${!!t.disabled}::boolean then 'infinity'::timestamptz else null end where id = ${e}::uuid`, V.tokenCache && V.tokenCache.clear());
    },
    async setCustomUserClaims(e, t) {
      await V.sql`update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || ${V.sql.json(t)}::jsonb where id = ${e}::uuid`;
    },
    /** Kills every session of the user: their refresh tokens stop working and the access token is rejected on the next call. */
    async revokeRefreshTokens(e) {
      await V.sql`delete from auth.sessions where user_id = ${e}::uuid`, V.tokenCache && V.tokenCache.clear();
    }
  }, ds = (e) => e.startsWith("deposits/") ? { bucket: "deposits", name: e.slice(9) } : { bucket: "pub", name: e }, Yr = () => ({
    bucket: () => ({
      file: (e) => ({
        async exists() {
          let t = ds(e);
          return [(await V.sql`select 1 from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`).length > 0];
        },
        async getMetadata() {
          let t = ds(e), a = await V.sql`select metadata from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`, n = a[0] && a[0].metadata || {};
          return [{ contentType: n.mimetype || n.contentType || "", size: Number(n.size) || 0 }];
        }
      })
    })
  }), Jr = () => ({ sendEachForMulticast: async () => ({ responses: [] }) }), ms = { apps: [1], initializeApp() {
  }, firestore: Wr, auth: () => zr, storage: Yr, messaging: Jr };
  en.exports = ms;
  en.exports.default = ms;
});

// src/util.js
var W = M((pd, hs) => {
  "use strict";
  var Bt = ps(), { HttpsError: ze } = se();
  Bt.apps.length || Bt.initializeApp();
  var Tt = Bt.firestore(), kt = Bt.firestore.FieldValue, Xr = "asia-south1", fs = ["main", "winning", "referral", "commission"], Zr = ["super", "finance", "support", "content", "payout"], We = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, nt = (e) => new ze("invalid-argument", e);
  function tn(e) {
    if (!e.auth) throw new ze("unauthenticated", "Please sign in.");
    return e.auth.uid;
  }
  function Qr(e) {
    let t = tn(e);
    if (!e.auth.token.email_verified) throw new ze("failed-precondition", "Please verify your email first.");
    return t;
  }
  function ei(e, t) {
    let a = tn(e), n = e.auth.token;
    if (n.admin !== !0 || !t.includes(n.role)) throw new ze("permission-denied", "You do not have permission.");
    return a;
  }
  function ti(e, { min: t = 0.01, max: a = 1e9, label: n = "Amount" } = {}) {
    let s = Number(e);
    if (!Number.isFinite(s)) throw nt(`${n} must be a number.`);
    if (s < t) throw nt(`${n} must be at least ${t}.`);
    if (s > a) throw nt(`${n} must be at most ${a}.`);
    return We(s);
  }
  function ai(e, { min: t = 1, max: a = 200, label: n = "Value", pattern: s = null } = {}) {
    if (typeof e != "string") throw nt(`${n} is required.`);
    let o = e.trim();
    if (o.length < t || o.length > a) throw nt(`${n} must be ${t}-${a} characters.`);
    if (s && !s.test(o)) throw nt(`${n} has an invalid format.`);
    return o;
  }
  function ni(e) {
    if (!e) throw new ze("not-found", "User profile not found.");
    if (e.status !== "active") throw new ze("permission-denied", "This account is not active.");
  }
  function si(e, t, a = ["main", "winning"]) {
    let n = We(t);
    if (We(a.reduce((r, i) => r + (Number(e?.[i]) || 0), 0)) < n) throw new ze("failed-precondition", "Insufficient balance.");
    let o = {};
    for (let r of a) {
      let i = Math.min(Number(e?.[r]) || 0, n);
      if (i > 0 && (o[r] = We(i), n = We(n - i)), n <= 0) break;
    }
    return o;
  }
  function oi(e, t, a) {
    let n = {};
    for (let [s, o] of Object.entries(a)) {
      if (!fs.includes(s)) throw new Error("bad bucket " + s);
      n[`balances.${s}`] = kt.increment(We(o));
    }
    e.update(t, n);
  }
  function ri(e, { uid: t, type: a, direction: n, amount: s, bucket: o = "main", note: r = "", ref: i = "" }) {
    e.set(Tt.collection("transactions").doc(), {
      uid: t,
      type: a,
      direction: n,
      amount: We(s),
      bucket: o,
      note: r,
      ref: i,
      createdAt: kt.serverTimestamp()
    });
  }
  function ii(e, t, a, n, s = "info") {
    e.set(Tt.collection("users").doc(t).collection("notifications").doc(), {
      title: a,
      body: n,
      type: s,
      read: !1,
      createdAt: kt.serverTimestamp()
    });
  }
  function ci(e, t) {
    let a = {};
    for (let [n, s] of Object.entries(t)) a[n] = kt.increment(s);
    e.set(Tt.doc("stats/global"), a, { merge: !0 });
  }
  function di(e, t, a, n = {}) {
    let s = Tt.collection("auditLogs").doc(), o = { actorUid: t, action: a, detail: n, at: kt.serverTimestamp() };
    e ? e.set(s, o) : s.set(o);
  }
  async function ui() {
    let e = await Tt.doc("settings/site").get();
    return e.exists ? e.data() : {};
  }
  hs.exports = {
    admin: Bt,
    db: Tt,
    FieldValue: kt,
    HttpsError: ze,
    REGION: Xr,
    BUCKETS: fs,
    STAFF_ROLES: Zr,
    round2: We,
    bad: nt,
    authUid: tn,
    requireVerified: Qr,
    requireRole: ei,
    amountOf: ti,
    str: ai,
    assertActive: ni,
    planDebit: si,
    applyDelta: oi,
    ledger: ri,
    notify: ii,
    bumpStats: ci,
    audit: di,
    siteSettings: ui
  };
});

// src/auth.js
var ys = M((Lt) => {
  "use strict";
  var li = rs(), { onCall: ws } = se(), oe = W(), { db: Ae, admin: an, FieldValue: st, HttpsError: nn, REGION: sn } = oe, gs = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", mi = () => Array.from({ length: 8 }, () => gs[be("crypto").randomInt(0, gs.length)]).join("");
  async function da(e, t = "", a = "") {
    let n = Ae.doc(`users/${e}`);
    if ((await n.get()).exists) return;
    let s = null;
    for (let o = 0; o < 8 && !s; o++) {
      let r = mi();
      try {
        await Ae.doc(`referralCodes/${r}`).create({ uid: e }), s = r;
      } catch (i) {
        if (i.code !== 6 && !/ALREADY_EXISTS/.test(String(i))) throw i;
      }
    }
    if (!s) throw new nn("internal", "Could not allocate referral code.");
    await Ae.runTransaction(async (o) => {
      (await o.get(n)).exists || (o.set(n, {
        email: t,
        name: a,
        username: "",
        phone: "",
        photoURL: "",
        role: "user",
        status: "active",
        referralCode: s,
        referredBy: "",
        profileComplete: !1,
        signupRewardsGiven: !1,
        balances: { main: 0, winning: 0, referral: 0, commission: 0 },
        createdAt: st.serverTimestamp(),
        lastLoginAt: null,
        lastSeenAt: null
      }), oe.bumpStats(o, { totalUsers: 1 }));
    });
  }
  Lt.onAuthCreate = li.region(sn).auth.user().onCreate((e) => da(e.uid, e.email || "", e.displayName || ""));
  Lt.completeRegistration = ws({ region: sn }, async (e) => {
    let t = oe.authUid(e), a = e.data || {}, n = oe.str(a.name, { min: 2, max: 60, label: "Name" }), s = oe.str(a.username, { min: 3, max: 20, label: "Username", pattern: /^[A-Za-z0-9_]+$/ }).toLowerCase(), o = oe.str(a.phone, { min: 8, max: 16, label: "Phone", pattern: /^\+?[0-9]{8,15}$/ }), r = typeof a.referralCode == "string" ? a.referralCode.trim().toUpperCase() : "", i = await an.auth().getUser(t);
    await da(t, i.email || "", n);
    let c = "";
    if (r) {
      let d = await Ae.doc(`referralCodes/${r}`).get();
      if (!d.exists) throw oe.bad("Referral code not found.");
      if (d.data().uid === t) throw oe.bad("You cannot use your own referral code.");
      c = d.data().uid;
    }
    return await Ae.runTransaction(async (d) => {
      let l = Ae.doc(`users/${t}`);
      if ((await d.get(l)).data().profileComplete) return;
      let m = Ae.doc(`usernames/${s}`);
      if ((await d.get(m)).exists) throw new nn("already-exists", "Username is already taken.");
      d.set(m, { uid: t }), d.update(l, { name: n, username: s, phone: o, referredBy: c, profileComplete: !0 });
    }), await an.auth().updateUser(t, { displayName: n }), { ok: !0 };
  });
  Lt.bootstrap = ws({ region: sn }, async (e) => {
    let t = oe.authUid(e), a = await an.auth().getUser(t);
    await da(t, a.email || "", a.displayName || "");
    let n = Ae.doc(`users/${t}`), s = await oe.siteSettings(), o = oe.round2(Number(s.welcomeBonus) || 0), r = oe.round2(Number(s.referral?.signupReward) || 0);
    if ((await Ae.runTransaction(async (d) => {
      let u = (await d.get(n)).data();
      if (u.status !== "active") return { banned: !0 };
      let m = a.emailVerified && u.profileComplete && !u.signupRewardsGiven, p = null;
      m && u.referredBy && r > 0 && (p = await d.get(Ae.doc(`users/${u.referredBy}`)));
      let h = { lastLoginAt: st.serverTimestamp(), lastSeenAt: st.serverTimestamp() };
      if (m && (h.signupRewardsGiven = !0, o > 0 && (h["balances.main"] = st.increment(o), oe.ledger(d, { uid: t, type: "bonus", direction: "in", amount: o, bucket: "main", note: "Welcome bonus" }), oe.notify(d, t, "Welcome!", `${o} welcome bonus has been added to your wallet.`, "bonus")), p && p.exists && p.data().status === "active")) {
        let w = u.referredBy;
        d.update(Ae.doc(`users/${w}`), { "balances.referral": st.increment(r) }), oe.ledger(d, { uid: w, type: "referral", direction: "in", amount: r, bucket: "referral", note: `Referral: ${u.username}` }), oe.notify(d, w, "New referral", `${u.username} joined with your code. +${r}`, "referral"), d.set(Ae.doc(`referrals/${t}`), {
          referrerUid: w,
          referredUid: t,
          referredName: u.username,
          rewardAmount: r,
          commissionTotal: 0,
          createdAt: st.serverTimestamp()
        }), oe.bumpStats(d, { totalReferrals: 1 });
      }
      return d.update(n, h), { banned: !1 };
    })).banned) throw new nn("permission-denied", "This account is banned.");
    let c = (e.rawRequest?.headers?.["x-forwarded-for"] || e.rawRequest?.ip || "").toString().split(",")[0].trim();
    return await Ae.collection("loginHistory").add({
      uid: t,
      at: st.serverTimestamp(),
      ip: c,
      ua: (e.rawRequest?.headers?.["user-agent"] || "").toString().slice(0, 300)
    }), { ok: !0, emailVerified: a.emailVerified };
  });
  Lt.ensureUserDoc = da;
});

// src/payrot.js
var cn = M((hd, vs) => {
  "use strict";
  var ot = W(), { db: qt } = ot, As = 864e5, pi = 25e3, Ts = 30, O = (e) => Number.isFinite(Number(e)) ? Number(e) : 0, on = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 10), rt = (e) => O(e.cycleLimit) > 0, ua = (e) => O(e.cycleReceived), rn = (e) => O(e.cycleReserved), ks = (e) => rt(e) ? Math.max(0, ot.round2(O(e.cycleLimit) - ua(e) - rn(e))) : 1 / 0, bs = (e, t) => O(e.priority) - O(t.priority) || O(e.lastActivatedAt) - O(t.lastActivatedAt) || O(e.createdAt) - O(t.createdAt) || String(e.id).localeCompare(String(t.id));
  function fi(e, t = {}) {
    return {
      accountId: e.id,
      methodId: e.methodId,
      cycleNo: O(e.cycleNo) || 1,
      receivedAmount: ua(e),
      limit: O(e.cycleLimit),
      activatedAt: O(e.lastActivatedAt),
      limitReachedAt: O(e.limitReachedAt),
      cooldownStartedAt: O(e.cooldownStartedAt),
      cooldownEndsAt: O(e.cooldownUntil),
      ...t
    };
  }
  async function hi(e, t, a = {}) {
    let n = a.now || Date.now(), s = Math.max(1, O(a.min) || 1), o = await e.get(qt.doc(`paymentMethods/${t}`)), r = await e.get(qt.collection("paymentAccounts").where("methodId", "==", t)), i = o.exists ? o.data() : null, c = !i || i.autoRotation !== !1, l = (r.docs.length ? await e.getAll(...r.docs.map((f) => f.ref)) : []).filter((f) => f.exists).map((f) => ({ id: f.id, ref: f.ref, ...f.data() })), u = /* @__PURE__ */ new Map(), m = [], p = (f) => l.find((T) => T.id === f), h = (f, T) => {
      Object.assign(f, T), u.set(f.id, { ...u.get(f.id) || {}, ...T });
    }, w = (f, T) => {
      e.set(qt.doc(`paymentCycles/${f.id}_${O(f.cycleNo) || 1}`), fi(f, { endReason: T, closedAt: n }), { merge: !0 });
    }, y = a.settle;
    if (y) {
      let f = p(y.accountId);
      if (f) {
        let T = {};
        rt(f) && (T.cycleReserved = Math.max(0, ot.round2(rn(f) - y.amount)), y.outcome === "approve" && (T.cycleReceived = ot.round2(ua(f) + y.amount))), y.outcome === "release" && (f.usedTodayKey === on(n) && (T.usedToday = Math.max(0, ot.round2(O(f.usedToday) - y.amount))), f.usedMonthKey === on(n).slice(0, 7) && (T.usedMonth = Math.max(0, ot.round2(O(f.usedMonth) - y.amount))), T.totalCollected = Math.max(0, ot.round2(O(f.totalCollected) - y.amount)), T.totalDeposits = Math.max(0, O(f.totalDeposits) - 1)), h(f, T);
      }
    }
    let b = a.force || {};
    if (b.reset) {
      let f = p(b.reset);
      f && (w(f, "manual_reset"), h(f, { cycleReceived: 0, cycleNo: (O(f.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0, ...f.status === "cooldown" ? { status: "standby" } : {} }));
    }
    if (b.pause) {
      let f = p(b.pause);
      f && h(f, { status: "paused" });
    }
    if (b.resume) {
      let f = p(b.resume);
      f && f.status === "paused" && h(f, { status: "standby" });
    }
    if (b.activate) {
      let f = p(b.activate);
      if (f) {
        for (let T of l) T.id !== f.id && T.status === "active" && rt(T) && c && h(T, { status: "standby" });
        h(f, { status: "active", lastActivatedAt: n, cooldownStartedAt: 0, cooldownUntil: 0, limitReachedAt: 0 }), m.push({ old: "", next: f.id, reason: "manual" });
      }
    }
    for (let f of l)
      rt(f) && f.status === "cooldown" && O(f.cooldownUntil) && O(f.cooldownUntil) <= n && (e.set(qt.doc(`paymentCycles/${f.id}_${O(f.cycleNo) || 1}`), { completedAt: n, endReason: "cooldown_ended" }, { merge: !0 }), h(f, { status: "standby", cycleReceived: 0, cycleNo: (O(f.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0 }));
    let _ = "", k = "";
    if (c) {
      for (let A of l)
        if (rt(A) && A.status === "active" && (_ = _ || A.id, O(A.cycleLimit) - ua(A) < s && rn(A) <= 0)) {
          let $ = O(A.cooldownDays) > 0 ? O(A.cooldownDays) : Ts;
          h(A, { status: "cooldown", limitReachedAt: n, cooldownStartedAt: n, cooldownUntil: n + $ * As }), w(A, "limit_reached"), k = k || A.id;
        }
      let f = l.filter(rt), T = f.filter((A) => A.status === "active").sort((A, $) => O($.lastActivatedAt) - O(A.lastActivatedAt) || bs(A, $));
      for (let A of T.slice(1)) h(A, { status: "standby" });
      if (!T.length) {
        let A = f.filter(($) => $.status === "standby" && ks($) >= s).sort(bs)[0];
        A ? (h(A, { status: "active", lastActivatedAt: n }), m.push({ old: k || _, next: A.id, reason: k ? "limit_reached" : a.reason || "no_active" })) : k && m.push({ old: k, next: "", reason: "limit_reached_no_standby" });
      }
    }
    for (let [f, T] of u) e.update(p(f).ref, { ...T, updatedAt: n });
    for (let f of m)
      !f.next && !f.old || e.set(qt.collection("paymentRotationLogs").doc(), { methodId: t, oldAccountId: f.old || "", newAccountId: f.next || "", reason: f.reason, at: n });
    return { changed: [...u.keys()], activated: (m.find((f) => f.next) || {}).next || null, accounts: l };
  }
  vs.exports = { rotateTx: hi, cycleOn: rt, room: ks, n0: O, dayKey: on, DAY: As, DEFAULT_LIMIT: pi, DEFAULT_COOLDOWN_DAYS: Ts };
});

// src/storage.js
var fa = M((pa, Rs) => {
  "use strict";
  var { onCall: ln } = se(), Te = W(), { HttpsError: it, REGION: mn } = Te, gi = () => globalThis.__ENV || process.env, Ss = () => {
    let e = gi(), a = { endpoint: String(e.S3_ENDPOINT || "").replace(/\/+$/, ""), bucket: String(e.S3_BUCKET || ""), key: String(e.S3_ACCESS_KEY_ID || ""), secret: String(e.S3_SECRET_ACCESS_KEY || ""), region: String(e.S3_REGION || "auto") };
    return a.ok = !!(a.endpoint && /^https:\/\//.test(a.endpoint) && a.bucket && a.key && a.secret), a;
  }, pn = () => Ss().ok, dn = new TextEncoder(), Cs = (e) => [...new Uint8Array(e)].map((t) => t.toString(16).padStart(2, "0")).join(""), un = () => globalThis.crypto && globalThis.crypto.subtle || be("node:crypto").webcrypto.subtle, wi = async (e) => Cs(await un().digest("SHA-256", dn.encode(e))), Gt = async (e, t) => {
    let a = await un().importKey("raw", typeof e == "string" ? dn.encode(e) : e, { name: "HMAC", hash: "SHA-256" }, !1, ["sign"]);
    return un().sign("HMAC", a, dn.encode(t));
  }, la = (e) => encodeURIComponent(e).replace(/[!'()*]/g, (t) => "%" + t.charCodeAt(0).toString(16).toUpperCase());
  async function xt(e, t, { expires: a = 300, contentType: n = "", now: s = Date.now() } = {}) {
    let o = Ss();
    if (!o.ok) throw new it("failed-precondition", "File storage is not set up yet.");
    let r = new URL(o.endpoint), i = r.host, d = `${r.pathname.replace(/\/+$/, "")}/${la(o.bucket)}/${t.split("/").map(la).join("/")}`, l = new Date(s).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), u = l.slice(0, 8), m = `${u}/${o.region}/s3/aws4_request`, p = n ? "content-type;host" : "host", h = { "X-Amz-Algorithm": "AWS4-HMAC-SHA256", "X-Amz-Credential": `${o.key}/${m}`, "X-Amz-Date": l, "X-Amz-Expires": String(a), "X-Amz-SignedHeaders": p }, w = Object.keys(h).sort().map((T) => `${la(T)}=${la(h[T])}`).join("&"), y = (n ? `content-type:${n}
` : "") + `host:${i}
`, b = [e, d, w, y, p, "UNSIGNED-PAYLOAD"].join(`
`), _ = ["AWS4-HMAC-SHA256", l, m, await wi(b)].join(`
`), k = await Gt("AWS4" + o.secret, u);
    k = await Gt(k, o.region), k = await Gt(k, "s3"), k = await Gt(k, "aws4_request");
    let f = Cs(await Gt(k, _));
    return `${r.protocol}//${i}${d}?${w}&X-Amz-Signature=${f}`;
  }
  var _s = (...e) => (Te.storageFetch || globalThis.fetch)(...e);
  async function Is(e) {
    let t = await _s(await xt("HEAD", e, { expires: 60 }), { method: "HEAD" });
    if (t.status === 404) return { exists: !1 };
    if (!t.ok) throw new it("unavailable", "File storage did not answer. Please try again.");
    let a = (n) => (t.headers && t.headers.get ? t.headers.get(n) : "") || "";
    return { exists: !0, contentType: a("content-type"), size: Number(a("content-length")) || 0 };
  }
  async function Ns(e) {
    try {
      await _s(await xt("DELETE", e, { expires: 60 }), { method: "DELETE" });
    } catch {
    }
  }
  var fn = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }, ma = 3 * 1024 * 1024, $s = (e) => typeof e == "string" && e.length <= 220 && /^[A-Za-z0-9_\-/.]+$/.test(e) && !e.includes("..") && !e.startsWith("/");
  async function yi(e) {
    let t = await Is(e);
    if (!t.exists) throw new it("failed-precondition", "The screenshot upload was not found. Please upload again.");
    if (!fn[String(t.contentType).split(";")[0]] || t.size > ma)
      throw await Ns(e), Te.bad("Screenshot must be a JPG/PNG/WEBP image under 3 MB.");
    return t;
  }
  var Es = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  };
  async function bi(e, t) {
    let a = Te.authUid(e), n = Es(e), s = t.split("/");
    if (s[0] === "deposits") return s[1] === a || ["super", "finance", "support"].includes(n);
    if (s[0] === "payouts") {
      if (["super", "finance"].includes(n)) return !0;
      if (n === "payout") {
        let o = await Te.db.doc(`withdrawals/${s[1]}`).get();
        return o.exists && o.data().assignedTo === a;
      }
      return !1;
    }
    return s[0] === "staff" ? !!n && n !== "payout" : !1;
  }
  pa.storageStatus = ln({ region: mn }, async (e) => (Te.authUid(e), { configured: pn(), maxBytes: ma, types: Object.keys(fn) }));
  pa.storageUploadUrl = ln({ region: mn }, async (e) => {
    let t = Te.authUid(e), a = e.data || {}, n = Es(e);
    if (!pn()) throw new it("failed-precondition", "File storage is not set up yet.");
    let s = String(a.contentType || ""), o = fn[s];
    if (!o) throw Te.bad("Only JPG, PNG or WEBP images.");
    let r = Number(a.size) || 0;
    if (r <= 0 || r > ma) throw Te.bad("Image must be under 3 MB.");
    let i = Math.random().toString(36).slice(2, 10), c = Date.now(), d;
    if (a.kind === "deposit") d = `deposits/${t}/${c}-${i}.${o}`;
    else if (a.kind === "payout") {
      let l = Te.str(a.withdrawalId, { max: 80, label: "Withdrawal" }), u = await Te.db.doc(`withdrawals/${l}`).get();
      if (!u.exists || u.data().assignedTo !== t || u.data().status !== "pending") throw new it("permission-denied", "This task is not assigned to you.");
      d = `payouts/${l}/${t}-${c}-${i}.${o}`;
    } else if (a.kind === "staff") {
      if (!n || n === "payout") throw new it("permission-denied", "Staff only.");
      d = `staff/${t}/${c}-${i}.${o}`;
    } else throw Te.bad("Unknown upload type.");
    return { url: await xt("PUT", d, { expires: 300, contentType: s }), key: d, contentType: s, expiresIn: 300 };
  });
  pa.storageViewUrl = ln({ region: mn }, async (e) => {
    let t = e.data && e.data.key;
    if (!$s(t)) throw Te.bad("Invalid file.");
    if (!await bi(e, t)) throw new it("permission-denied", "You cannot view this file.");
    return { url: await xt("GET", t, { expires: 300 }), expiresIn: 300 };
  });
  Rs.exports.helpers = { presign: xt, headObject: Is, deleteObject: Ns, verifyImage: yi, configured: pn, safeKey: $s, MAX_BYTES: ma };
});

// src/wdcore.js
var hn = M((gd, Ds) => {
  "use strict";
  var Ye = W(), { db: Ai, FieldValue: Ti } = Ye, Je = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  function ki(e = Date.now()) {
    let t = new Date(e + 216e5);
    return t.setUTCHours(0, 0, 0, 0), new Date(t.getTime() - 6 * 36e5);
  }
  function vi(e) {
    let t = e && e.withdraw || {};
    return {
      enabled: t.enabled !== !1,
      min: Je(t.min),
      max: Je(t.max),
      feePct: Je(t.feePct),
      feeFlat: Je(t.feeFlat),
      allowedBuckets: Array.isArray(t.allowedBuckets) && t.allowedBuckets.length ? t.allowedBuckets : ["winning", "referral", "commission"],
      dailyLimit: Je(t.dailyLimit),
      dailyCount: Je(t.dailyCount),
      maxPending: Je(t.maxPending) || 3,
      processingText: typeof t.processingText == "string" ? t.processingText : "",
      notice: typeof t.notice == "string" ? t.notice : ""
    };
  }
  function Si(e, t, a, n, s, o, r = {}) {
    e.update(t, { status: n ? "approved" : "rejected", stage: n ? "done" : "rejected", note: o, reviewedAt: Ti.serverTimestamp(), reviewedBy: s, ...r }), n ? (Ye.notify(e, a.uid, "Withdrawal approved", `${a.net} has been sent to ${a.accountNumber}.`, "withdraw"), Ye.ledger(e, { uid: a.uid, type: "withdraw", direction: "out", amount: 0, bucket: a.bucket, note: `Paid ${a.net} (fee ${a.fee})`, ref: t.id }), Ye.bumpStats(e, { totalWithdrawals: a.amount, feesCollected: a.fee, withdrawCount: 1, pendingWithdrawals: -1 })) : (Ye.applyDelta(e, Ai.doc(`users/${a.uid}`), a.plan && Object.keys(a.plan).length ? a.plan : { [a.bucket]: a.amount }), Ye.ledger(e, { uid: a.uid, type: "withdraw_refund", direction: "in", amount: a.amount, bucket: a.bucket, note: "Withdrawal rejected", ref: t.id }), Ye.notify(e, a.uid, "Withdrawal rejected", o || "Your withdrawal was rejected and the amount was returned.", "withdraw"), Ye.bumpStats(e, { pendingWithdrawals: -1 }));
  }
  Ds.exports = { n0: Je, startOfDhakaDay: ki, withdrawSettings: vi, finalize: Si };
});

// src/wallet.js
var Os = M((Xe) => {
  "use strict";
  var { onCall: ct } = se(), g = W(), { db: P, admin: Ci, FieldValue: je, HttpsError: x, REGION: dt } = g, ha = cn(), Ps = (e, t) => e && e.enabled === !0 && [t, "both"].includes(e.type || "both"), gn = () => new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10), Ms = () => gn().slice(0, 7), ue = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  Xe.submitDeposit = ct({ region: dt }, async (e) => {
    let t = g.requireVerified(e), a = e.data || {}, n = g.str(a.methodId, { max: 80, label: "Method" }), s = a.accountId ? g.str(a.accountId, { max: 120, label: "Account" }) : "", o = g.amountOf(a.amount), r = g.str(a.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), i = typeof a.senderNumber == "string" ? a.senderNumber.trim().slice(0, 30) : "", c = typeof a.screenshotPath == "string" ? a.screenshotPath.trim().slice(0, 200) : "";
    if (c) {
      if (!c.startsWith(`deposits/${t}/`) || c.includes("..")) throw g.bad("Invalid screenshot path.");
      let A = fa().helpers;
      if (A.configured() && a.store === "s3") await A.verifyImage(c);
      else {
        let $ = Ci.storage().bucket().file(c), [E] = await $.exists();
        if (!E) throw new x("failed-precondition", "Screenshot upload was not found. Please upload again.");
        let [I] = await $.getMetadata();
        if (!String(I.contentType || "").startsWith("image/")) throw g.bad("Screenshot must be an image.");
      }
    }
    let d = c && a.store === "s3" ? "s3" : "", u = (await g.siteSettings()).deposit || {}, m = ue(u.min) || 1, p = ue(u.max) || 1e7;
    if (o < m || o > p) throw g.bad(`Amount must be between ${m} and ${p}.`);
    if ((await P.collection("deposits").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= 5) throw new x("resource-exhausted", "Too many pending deposits. Please wait for review.");
    let w = new Date(Date.now() + 6 * 36e5);
    w.setUTCHours(0, 0, 0, 0);
    let y = new Date(w.getTime() - 6 * 36e5), _ = (await P.collection("deposits").where("uid", "==", t).where("createdAt", ">=", y).get()).docs.filter((A) => A.data().status !== "rejected").reduce((A, $) => A + ue($.data().amount), 0), f = (await P.doc(`users/${t}`).get()).data()?.dupTrx || {};
    if (f.blockedUntil && f.blockedUntil > Date.now()) throw new x("permission-denied", `Deposits are blocked until ${new Date(f.blockedUntil).toISOString().slice(0, 16).replace("T", " ")} UTC because of repeated duplicate transaction IDs.`);
    if ((await P.doc(`trxIndex/${n}_${r}`).get()).exists) {
      let A = f.lastAt && f.lastAt > Date.now() - 864e5 ? (f.count || 0) + 1 : 1, $ = { "dupTrx.count": A, "dupTrx.lastAt": Date.now() };
      throw A >= 2 && ($["dupTrx.blockedUntil"] = Date.now() + 864e5), await P.doc(`users/${t}`).update($), await P.doc("stats/global").set({ duplicateAttempts: je.increment(1) }, { merge: !0 }), g.audit(null, t, "duplicate_trx_attempt", { methodId: n, trxId: r, count: A }), new x("already-exists", A >= 2 ? "This transaction ID was already used. Deposits are blocked for 24 hours." : "This transaction ID was already used. Another attempt will block deposits for 24 hours.");
    }
    let T = P.collection("deposits").doc();
    return await P.runTransaction(async (A) => {
      let $ = [A.get(P.doc(`paymentMethods/${n}`)), A.get(P.doc(`users/${t}`)), A.get(P.doc(`trxIndex/${n}_${r}`))];
      s && $.push(A.get(P.doc(`paymentAccounts/${s}`)));
      let [E, I, K, te] = await Promise.all($);
      g.assertActive(I.data());
      let F = E.data();
      if (!E.exists || !Ps(F, "deposit")) throw g.bad("This payment method is not available.");
      if (F.minAmount && o < F.minAmount) throw g.bad(`Minimum for ${F.name} is ${F.minAmount}.`);
      if (F.maxAmount && o > F.maxAmount) throw g.bad(`Maximum for ${F.name} is ${F.maxAmount}.`);
      let ae = I.data().rg || {}, xe = ae.pendingLimitAt && ae.pendingLimitAt <= Date.now() ? ue(ae.pendingLimit) : ue(ae.dailyDepositLimit);
      if (xe > 0 && _ + o > xe) throw new x("failed-precondition", `Your daily deposit limit is ${xe}. Remaining today: ${Math.max(0, g.round2(xe - _))}.`);
      if (K.exists) throw new x("already-exists", "This transaction ID has already been submitted.");
      let na = F.accountNumber || "", sa = "", Wa = "", zn = "";
      if (s) {
        let ne = te && te.exists ? te.data() : null;
        if (!ne || ne.status !== "active" || ne.methodId !== n) throw new x("failed-precondition", "This payment account is no longer available. Please choose again.");
        let Yn = ne.usedTodayKey === gn() ? ue(ne.usedToday) : 0, Jn = ne.usedMonthKey === Ms() ? ue(ne.usedMonth) : 0;
        if (Yn + o > ue(ne.dailyLimit) || Jn + o > ue(ne.monthlyLimit)) throw new x("failed-precondition", "This account reached its limit. Please choose again.");
        let Rr = ha.cycleOn(ne) ? { cycleReserved: g.round2(ue(ne.cycleReserved) + o) } : {};
        if (ha.cycleOn(ne) && o > ha.room(ne)) throw new x("failed-precondition", "This payment number has reached its limit. Please try again shortly.");
        A.update(te.ref, {
          usedToday: g.round2(Yn + o),
          usedTodayKey: gn(),
          usedMonth: g.round2(Jn + o),
          usedMonthKey: Ms(),
          totalDeposits: je.increment(1),
          totalCollected: je.increment(o),
          lastUsedAt: Date.now(),
          ...Rr
        }), na = ne.accountNumber || "", sa = ne.holderName || "", Wa = ne.bankName || "", zn = ne.branch || "";
      }
      A.set(P.doc(`trxIndex/${n}_${r}`), { uid: t, depositId: T.id }), A.set(T, {
        uid: t,
        username: I.data().username,
        methodId: n,
        methodName: F.name,
        accountId: s,
        accountNumber: na,
        holderName: sa,
        ...Wa ? { bankName: Wa, branch: zn } : {},
        amount: o,
        trxId: r,
        senderNumber: i,
        screenshotPath: c,
        screenshotStore: d,
        status: "pending",
        note: "",
        createdAt: je.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), g.notify(A, t, "Deposit submitted", `${o} is waiting for approval.`, "deposit"), g.bumpStats(A, { pendingDeposits: 1 });
    }), { ok: !0, depositId: T.id };
  });
  Xe.reviewDeposit = ct({ region: dt }, async (e) => {
    let t = g.requireRole(e, ["super", "finance"]), a = e.data || {}, n = g.str(a.depositId, { max: 80 }), s = a.action === "approve";
    if (!s && a.action !== "reject") throw g.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "", r = await g.siteSettings(), i = Number(r.referral?.depositCommissionPct) || 0;
    return await P.runTransaction(async (c) => {
      let d = P.doc(`deposits/${n}`), l = await c.get(d);
      if (!l.exists) throw new x("not-found", "Deposit not found.");
      let u = l.data();
      if (u.status !== "pending") throw new x("failed-precondition", `Already ${u.status}.`);
      let m = P.doc(`users/${u.uid}`), p = await c.get(m), h = null, w = null;
      s && i > 0 && p.data().referredBy && (h = await c.get(P.doc(`users/${p.data().referredBy}`)), w = await c.get(P.doc(`referrals/${u.uid}`))), u.accountId && await ha.rotateTx(c, u.methodId, { now: Date.now(), min: Math.max(1, ue((r.deposit || {}).min) || 1), settle: { accountId: u.accountId, amount: u.amount, outcome: s ? "approve" : "release" } });
      let y = { status: s ? "approved" : "rejected", note: o, reviewedAt: je.serverTimestamp(), reviewedBy: t };
      if (c.update(d, y), s) {
        if (g.applyDelta(c, m, { main: u.amount }), g.ledger(c, { uid: u.uid, type: "deposit", direction: "in", amount: u.amount, bucket: "main", note: u.methodName, ref: n }), g.notify(c, u.uid, "Deposit approved", `${u.amount} has been added to your wallet.`, "deposit"), g.bumpStats(c, { totalDeposits: u.amount, depositCount: 1, pendingDeposits: -1 }), h && h.exists && h.data().status === "active") {
          let b = g.round2(u.amount * i / 100);
          b > 0 && (g.applyDelta(c, h.ref, { commission: b }), g.ledger(c, { uid: h.id, type: "commission", direction: "in", amount: b, bucket: "commission", note: `Deposit by ${p.data().username}`, ref: n }), g.notify(c, h.id, "Referral commission", `+${b} from ${p.data().username}'s deposit.`, "referral"), w && w.exists && c.update(w.ref, { commissionTotal: je.increment(b) }), g.bumpStats(c, { commissionPaid: b }));
        }
      } else
        c.delete(P.doc(`trxIndex/${u.methodId}_${u.trxId}`)), g.notify(c, u.uid, "Deposit rejected", o || "Your deposit request was rejected.", "deposit"), g.bumpStats(c, { pendingDeposits: -1 });
      g.audit(c, t, s ? "deposit_approved" : "deposit_rejected", { depositId: n, amount: u.amount, uid: u.uid });
    }), { ok: !0 };
  });
  Xe.markDepositProcessing = ct({ region: dt }, async (e) => {
    let t = g.requireRole(e, ["super", "finance"]), a = g.str((e.data || {}).depositId, { max: 80 });
    return await P.runTransaction(async (n) => {
      let s = P.doc(`deposits/${a}`), o = await n.get(s), r = o.exists ? o.data() : null;
      if (!r || r.status !== "pending") throw new x("failed-precondition", "Only a pending deposit can be marked processing.");
      r.stage !== "processing" && (n.update(s, { stage: "processing", processingAt: Date.now(), processingBy: t }), g.notify(n, r.uid, "Deposit processing", `Your deposit of ${r.amount} is being checked.`, "deposit"), g.audit(n, t, "deposit_processing", { depositId: a }));
    }), { ok: !0 };
  });
  Xe.refundDeposit = ct({ region: dt }, async (e) => {
    let t = g.requireRole(e, ["super", "finance"]), a = e.data || {}, n = g.str(a.depositId, { max: 80 }), s = g.str(a.note, { min: 3, max: 300, label: "Reason" });
    return await P.runTransaction(async (o) => {
      let r = P.doc(`deposits/${n}`), i = await o.get(r), c = i.exists ? i.data() : null;
      if (!c || c.status !== "approved") throw new x("failed-precondition", "Only an approved deposit can be refunded.");
      let d = P.doc(`users/${c.uid}`), l = await o.get(d), u = ue(l.data()?.balances?.main);
      if (u + 1e-9 < ue(c.amount)) throw new x("failed-precondition", `The player's main wallet has only ${g.round2(u)} \u2014 they already used part of this deposit.`);
      o.update(r, { status: "refunded", refundNote: s, refundedAt: je.serverTimestamp(), refundedBy: t }), g.applyDelta(o, d, { main: -ue(c.amount) }), g.ledger(o, { uid: c.uid, type: "deposit_refund", direction: "out", amount: c.amount, bucket: "main", note: s, ref: n }), g.notify(o, c.uid, "Deposit refunded", `${c.amount} was returned to you. ${s}`, "deposit"), g.bumpStats(o, { totalDeposits: -ue(c.amount), depositCount: -1, depositsRefunded: ue(c.amount) }), g.audit(o, t, "deposit_refunded", { depositId: n, amount: c.amount, uid: c.uid, note: s });
    }), { ok: !0 };
  });
  var ga = hn();
  Xe.requestWithdraw = ct({ region: dt }, async (e) => {
    let t = g.requireVerified(e), a = e.data || {}, n = g.str(a.methodId, { max: 80, label: "Method" }), s = a.bucket ? g.str(a.bucket, { max: 20, label: "Wallet" }) : "auto", o = g.amountOf(a.amount), r = g.str(a.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }), i = typeof a.holderName == "string" ? a.holderName.trim().slice(0, 60) : "", c = typeof a.bankName == "string" ? a.bankName.trim().slice(0, 60) : "", d = typeof a.branch == "string" ? a.branch.trim().slice(0, 60) : "", l = await g.siteSettings(), u = ga.withdrawSettings(l);
    if (!u.enabled) throw new x("failed-precondition", u.notice || "Withdrawals are paused right now. Please try again later.");
    let m = u.allowedBuckets;
    if (s !== "auto" && !m.includes(s)) throw g.bad("This wallet cannot be withdrawn from.");
    let p = g.round2(o * u.feePct / 100 + u.feeFlat);
    if (p >= o) throw g.bad("Amount is too small after fees.");
    if ((await P.collection("withdrawals").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= u.maxPending) throw new x("resource-exhausted", `You already have ${u.maxPending} pending withdrawal(s). Please wait until they are processed.`);
    if (u.dailyLimit > 0 || u.dailyCount > 0) {
      let b = (await P.collection("withdrawals").where("uid", "==", t).where("createdAt", ">=", ga.startOfDhakaDay()).get()).docs.filter((k) => k.data().status !== "rejected"), _ = b.reduce((k, f) => k + ga.n0(f.data().amount), 0);
      if (u.dailyCount > 0 && b.length >= u.dailyCount) throw new x("failed-precondition", `Daily limit reached: ${u.dailyCount} withdrawal(s) per day. Try again tomorrow.`);
      if (u.dailyLimit > 0 && _ + o > u.dailyLimit) throw new x("failed-precondition", `Daily withdraw limit is ${u.dailyLimit}. You can withdraw ${Math.max(0, g.round2(u.dailyLimit - _))} more today.`);
    }
    let w = P.collection("withdrawals").doc();
    return await P.runTransaction(async (y) => {
      let b = P.doc(`users/${t}/private/wdCards`), [_, k, f] = await Promise.all([y.get(P.doc(`paymentMethods/${n}`)), y.get(P.doc(`users/${t}`)), y.get(b)]);
      g.assertActive(k.data());
      let T = _.data();
      if (!_.exists || !Ps(T, "withdraw")) throw g.bad("This withdraw method is not available.");
      let A = f.exists && Array.isArray(f.data().list) ? f.data().list : [], $ = A.find((ae) => ae.methodId === n);
      if ($ && T.cardLock === !0 && String($.accountNumber).replace(/\s+/g, "") !== String(r).replace(/\s+/g, ""))
        throw new x("failed-precondition", '\u098F\u0987 \u09AE\u09C7\u09A5\u09A1\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C7\u09AD \u0995\u09B0\u09BE \u0995\u09BE\u09B0\u09CD\u09A1 \u0986\u099B\u09C7\u0964 \u0985\u09A8\u09CD\u09AF \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7 \u09A4\u09C1\u09B2\u09A4\u09C7 \u0995\u09BE\u09B0\u09CD\u09A1 \u09A5\u09C7\u0995\u09C7 "\u09A8\u09AE\u09CD\u09AC\u09B0 \u09AC\u09A6\u09B2\u09BE\u09A8" \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964 (Use the saved card or change its number.)');
      if (!$ && A.length < 6 && y.set(b, { list: [...A, { methodId: n, accountNumber: r, holderName: i, ...c ? { bankName: c, branch: d } : {}, savedAt: Date.now() }], updatedAt: Date.now() }), T.kind === "bank" && (c.length < 2 || d.length < 2 || i.length < 2)) throw g.bad("Bank name, branch and account holder name are required for a bank withdrawal.");
      let E = Math.max(u.min || 0, T.withdrawMin || 0), I = Math.min(u.max || 1 / 0, T.withdrawMax || 1 / 0);
      if (o < E || o > I) throw g.bad(`Amount must be between ${E} and ${I === 1 / 0 ? "\u221E" : I}.`);
      let K = s === "auto" ? m : [s], te = g.planDebit(k.data().balances, o, K), F = {};
      for (let [ae, xe] of Object.entries(te)) F[ae] = -xe;
      g.applyDelta(y, k.ref, F), g.ledger(y, { uid: t, type: "withdraw_hold", direction: "out", amount: o, bucket: Object.keys(te)[0], note: T.name, ref: w.id }), g.notify(y, t, "Withdrawal requested", `${o} is waiting for approval (you receive ${g.round2(o - p)}).`, "withdraw"), y.set(w, {
        uid: t,
        username: k.data().username,
        methodId: n,
        methodName: T.name,
        bucket: Object.keys(te)[0],
        plan: te,
        holderName: i,
        accountNumber: r,
        ...c ? { bankName: c, branch: d } : {},
        amount: o,
        fee: p,
        net: g.round2(o - p),
        status: "pending",
        stage: "new",
        note: "",
        createdAt: je.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), g.bumpStats(y, { pendingWithdrawals: 1 });
    }), { ok: !0, withdrawalId: w.id, fee: p, net: g.round2(o - p) };
  });
  Xe.reviewWithdrawal = ct({ region: dt }, async (e) => {
    let t = g.requireRole(e, ["super", "finance"]), a = e.data || {}, n = g.str(a.withdrawalId, { max: 80 }), s = a.action === "approve";
    if (!s && a.action !== "reject") throw g.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "";
    return await P.runTransaction(async (r) => {
      let i = P.doc(`withdrawals/${n}`), c = await r.get(i);
      if (!c.exists) throw new x("not-found", "Withdrawal not found.");
      let d = c.data();
      if (d.status !== "pending") throw new x("failed-precondition", `Already ${d.status}.`);
      if (d.stage === "paid_review") throw new x("failed-precondition", "An agent already paid this. Review it in Payout Review.");
      if (d.assignedTo && s) throw new x("failed-precondition", "This request is assigned to a payout agent. Unassign it first.");
      d.assignedTo && r.update(P.doc(`payoutAgents/${d.assignedTo}`), { openCount: je.increment(-1) }), ga.finalize(r, i, d, s, t, o), g.audit(r, t, s ? "withdraw_approved" : "withdraw_rejected", { withdrawalId: n, amount: d.amount, uid: d.uid });
    }), { ok: !0 };
  });
  Xe.saveWithdrawSettings = ct({ region: dt }, async (e) => {
    let t = g.requireRole(e, ["super", "finance"]), a = e.data || {}, n = (c, d, l, u) => {
      let m = Number(c);
      if (!Number.isFinite(m) || m < d || m > l) throw g.bad(`${u} must be between ${d} and ${l}.`);
      return g.round2(m);
    }, s = {
      enabled: a.enabled !== !1,
      min: n(a.min ?? 0, 0, 1e7, "Minimum"),
      max: n(a.max ?? 0, 0, 1e8, "Maximum"),
      feePct: n(a.feePct ?? 0, 0, 50, "Fee %"),
      feeFlat: n(a.feeFlat ?? 0, 0, 1e5, "Flat fee"),
      dailyLimit: n(a.dailyLimit ?? 0, 0, 1e8, "Daily limit"),
      dailyCount: Math.floor(n(a.dailyCount ?? 0, 0, 100, "Withdrawals per day")),
      maxPending: Math.floor(n(a.maxPending ?? 3, 1, 20, "Pending at once")),
      processingText: typeof a.processingText == "string" ? a.processingText.trim().slice(0, 80) : "",
      notice: typeof a.notice == "string" ? a.notice.trim().slice(0, 200) : ""
    };
    if (s.max > 0 && s.min > s.max) throw g.bad("Minimum cannot be bigger than maximum.");
    let o = Array.isArray(a.allowedBuckets) ? a.allowedBuckets.filter((c) => ["main", "winning", "referral", "commission"].includes(c)) : null;
    if (o) {
      if (!o.length) throw g.bad("Pick at least one wallet.");
      s.allowedBuckets = o;
    }
    let r = P.doc("settings/site"), i = (await r.get()).data() || {};
    return await r.set({ withdraw: { ...i.withdraw || {}, ...s } }, { merge: !0 }), g.audit(null, t, "withdraw_settings", s), { ok: !0, withdraw: { ...i.withdraw || {}, ...s } };
  });
});

// supa/shims/functions-firestore.js
var Bs = M((yd, Us) => {
  "use strict";
  Us.exports = { onDocumentCreated: (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "trigger", a;
  } };
});

// src/admin.js
var qs = M((vt) => {
  "use strict";
  var { onCall: wa } = se(), { onDocumentCreated: _i } = Bs(), B = W(), { db: _e, admin: ut, FieldValue: Ii, HttpsError: Ls, REGION: jt } = B;
  vt.adminAdjustBalance = wa({ region: jt }, async (e) => {
    let t = B.requireRole(e, ["super", "finance"]), a = e.data || {}, n = B.str(a.uid, { max: 128 }), s = B.str(a.bucket, { max: 20 });
    if (!B.BUCKETS.includes(s)) throw B.bad("Invalid wallet.");
    let o = B.amountOf(Math.abs(Number(a.delta)), { min: 0.01, max: 1e7, label: "Amount" }) * (Number(a.delta) < 0 ? -1 : 1), r = B.str(a.reason, { min: 3, max: 200, label: "Reason" });
    return await _e.runTransaction(async (i) => {
      let c = _e.doc(`users/${n}`), d = await i.get(c);
      if (!d.exists) throw new Ls("not-found", "User not found.");
      if (B.round2((d.data().balances?.[s] || 0) + o) < 0) throw B.bad("Balance cannot go below zero.");
      B.applyDelta(i, c, { [s]: o }), B.ledger(i, { uid: n, type: "admin_adjust", direction: o > 0 ? "in" : "out", amount: Math.abs(o), bucket: s, note: r }), B.notify(i, n, "Balance updated", `${o > 0 ? "+" : ""}${o} (${r})`, "info"), B.audit(i, t, "balance_adjust", { uid: n, bucket: s, delta: o, reason: r });
    }), { ok: !0 };
  });
  vt.setUserStatus = wa({ region: jt }, async (e) => {
    let t = B.requireRole(e, ["super", "support"]), a = e.data || {}, n = B.str(a.uid, { max: 128 }), s = a.banned === !0, o = typeof a.reason == "string" ? a.reason.trim().slice(0, 200) : "";
    if ((await ut.auth().getUser(n)).customClaims?.admin) throw new Ls("permission-denied", "Staff accounts cannot be banned here.");
    return await _e.doc(`users/${n}`).update({ status: s ? "banned" : "active", banReason: s ? o : "" }), await ut.auth().updateUser(n, { disabled: s }), s && await ut.auth().revokeRefreshTokens(n), B.audit(null, t, s ? "user_banned" : "user_unbanned", { uid: n, reason: o }), { ok: !0 };
  });
  vt.setStaffRole = wa({ region: jt }, async (e) => {
    let t = B.requireRole(e, ["super"]), a = e.data || {}, n = await ut.auth().getUserByEmail(B.str(a.email, { max: 200, label: "Email" })), s = a.role === null ? null : B.str(a.role, { max: 20 });
    if (s && !B.STAFF_ROLES.includes(s)) throw B.bad("Invalid role.");
    if (n.uid === t && s !== "super") throw B.bad("You cannot demote yourself.");
    await ut.auth().setCustomUserClaims(n.uid, s ? { admin: !0, role: s } : { admin: !1, role: null }), await ut.auth().revokeRefreshTokens(n.uid), await _e.doc(`users/${n.uid}`).set({ role: s || "user" }, { merge: !0 });
    let o = _e.doc(`payoutAgents/${n.uid}`), r = await o.get();
    if (s === "payout") {
      let i = (await _e.doc(`users/${n.uid}`).get()).data() || {};
      await o.set(r.exists ? { active: !0, name: i.name || n.displayName || "", email: n.email } : { active: !0, name: i.name || n.displayName || "", email: n.email, methods: [], floatGiven: 0, floatReturned: 0, paidTotal: 0, paidCount: 0, reviewTotal: 0, reviewCount: 0, openCount: 0, createdAt: Date.now() }, { merge: !0 });
    } else r.exists && await o.set({ active: !1 }, { merge: !0 });
    return B.audit(null, t, "staff_role", { uid: n.uid, role: s }), { ok: !0 };
  });
  vt.adminNotify = wa({ region: jt, timeoutSeconds: 300 }, async (e) => {
    let t = B.requireRole(e, ["super", "support"]), a = e.data || {}, n = B.str(a.title, { max: 80, label: "Title" }), s = B.str(a.body, { max: 400, label: "Message" }), o = (i) => ({ ref: _e.collection("users").doc(i).collection("notifications").doc(), data: { title: n, body: s, type: "announcement", read: !1, createdAt: Ii.serverTimestamp() } }), r = 0;
    if (a.uid) {
      let i = o(String(a.uid));
      await i.ref.set(i.data), r = 1;
    } else {
      let i = null;
      for (; ; ) {
        let c = _e.collection("users").where("status", "==", "active").orderBy("__name__").limit(400);
        i && (c = c.startAfter(i));
        let d = await c.get();
        if (d.empty) break;
        let l = _e.batch();
        d.docs.forEach((u) => {
          let m = o(u.id);
          l.set(m.ref, m.data);
        }), await l.commit(), r += d.size, i = d.docs[d.docs.length - 1];
      }
    }
    return B.audit(null, t, "notify", { title: n, recipients: r }), { ok: !0, recipients: r };
  });
  vt.pushOnNotification = _i({ document: "users/{uid}/notifications/{nid}", region: jt }, async (e) => {
    let t = e.data?.data();
    if (!t) return;
    let n = (await _e.collection("users").doc(e.params.uid).collection("devices").get()).docs.map((r) => r.id);
    if (!n.length) return;
    let s = await ut.messaging().sendEachForMulticast({ tokens: n, notification: { title: t.title, body: t.body } }), o = [];
    s.responses.forEach((r, i) => {
      !r.success && /registration-token-not-registered|invalid-registration-token/.test(r.error?.code || "") && o.push(n[i]);
    }), await Promise.all(o.map((r) => _e.doc(`users/${e.params.uid}/devices/${r}`).delete()));
  });
});

// src/math.js
var Fs = M((Ad, js) => {
  "use strict";
  var Gs = be("crypto"), wn = {
    rtp: 0.96,
    plinko: { enabled: !0, minBet: 10, maxBet: 1e4, rows: [8, 10, 12, 14, 16], maxMultiplier: 1e3 },
    wheel: {
      enabled: !0,
      minBet: 10,
      maxBet: 1e4,
      segments: [
        { label: "0x", mult: 0, weight: 26 },
        { label: "0.5x", mult: 0.5, weight: 25 },
        { label: "1x", mult: 1, weight: 20 },
        { label: "1.5x", mult: 1.5, weight: 14 },
        { label: "2x", mult: 2, weight: 9 },
        { label: "3x", mult: 3, weight: 4 },
        { label: "5x", mult: 5, weight: 1.5 },
        { label: "10x", mult: 10, weight: 0.5 }
      ]
    },
    rocket: { enabled: !0, minBet: 10, maxBet: 1e4, growth: 12e-5, maxMultiplier: 1e3 }
  }, Ni = 0.99, yn = () => Gs.randomInt(0, 2 ** 32) / 2 ** 32;
  function bn(e) {
    let t = [], a = 1;
    for (let n = 0; n <= e; n++)
      t.push(a / 2 ** e), a = a * (e - n) / (n + 1);
    return t;
  }
  var $i = { low: { base: 1, spread: 4, e: 2 }, medium: { base: 0.4, spread: 30, e: 3 }, high: { base: 0.15, spread: 300, e: 4.5 } };
  function xs(e, t, a, n = 1e3) {
    let s = $i[t];
    if (!s) throw new Error("bad risk");
    let o = bn(e), r = o.map((c, d) => s.base + Math.pow(Math.abs(d - e / 2) / (e / 2), s.e) * s.spread), i = r.reduce((c, d, l) => c + d * o[l], 0);
    return r.map((c) => Math.min(n, Math.round(c * a / i * 100) / 100));
  }
  function Ei(e, t, a, n) {
    let s = xs(e, t, a, n), o = bn(e);
    return s.reduce((r, i, c) => r + i * o[c], 0);
  }
  function Ri(e) {
    let t = [];
    for (let a = 0; a < e; a++) t.push(Gs.randomInt(0, 2));
    return { path: t, slot: t.reduce((a, n) => a + n, 0) };
  }
  function Di(e) {
    let t = e.reduce((a, n) => a + n.weight, 0);
    return e.reduce((a, n) => a + n.mult * n.weight, 0) / t;
  }
  function Mi(e) {
    let t = e.reduce((n, s) => n + s.weight, 0), a = yn() * t;
    for (let n = 0; n < e.length; n++)
      if (a -= e[n].weight, a < 0) return n;
    return e.length - 1;
  }
  function Pi(e, t = 1e3) {
    let a = yn();
    return Math.min(t, Math.max(1, Math.floor(100 * e / (1 - a)) / 100));
  }
  var Oi = (e, t) => Math.floor(Math.exp(t * e) * 100) / 100, Ui = (e, t) => Math.log(e) / t;
  function Bi(e = {}) {
    let t = { ...wn, ...e };
    for (let a of ["plinko", "wheel", "rocket"]) t[a] = { ...wn[a], ...e[a] || {} };
    return t;
  }
  js.exports = {
    DEFAULTS: wn,
    MAX_RTP: Ni,
    binomProbs: bn,
    plinkoTable: xs,
    plinkoRtp: Ei,
    plinkoDrop: Ri,
    wheelRtp: Di,
    wheelSpin: Mi,
    rocketCrashPoint: Pi,
    rocketMultiplierAt: Oi,
    rocketCrashTimeMs: Ui,
    mergeConfig: Bi,
    randFloat: yn
  };
});

// src/games.js
var Ks = M((lt) => {
  "use strict";
  var { onCall: St } = se(), L = W(), Ie = Fs(), { db: X, FieldValue: An, HttpsError: ya, REGION: Ct } = L;
  async function ba() {
    let e = await X.doc("settings/games").get();
    return Ie.mergeConfig(e.exists ? e.data() : {});
  }
  function Tn(e, t, a) {
    let n = e[t];
    if (!n.enabled) throw new ya("failed-precondition", "This game is currently disabled.");
    if (e.rtp > Ie.MAX_RTP) throw new ya("failed-precondition", "Game configuration is invalid.");
    if (a < n.minBet || a > n.maxBet) throw L.bad(`Bet must be between ${n.minBet} and ${n.maxBet}.`);
  }
  function kn(e, t, a, n, s, o, r) {
    let i = L.planDebit(a.balances, s, ["main", "winning"]), c = {};
    for (let [d, l] of Object.entries(i)) c[d] = -l;
    L.applyDelta(e, t, c), L.ledger(e, { uid: n, type: "bet", direction: "out", amount: s, bucket: Object.keys(i)[0], note: o, ref: r }), L.bumpStats(e, { betVolume: s });
  }
  function vn(e, t, a, n, s, o) {
    n <= 0 || (L.applyDelta(e, t, { winning: n }), L.ledger(e, { uid: a, type: "win", direction: "in", amount: n, bucket: "winning", note: s, ref: o }), L.bumpStats(e, { winPayout: n }));
  }
  lt.getGameConfig = St({ region: Ct }, async (e) => {
    L.authUid(e);
    let t = await ba(), a = {};
    for (let n of t.plinko.rows) {
      a[n] = {};
      for (let s of ["low", "medium", "high"]) a[n][s] = Ie.plinkoTable(n, s, t.rtp, t.plinko.maxMultiplier);
    }
    return { rtp: t.rtp, plinko: { ...t.plinko, tables: a }, wheel: t.wheel, rocket: t.rocket };
  });
  lt.playPlinko = St({ region: Ct }, async (e) => {
    let t = L.requireVerified(e), a = e.data || {}, n = await ba(), s = L.amountOf(a.bet, { label: "Bet" });
    Tn(n, "plinko", s);
    let o = Number(a.rows), r = String(a.risk);
    if (!n.plinko.rows.includes(o) || !["low", "medium", "high"].includes(r)) throw L.bad("Invalid Plinko settings.");
    let i = Ie.plinkoTable(o, r, n.rtp, n.plinko.maxMultiplier), c = Ie.plinkoDrop(o), d = i[c.slot], l = L.round2(s * d), u = X.collection("gameHistory").doc();
    return await X.runTransaction(async (m) => {
      let p = X.doc(`users/${t}`), h = await m.get(p);
      L.assertActive(h.data()), kn(m, p, h.data(), t, s, "plinko", u.id), vn(m, p, t, l, "plinko", u.id), m.set(u, { uid: t, game: "plinko", bet: s, payout: l, multiplier: d, status: "settled", detail: { rows: o, risk: r, path: c.path, slot: c.slot }, at: An.serverTimestamp() });
    }), { path: c.path, slot: c.slot, multiplier: d, payout: l, historyId: u.id };
  });
  lt.playWheel = St({ region: Ct }, async (e) => {
    let t = L.requireVerified(e), a = e.data || {}, n = await ba(), s = L.amountOf(a.bet, { label: "Bet" });
    Tn(n, "wheel", s);
    let o = n.wheel.segments;
    if (!Array.isArray(o) || o.length < 2 || Ie.wheelRtp(o) > Ie.MAX_RTP) throw new ya("failed-precondition", "Wheel configuration is invalid.");
    let r = Ie.wheelSpin(o), i = o[r].mult, c = L.round2(s * i), d = X.collection("gameHistory").doc();
    return await X.runTransaction(async (l) => {
      let u = X.doc(`users/${t}`), m = await l.get(u);
      L.assertActive(m.data()), kn(l, u, m.data(), t, s, "wheel", d.id), vn(l, u, t, c, "wheel", d.id), l.set(d, { uid: t, game: "wheel", bet: s, payout: c, multiplier: i, status: "settled", detail: { segment: r, label: o[r].label }, at: An.serverTimestamp() });
    }), { segment: r, label: o[r].label, multiplier: i, payout: c, historyId: d.id };
  });
  lt.rocketStart = St({ region: Ct }, async (e) => {
    let t = L.requireVerified(e), a = e.data || {}, n = await ba(), s = L.amountOf(a.bet, { label: "Bet" });
    Tn(n, "rocket", s);
    let o = Ie.rocketCrashPoint(n.rtp, n.rocket.maxMultiplier), r = X.collection("rocketRounds").doc().id, i = Date.now();
    return await X.runTransaction(async (c) => {
      let d = X.doc(`users/${t}`), l = await c.get(d);
      L.assertActive(l.data()), kn(c, d, l.data(), t, s, "rocket", r), c.set(X.doc(`rocketRounds/${r}`), { uid: t, bet: s, startedAt: i, status: "running", growth: n.rocket.growth }), c.set(X.doc(`rocketSecrets/${r}`), { crash: o }), c.set(X.doc(`gameHistory/${r}`), { uid: t, game: "rocket", bet: s, payout: 0, multiplier: 0, status: "running", detail: {}, at: An.serverTimestamp() });
    }), { roundId: r, startedAt: i, growth: n.rocket.growth };
  });
  async function Hs(e, t, a) {
    return X.runTransaction(async (n) => {
      let s = X.doc(`rocketRounds/${t}`), [o, r] = await Promise.all([n.get(s), n.get(X.doc(`rocketSecrets/${t}`))]);
      if (!o.exists || o.data().uid !== e) throw new ya("not-found", "Round not found.");
      let i = o.data(), c = r.data().crash;
      if (i.status !== "running") return { status: i.status, crash: i.status === "running" ? void 0 : c, multiplier: i.cashedAt || null, payout: i.payout || 0 };
      let d = Date.now() - i.startedAt, l = Ie.rocketCrashTimeMs(c, i.growth), u = X.doc(`gameHistory/${t}`);
      if (d >= l)
        return n.update(s, { status: "crashed", payout: 0 }), n.update(u, { status: "settled", detail: { crash: c } }), { status: "crashed", crash: c, payout: 0 };
      let m = Ie.rocketMultiplierAt(d, i.growth);
      if (!a) return { status: "running", multiplier: m };
      let p = L.round2(i.bet * m);
      return vn(n, X.doc(`users/${e}`), e, p, "rocket", t), n.update(s, { status: "cashed", payout: p, cashedAt: m }), n.update(u, { status: "settled", payout: p, multiplier: m, detail: { crash: c } }), { status: "cashed", multiplier: m, payout: p, crash: c };
    });
  }
  lt.rocketPoll = St({ region: Ct }, (e) => Hs(L.authUid(e), L.str((e.data || {}).roundId, { max: 80 }), !1));
  lt.rocketCashout = St({ region: Ct }, (e) => Hs(L.requireVerified(e), L.str((e.data || {}).roundId, { max: 80 }), !0));
});

// src/lotdraw.js
var Ta = M((kd, Ys) => {
  "use strict";
  var Vs = be("crypto"), mt = W(), { db: Fe, FieldValue: Li, HttpsError: Sn } = mt, Aa = (e) => Vs.createHash("sha256").update(String(e)).digest("hex"), Ws = (e, t, a) => parseInt(Aa(`${e}:${t}:${a}`).slice(0, 12), 16) % a;
  async function zs(e) {
    let t = Fe.doc(`lotteries/${e}/private/seed`), a = await t.get();
    if (a.exists) return a.data();
    let n = Vs.randomBytes(32).toString("hex"), s = Aa(n);
    try {
      await t.create({ seed: n, hash: s, at: Date.now() });
    } catch (r) {
      let i = await t.get();
      if (i.exists) return i.data();
      throw r;
    }
    let o = await Fe.doc(`lotteries/${e}`).get();
    return o.exists && !o.data().seedHash && await Fe.doc(`lotteries/${e}`).update({ seedHash: s }), { seed: n, hash: s };
  }
  async function qi(e, t) {
    if (!(await Fe.doc(`lotteries/${e}`).get()).exists) throw new Sn("not-found", "Lottery not found.");
    return await zs(e), Fe.runTransaction(async (n) => {
      let s = Fe.doc(`lotteries/${e}`), o = await n.get(s), r = o.data();
      if (!o.exists || !["open", "closed"].includes(r.status)) throw new Sn("failed-precondition", "Lottery cannot be drawn.");
      let c = (await n.get(Fe.doc(`lotteries/${e}/private/seed`))).data().seed, d = await n.get(Fe.collection("lotteryTickets").where("lotteryId", "==", e).where("status", "==", "active"));
      if (d.empty) throw new Sn("failed-precondition", "No tickets sold.");
      let l = d.docs.slice().sort((y, b) => (Number(y.data().number) || 0) - (Number(b.data().number) || 0)), u = l[Ws(c, e, l.length)], m = u.data(), p = mt.round2(r.prize), h = Fe.doc(`users/${m.uid}`), w = await n.get(h);
      return mt.applyDelta(n, h, { winning: p }), mt.ledger(n, { uid: m.uid, type: "lottery_win", direction: "in", amount: p, bucket: "winning", note: r.title, ref: e }), mt.notify(n, m.uid, "You won the lottery! \u{1F389}", `${r.title}: ${p} added to your winnings.`, "lottery"), n.update(u.ref, { status: "won" }), n.update(s, {
        status: "drawn",
        winnerUid: m.uid,
        winnerName: w.data().username || "",
        winnerTicket: m.number,
        drawnAt: Li.serverTimestamp(),
        drawSeed: c,
        seedHash: Aa(c),
        drawCount: l.length,
        drawBy: t === "auto" ? "auto" : "admin"
      }), mt.bumpStats(n, { lotteryPayout: p }), mt.audit(n, t === "auto" ? "system" : t, "lottery_drawn", { lotteryId: e, winner: m.uid, prize: p, auto: t === "auto" }), { winnerTicket: m.number, winnerUid: m.uid };
    });
  }
  Ys.exports = { sha: Aa, pickIndex: Ws, ensureSeed: zs, drawLottery: qi };
});

// src/engagement.js
var Zs = M((Ft) => {
  "use strict";
  var vd = be("crypto"), { onCall: va } = se(), q = W(), { db: me, FieldValue: ka, HttpsError: Le, REGION: Sa } = q;
  Ft.buyLotteryTickets = va({ region: Sa }, async (e) => {
    let t = q.requireVerified(e), a = e.data || {}, n = q.str(a.lotteryId, { max: 80 }), s = Math.floor(q.amountOf(a.qty, { min: 1, max: 50, label: "Quantity" })), o = [];
    return (await me.doc(`lotteries/${n}`).get()).exists && await Ta().ensureSeed(n), await me.runTransaction(async (r) => {
      let i = me.doc(`lotteries/${n}`), c = me.doc(`users/${t}`), [d, l] = await Promise.all([r.get(i), r.get(c)]);
      q.assertActive(l.data());
      let u = d.data();
      if (!d.exists || u.status !== "open") throw new Le("failed-precondition", "This lottery is closed.");
      if (u.endsAt && u.endsAt.toMillis() <= Date.now()) throw new Le("failed-precondition", "This lottery has ended.");
      if ((u.sold || 0) + s > u.totalTickets) throw new Le("failed-precondition", "Not enough tickets left.");
      let m = l.data().rg?.excludedUntil;
      if ((m?.toMillis ? m.toMillis() : Number(m) || 0) > Date.now()) throw new Le("failed-precondition", "You are on a self-exclusion break.");
      if (Number(u.maxPerUser) > 0 && (await r.get(me.collection("lotteryTickets").where("lotteryId", "==", n).where("uid", "==", t).count())).data().count + s > Number(u.maxPerUser))
        throw new Le("failed-precondition", `Maximum ${u.maxPerUser} tickets per player.`);
      let p = q.round2(u.price * s), h = q.planDebit(l.data().balances, p, ["main", "winning"]), w = {};
      for (let [y, b] of Object.entries(h)) w[y] = -b;
      q.applyDelta(r, c, w), q.ledger(r, { uid: t, type: "lottery", direction: "out", amount: p, bucket: Object.keys(h)[0], note: u.title, ref: n });
      for (let y = 1; y <= s; y++) {
        let b = (u.sold || 0) + y;
        o.push(b), r.set(me.collection("lotteryTickets").doc(), { lotteryId: n, lotteryTitle: u.title, uid: t, number: b, price: u.price, status: "active", createdAt: ka.serverTimestamp() });
      }
      r.update(i, { sold: ka.increment(s) }), q.bumpStats(r, { lotterySales: p });
    }), { ok: !0, numbers: o };
  });
  Ft.adminDrawLottery = va({ region: Sa, timeoutSeconds: 120 }, async (e) => {
    let t = q.requireRole(e, ["super", "finance"]), a = q.str((e.data || {}).lotteryId, { max: 80 });
    return { ok: !0, winnerTicket: (await Ta().drawLottery(a, t)).winnerTicket };
  });
  Ft.adminCancelLottery = va({ region: Sa, timeoutSeconds: 300 }, async (e) => {
    let t = q.requireRole(e, ["super", "finance"]), a = q.str((e.data || {}).lotteryId, { max: 80 });
    await me.runTransaction(async (s) => {
      let o = await s.get(me.doc(`lotteries/${a}`));
      if (!o.exists || !["open", "closed"].includes(o.data().status)) throw new Le("failed-precondition", "Lottery cannot be cancelled.");
      s.update(o.ref, { status: "cancelled" });
    });
    let n = 0;
    for (; ; ) {
      let s = await me.collection("lotteryTickets").where("lotteryId", "==", a).where("status", "==", "active").limit(100).get();
      if (s.empty) break;
      let o = {};
      s.docs.forEach((r) => {
        (o[r.data().uid] ||= []).push(r);
      });
      for (let [r, i] of Object.entries(o))
        await me.runTransaction(async (c) => {
          let l = (await c.getAll(...i.map((m) => m.ref))).filter((m) => m.data().status === "active");
          if (!l.length) return;
          let u = q.round2(l.reduce((m, p) => m + p.data().price, 0));
          q.applyDelta(c, me.doc(`users/${r}`), { main: u }), q.ledger(c, { uid: r, type: "lottery_refund", direction: "in", amount: u, bucket: "main", note: "Lottery cancelled", ref: a }), q.notify(c, r, "Lottery cancelled", `${u} was refunded to your wallet.`, "lottery"), l.forEach((m) => c.update(m.ref, { status: "refunded" })), n += l.length;
        });
    }
    return q.audit(null, t, "lottery_cancelled", { lotteryId: a, refundedTickets: n }), { ok: !0, refundedTickets: n };
  });
  function Xs(e, t) {
    let a = globalThis.crypto && globalThis.crypto.getRandomValues ? globalThis.crypto : be("node:crypto").webcrypto, n = t - e + 1, s = new Uint32Array(1), o = Math.floor(4294967296 / n) * n, r;
    do
      a.getRandomValues(s), r = s[0];
    while (r >= o);
    return e + r % n;
  }
  function Gi(e) {
    let t = e.reduce((n, s) => n + s.weight, 0), a = Xs(1, t);
    for (let n = 0; n < e.length; n++)
      if (a -= e[n].weight, a <= 0) return n;
    return e.length - 1;
  }
  var xi = (e) => (Array.isArray(e) ? e : []).map((t) => ({ amount: Math.round(Number(t && t.amount)), weight: Math.round(Number(t && t.weight)) })).filter((t) => t.amount > 0 && t.amount <= 1e6 && t.weight > 0 && t.weight <= 1e5).slice(0, 12), Js = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 7);
  Ft.claimBonus = va({ region: Sa }, async (e) => {
    let t = q.requireVerified(e), a = q.str((e.data || {}).bonusId, { max: 80 }), n = { once: 1 / 0, daily: 24 * 36e5, weekly: 168 * 36e5, monthly: 0 }, s = 0, o = -1;
    return await me.runTransaction(async (r) => {
      let [i, c, d] = await Promise.all([r.get(me.doc(`bonuses/${a}`)), r.get(me.doc(`users/${t}`)), r.get(me.doc(`bonusClaims/${t}_${a}`))]);
      q.assertActive(c.data());
      let l = i.data();
      if (!i.exists || !l.enabled) throw new Le("failed-precondition", "This bonus is not available.");
      let u = l.type in n ? l.type : "once";
      if (d.exists) {
        if (u === "once") throw new Le("already-exists", "You already claimed this bonus.");
        let p = d.data().lastClaimAt && d.data().lastClaimAt.toMillis ? d.data().lastClaimAt.toMillis() : Number(d.data().lastClaimMs) || 0;
        if (u === "monthly") {
          if (Js(p) === Js(Date.now())) throw new Le("failed-precondition", "Already claimed this month. Available again next month.");
        } else {
          let h = p + n[u] - Date.now();
          if (h > 0) throw new Le("failed-precondition", `Available again in ${Math.ceil(h / 6e4)} min.`);
        }
      }
      let m = xi(l.prizes);
      l.kind === "lucky" && m.length ? (o = Gi(m), s = m[o].amount) : l.kind === "random" && Number(l.maxAmount) > Number(l.amount) ? s = Xs(Math.max(1, Math.round(l.amount)), Math.round(l.maxAmount)) : s = q.round2(l.amount), q.applyDelta(r, c.ref, { main: s }), q.ledger(r, { uid: t, type: "bonus", direction: "in", amount: s, bucket: "main", note: l.title, ref: a }), r.set(d.ref, { uid: t, bonusId: a, lastClaimAt: ka.serverTimestamp(), lastClaimMs: Date.now(), lastAmount: s, count: ka.increment(1) }, { merge: !0 }), q.bumpStats(r, { bonusPaid: s });
    }), { ok: !0, amount: s, prizeIndex: o };
  });
});

// src/ads.js
var eo = M((Qs) => {
  "use strict";
  var { onCall: ji } = se(), _t = W(), { db: Ca, FieldValue: _a } = _t;
  Qs.adEvent = ji({ region: _t.REGION }, async (e) => {
    let t = _t.authUid(e), a = e.data || {}, n = _t.str(a.adId, { max: 80, label: "Ad" }), s = a.type === "click" ? "click" : a.type === "view" ? "view" : "";
    if (!s) throw _t.bad("Invalid event.");
    let o = await Ca.doc("settings/content").get();
    if (!(o.exists && Array.isArray(o.data().ads) ? o.data().ads : []).some((i) => i && i.id === n)) throw _t.bad("Unknown ad.");
    return await Ca.runTransaction(async (i) => {
      let c = Ca.doc(`adSeen/${n}_${t}`), d = await i.get(c), l = d.exists ? d.data() : {}, u = { updatedAt: Date.now() };
      s === "view" ? (u.views = _a.increment(1), l.viewedAt || (u.uniqueViews = _a.increment(1))) : (u.clicks = _a.increment(1), l.clickedAt || (u.uniqueClicks = _a.increment(1))), i.set(Ca.doc(`stats/ad_${n}`), u, { merge: !0 }), i.set(c, { uid: t, [s === "view" ? "viewedAt" : "clickedAt"]: Date.now() }, { merge: !0 });
    }), { ok: !0 };
  });
});

// supa/shims/functions-scheduler.js
var Ia = M((_d, to) => {
  "use strict";
  to.exports = { onSchedule: (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "schedule", a;
  } };
});

// supa/shims/firebase-admin-firestore.js
var no = M((Id, ao) => {
  "use strict";
  var { AggregateField: Fi, FieldValue: Hi } = Ot();
  ao.exports = { AggregateField: Fi, FieldValue: Hi };
});

// src/ag/errors.js
var It = M((Nd, oo) => {
  "use strict";
  var Na = {
    C10000: { msg: "Request succeeded", en: "Success", bn: "\u09B8\u09AB\u09B2 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" },
    C10001: { msg: "General failure within the underlying infrastructure", retry: !0, en: "The game server is busy. Please try again.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09AC\u09CD\u09AF\u09B8\u09CD\u09A4\u0964 \u098F\u0995\u099F\u09C1 \u09AA\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" },
    C10002: { msg: "Invalid Request Parameters", en: "Invalid request.", bn: "\u0985\u09A8\u09C1\u09B0\u09CB\u09A7\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09AF\u09BC\u0964" },
    C10003: { msg: "Invalid HTTP Header", en: "Invalid request.", bn: "\u0985\u09A8\u09C1\u09B0\u09CB\u09A7\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09AF\u09BC\u0964" },
    C10004: { msg: "Invalid Signature", en: "Security check failed.", bn: "\u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE \u09AF\u09BE\u099A\u09BE\u0987 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" },
    C10005: { msg: "Invalid Signature (legacy)", en: "Security check failed.", bn: "\u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE \u09AF\u09BE\u099A\u09BE\u0987 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" },
    C20001: { msg: "Merchant Code Not Found", en: "Game service is not configured.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u098F\u0996\u09A8\u09CB \u09B8\u09C7\u099F\u0986\u09AA \u09B9\u09AF\u09BC\u09A8\u09BF\u0964" },
    C40000: { msg: "Invalid Parameters", en: "Invalid request.", bn: "\u0985\u09A8\u09C1\u09B0\u09CB\u09A7\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09AF\u09BC\u0964" },
    G10001: { msg: "Game Service Error", retry: !0, en: "The game service had a problem. Please try again.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" },
    G10002: { msg: "Error invoking game service", retry: !0, en: "The game service had a problem. Please try again.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" },
    G20001: { msg: "Player is Empty", en: "Player account missing.", bn: "\u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" },
    G20002: { msg: "Game ID Not Found", en: "This game does not exist.", bn: "\u098F\u0987 \u0997\u09C7\u09AE\u099F\u09BF \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" },
    G20003: { msg: "Game Offline", en: "This game is offline.", bn: "\u098F\u0987 \u0997\u09C7\u09AE\u099F\u09BF \u098F\u0996\u09A8 \u09AC\u09A8\u09CD\u09A7 \u0986\u099B\u09C7\u0964" },
    G20004: { msg: "Sub-merchant disabled", en: "Games are temporarily unavailable.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09AE\u09AF\u09BC\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u09AC\u09A8\u09CD\u09A7 \u0986\u099B\u09C7\u0964" },
    G20005: { msg: "Wallet does not exist", en: "Wallet not found for this currency.", bn: "\u098F\u0987 \u0995\u09BE\u09B0\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u0993\u09AF\u09BC\u09BE\u09B2\u09C7\u099F \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" },
    G20006: { msg: "Player does not exist", en: "Player account not found.", bn: "\u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" },
    G20007: { msg: "Sub-merchant does not exist", en: "Games are temporarily unavailable.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09AE\u09AF\u09BC\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u09AC\u09A8\u09CD\u09A7 \u0986\u099B\u09C7\u0964" },
    G20008: { msg: "Balance query error", retry: !0, en: "Could not read your balance. Please try again.", bn: "\u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09AA\u09A1\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" },
    G20009: { msg: "RTP out of range", en: "RTP value is outside the allowed range.", bn: "RTP \u09AE\u09BE\u09A8 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B8\u09C0\u09AE\u09BE\u09B0 \u09AC\u09BE\u0987\u09B0\u09C7\u0964" },
    G20010: { msg: "Game under maintenance", en: "This game is under maintenance.", bn: "\u098F\u0987 \u0997\u09C7\u09AE\u099F\u09BF\u09B0 \u09B0\u0995\u09CD\u09B7\u09A3\u09BE\u09AC\u09C7\u0995\u09CD\u09B7\u09A3 \u099A\u09B2\u099B\u09C7\u0964" },
    G20011: { msg: "Game category does not exist", en: "Category not found.", bn: "\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" },
    G20012: { msg: "Game category disabled", en: "This category is disabled.", bn: "\u098F\u0987 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AC\u09A8\u09CD\u09A7 \u0986\u099B\u09C7\u0964" },
    G20013: { msg: "Merchant info query failed", retry: !0, en: "Game service is busy. Please try again.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u09AC\u09CD\u09AF\u09B8\u09CD\u09A4\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" },
    G30001: { msg: "Session Expired", en: "Your game session expired. Please open the game again.", bn: "\u0997\u09C7\u09AE \u09B8\u09C7\u09B6\u09A8 \u09B6\u09C7\u09B7 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0997\u09C7\u09AE\u099F\u09BF \u0986\u09AC\u09BE\u09B0 \u0996\u09C1\u09B2\u09C1\u09A8\u0964" },
    G30002: { msg: "Insufficient Merchant Balance", en: "Games are temporarily unavailable.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09AE\u09AF\u09BC\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u09AC\u09A8\u09CD\u09A7 \u0986\u099B\u09C7\u0964" },
    G30003: { msg: "Insufficient Player Balance", en: "Insufficient balance.", bn: "\u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09A8\u09C7\u0987\u0964" },
    G30004: { msg: "Launch parameters do not exist", en: "Could not start the game.", bn: "\u0997\u09C7\u09AE \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" },
    G30005: { msg: "Monthly call quota exhausted", en: "Games are temporarily unavailable.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09AE\u09AF\u09BC\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u09AC\u09A8\u09CD\u09A7 \u0986\u099B\u09C7\u0964" },
    G30006: { msg: "Merchant does not support this API mode", en: "Game service is misconfigured.", bn: "\u0997\u09C7\u09AE \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u09B8\u09C7\u099F\u0986\u09AA\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE\u0964" },
    G30007: { msg: "Player account does not exist", en: "Player account not found.", bn: "\u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" },
    G30008: { msg: "Player balance query error", retry: !0, en: "Could not read your balance. Please try again.", bn: "\u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09AA\u09A1\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" },
    G30009: { msg: "Player balance insufficient", en: "Insufficient balance.", bn: "\u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09A8\u09C7\u0987\u0964" },
    G300010: { msg: "Player withdrawal failed", en: "Transfer failed.", bn: "\u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AB\u09BE\u09B0 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" },
    G300011: { msg: "Player account creation failed", retry: !0, en: "Could not create your game account. Please try again.", bn: "\u0997\u09C7\u09AE \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" },
    G300012: { msg: "Player deposit failed", en: "Transfer failed.", bn: "\u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AB\u09BE\u09B0 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" },
    G300013: { msg: "Player bet failed", en: "Bet failed.", bn: "\u09AC\u09C7\u099F \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" },
    G300015: { msg: "Player full withdrawal failed", en: "Transfer failed.", bn: "\u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AB\u09BE\u09B0 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" },
    G300016: { msg: "Merchant order already exists", en: "Duplicate request.", bn: "\u098F\u0995\u0987 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u0986\u0997\u09C7\u0987 \u098F\u09B8\u09C7\u099B\u09C7\u0964" },
    G300017: { msg: "No RTP information found", en: "No RTP setting found.", bn: "\u0995\u09CB\u09A8\u09CB RTP \u09B8\u09C7\u099F\u09BF\u0982 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" },
    G40001: { msg: "Third-party Service Error", retry: !0, en: "The game provider had a problem. Please try again.", bn: "\u0997\u09C7\u09AE \u09AA\u09CD\u09B0\u09CB\u09AD\u09BE\u0987\u09A1\u09BE\u09B0\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" }
  }, so = (e) => Na[e] || { msg: "Unknown error", en: "Something went wrong. Please try again.", bn: "\u0995\u09BF\u099B\u09C1 \u098F\u0995\u099F\u09BE \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" }, Ki = (e) => !!(Na[e] && Na[e].retry), Cn = class extends Error {
    constructor(t, a = "") {
      super(`${t} ${so(t).msg}${a ? ` \u2014 ${a}` : ""}`), this.code = t, this.detail = a;
    }
  };
  oo.exports = { CODES: Na, info: so, isRetryable: Ki, AgError: Cn };
});

// src/ag/config.js
var Ea = M(($d, co) => {
  "use strict";
  var { db: ro } = W(), { AgError: Vi } = It(), Wi = 30 * 1e3, $a = null, _n = 0, io = {
    baseUrl: "",
    merchantCode: "",
    currencyCode: "BD_BDT",
    lang: "bn",
    subMerchantCode: "site",
    terminalType: "PHONE",
    siteUrl: "",
    env: "staging",
    timestampToleranceSec: 300,
    // callbacks older/newer than this are rejected
    verifyResponseSign: "auto",
    // auto = verify when the platform sends X-SIGN; strict = require it; off
    callbackIpWhitelist: [],
    // optional; empty = accept any IP (signature is still required)
    categoryMap: {}
  };
  async function zi({ fresh: e = !1, requireSecret: t = !0 } = {}) {
    if (!e && $a && Date.now() - _n < Wi) return $a;
    let [a, n] = await Promise.all([ro.doc("adminConfig/gameApi").get(), ro.doc("adminPrivate/gameApi").get()]), s = { ...io, ...a.exists ? a.data() : {}, secretKey: n.exists ? String(n.data().secretKey || "") : "" };
    if (s.terminalType = s.terminalType === "PC" ? "PC" : "PHONE", $a = s, _n = Date.now(), t && (!s.baseUrl || !s.merchantCode || !s.secretKey)) throw new Vi("C20001", "Game API is not configured (base URL, merchant code, secret key).");
    return s;
  }
  function Yi() {
    $a = null, _n = 0;
  }
  co.exports = { loadConfig: zi, clearConfigCache: Yi, DEFAULTS: io };
});

// src/ag/sign.js
var $n = M((Ed, po) => {
  "use strict";
  var In = be("crypto"), Ra = "HmacSHA256", Ji = {
    merchant: "x-merchant-code",
    timestamp: "x-timestamp",
    nonce: "x-nonce",
    sign: "x-sign",
    signType: "x-content-processing-type"
  };
  function uo(e, t, a, n, s) {
    let o = s == null ? "" : Buffer.isBuffer(s) ? s.toString("utf8") : String(s);
    return String(e) + String(t) + String(a) + String(n) + o;
  }
  function Nn(e, t, a, n, s, o = Ra) {
    if (!e) throw new Error("Secret key missing");
    return In.createHmac("sha256", Buffer.from(String(e), "utf8")).update(Buffer.from(uo(t, a, n, o, s), "utf8")).digest("hex");
  }
  function lo(e, t) {
    let a = String(e || "").toLowerCase(), n = String(t || "").toLowerCase();
    return !/^[0-9a-f]+$/.test(a) || a.length !== n.length ? !1 : In.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(n, "utf8"));
  }
  function Xi(e, t, a, n, s, o, r = Ra) {
    return lo(Nn(e, t, a, n, s, r), o);
  }
  var mo = () => In.randomBytes(16).toString("hex");
  function Zi(e, t, a) {
    let n = Date.now().toString(), s = mo();
    return {
      "X-MERCHANT-CODE": t,
      "X-TIMESTAMP": n,
      "X-NONCE": s,
      "X-SIGN": Nn(e, t, n, s, a),
      "X-CONTENT-PROCESSING-TYPE": Ra
    };
  }
  function Qi(e, t) {
    if (!e) return "";
    if (typeof e.get == "function") return e.get(t) || "";
    let a = e[t] ?? e[t.toLowerCase()] ?? e[t.toUpperCase()];
    return Array.isArray(a) ? String(a[0]) : a == null ? "" : String(a);
  }
  po.exports = { SIGN_TYPE: Ra, HEADERS: Ji, rawString: uo, sign: Nn, verify: Xi, safeEqualHex: lo, newNonce: mo, signedHeaders: Zi, header: Qi };
});

// src/ag/client.js
var Rn = M((Rd, yo) => {
  "use strict";
  var ec = be("crypto"), Ze = $n(), fo = It(), { db: tc, FieldValue: ac } = W(), En = 12e3, nc = [400, 1200, 2500], sc = 30, ho = () => "TRACE_" + ec.randomBytes(10).toString("hex").toUpperCase(), Ne = class extends Error {
    /** kind: timeout | network | http | badjson | badsign | provider */
    constructor(t, a, n = {}) {
      super(a), this.kind = t, Object.assign(this, n);
    }
  }, go = (e) => e instanceof Ne && ["timeout", "network"].includes(e.kind) || e instanceof Ne && e.kind === "http" && e.status >= 500 || e instanceof Ne && e.kind === "provider" && fo.isRetryable(e.code), oc = (e) => new Promise((t) => setTimeout(t, e)), wo = (e) => e && e.success !== !1 && (e.code === "C10000" || e.code == null && e.success === !0);
  async function rc(e, t, a, n) {
    let s = { "Content-Type": "application/json", ...Ze.signedHeaders(e.secretKey, e.merchantCode, a) }, o = new AbortController(), r = setTimeout(() => o.abort(), En), i, c;
    try {
      i = await n(e.baseUrl.replace(/\/+$/, "") + t, { method: "POST", headers: s, body: a, signal: o.signal }), c = await i.text();
    } catch (m) {
      throw new Ne(
        m.name === "AbortError" ? "timeout" : "network",
        m.name === "AbortError" ? `Provider timed out after ${En / 1e3}s` : `Could not reach provider: ${m.cause?.code || m.message}`
      );
    } finally {
      clearTimeout(r);
    }
    if (!i.ok) throw new Ne("http", `Provider returned HTTP ${i.status}`, { status: i.status, body: String(c).slice(0, 300) });
    let d = Ze.header(i.headers, "X-SIGN"), l = e.verifyResponseSign || "auto";
    if (l !== "off" && (d || l === "strict") && !(d && Ze.verify(
      e.secretKey,
      Ze.header(i.headers, "X-MERCHANT-CODE") || e.merchantCode,
      Ze.header(i.headers, "X-TIMESTAMP"),
      Ze.header(i.headers, "X-NONCE"),
      c,
      d,
      Ze.header(i.headers, "X-CONTENT-PROCESSING-TYPE") || Ze.SIGN_TYPE
    )))
      throw new Ne("badsign", "Provider response signature is invalid");
    let u;
    try {
      u = JSON.parse(c);
    } catch {
      throw new Ne("badjson", "Provider returned a non-JSON response", { body: String(c).slice(0, 300) });
    }
    if (!wo(u)) throw new Ne("provider", `${u.code || "ERROR"}: ${u.msg || fo.info(u.code).msg}`, { code: u.code || "C10001", providerMsg: u.msg });
    return u;
  }
  async function ic(e, t, a = {}, n = {}) {
    let s = n.fetchImpl || fetch, o = n.retries ?? 2, r = { reqTraceId: ho(), ...a }, i = JSON.stringify(r), c = Date.now(), d = 0, l = null, u = null;
    for (; d <= o; d++)
      try {
        u = await rc(e, t, i, s), l = null;
        break;
      } catch (m) {
        if (l = m, !go(m) || d === o) break;
        await oc(nc[d] || 2500);
      }
    if (n.log !== !1) {
      let m = {
        endpoint: t,
        reqTraceId: r.reqTraceId,
        attempts: Math.min(d + 1, o + 1),
        ok: !l,
        code: l ? l.code || l.kind : u.code,
        message: l ? l.message : "",
        latencyMs: Date.now() - c,
        request: i.slice(0, 2e3),
        at: ac.serverTimestamp(),
        expireAt: new Date(Date.now() + sc * 864e5)
      };
      tc.collection("agApiLogs").add(m).catch(() => {
      });
    }
    if (l) throw l;
    return u;
  }
  yo.exports = { call: ic, trace: ho, ClientError: Ne, isSuccess: wo, transient: go, TIMEOUT_MS: En };
});

// src/ag/engine.js
var Ro = M((Dd, Eo) => {
  "use strict";
  var Ht = be("crypto"), { AgError: U } = It(), G = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, Kt = (e) => G(Math.max(0, e)).toFixed(2), cc = /^[A-Za-z0-9_\-.]{1,128}$/, To = 10;
  function re(e, t, a = 128) {
    let n = e[t];
    if (n == null || String(n).trim() === "") throw new U(t === "playerId" ? "G20001" : "C10002", `${t} is required`);
    let s = String(n).trim();
    if (s.length > a) throw new U("C10002", `${t} too long`);
    return s;
  }
  function Da(e, t) {
    let a = e[t];
    if (a == null || a === "") throw new U("C10002", `${t} is required`);
    if (typeof a != "number" && !/^\d+(\.\d+)?$/.test(String(a).trim())) throw new U("C10002", `${t} must be a non-negative decimal`);
    let n = Number(a);
    if (!Number.isFinite(n) || n < 0 || n > 1e12) throw new U("C10002", `${t} out of range`);
    return G(n);
  }
  function bo(e, t, a) {
    let n = e[t];
    if (n == null || n === "") {
      if (a !== void 0) return a;
      throw new U("C10002", `${t} is required`);
    }
    let s = String(n).trim().toLowerCase();
    if (n === !0 || n === 1 || ["true", "1", "y", "yes"].includes(s)) return !0;
    if (n === !1 || n === 0 || ["false", "0", "n", "no"].includes(s)) return !1;
    throw new U("C10002", `${t} must be boolean (got ${typeof n}: ${JSON.stringify(n).slice(0, 40)})`);
  }
  function Ao(e, t) {
    let a = e[t];
    if (a == null || a === "") throw new U("C10002", `${t} is required`);
    let n = Number(a);
    if (!Number.isFinite(n) || n < 0) throw new U("C10002", `${t} must be a Unix ms timestamp`);
    return n;
  }
  function Vt(e) {
    let t = re(e, "playerId");
    if (!cc.test(t)) throw new U("G20006", "playerId has an invalid format");
    return t;
  }
  function Wt(e, t) {
    let a = re(e, "currencyCode", 16);
    if (t.currencyCode && a !== t.currencyCode) throw new U("G20005", `wallet currency is ${t.currencyCode}, got ${a}`);
    return a;
  }
  function pt(e) {
    let t = String(e);
    return /^[A-Za-z0-9_\-.:]{1,200}$/.test(t) && !/^\.+$/.test(t) && !t.startsWith("__") ? t : "h_" + Ht.createHash("sha256").update(t).digest("hex");
  }
  function ko(e) {
    let t = Object.keys(e || {}).filter((a) => a !== "reqTraceId").sort();
    return Ht.createHash("sha256").update(JSON.stringify(t.map((a) => [a, e[a]]))).digest("hex");
  }
  var Qe = (e) => G((Number(e?.main) || 0) + (Number(e?.winning) || 0));
  function Dn(e, t) {
    if (Qe(e) + 1e-9 < t) return null;
    let a = G(t), n = {};
    for (let s of ["main", "winning"]) {
      let o = G(Math.min(Math.max(Number(e?.[s]) || 0, 0), a));
      o > 0 && (n[s] = o, a = G(a - o));
    }
    return a > 0 ? null : n;
  }
  function Mn(e, t, a) {
    let { db: n, FieldValue: s } = e, o = {}, r = {}, i = s.serverTimestamp();
    return {
      delta(c, d) {
        o[c] = G((o[c] || 0) + d);
      },
      stat(c, d) {
        r[c] = G((r[c] || 0) + d);
      },
      ledger(c, d, l, u, m, p, h) {
        u > 0 && t.set(n.collection("transactions").doc(), { uid: c, type: d, direction: l, amount: G(u), bucket: m, note: p, ref: h, createdAt: i });
      },
      flush() {
        let c = {};
        for (let [l, u] of Object.entries(o)) u !== 0 && (c[`balances.${l}`] = s.increment(u));
        Object.keys(c).length && t.update(a, c);
        let d = {};
        for (let [l, u] of Object.entries(r)) u !== 0 && (d[l] = s.increment(u));
        Object.keys(d).length && t.set(n.doc(`statsShards/ag_${Ht.randomInt(0, To)}`), d, { merge: !0 });
      },
      after(c) {
        let d = { ...c || {} };
        for (let [l, u] of Object.entries(o)) d[l] = G((Number(d[l]) || 0) + u);
        return d;
      }
    };
  }
  function vo(e) {
    return "MB" + Ht.createHash("sha1").update(String(e) + Ht.randomBytes(4).toString("hex")).digest("hex").slice(0, 18).toUpperCase();
  }
  function So(e, t, a) {
    if (e.status !== "active") throw new U("G30001", `account is ${e.status}`);
    let n = e.rg?.excludedUntil;
    if ((n?.toMillis ? n.toMillis() : Number(n) || 0) > a) throw new U("G30001", "player is self-excluded");
    if (t && t.status === "forced") throw new U("G30001", "session was force-logged-out");
  }
  async function Pn(e, t, a, n, s) {
    let { db: o, FieldValue: r } = e, i = ko(a);
    return o.runTransaction(async (c) => {
      let d = o.doc(`agTransactions/${t}`), l = await c.get(d);
      if (l.exists) {
        let p = l.data();
        if (p.requestHash !== i) throw new U("G300016", `transactionId already used with a different payload (${t})`);
        return { data: p.response, replay: !0 };
      }
      let { data: u, record: m } = await s(c);
      return c.set(d, { ...n, ...m, requestHash: i, response: u, createdAt: r.serverTimestamp(), at: e.now }), { data: u, replay: !1 };
    });
  }
  async function Co(e, t) {
    let a = Vt(t);
    Wt(t, e.cfg);
    let n = await e.db.doc(`users/${a}`).get();
    if (!n.exists) throw new U("G20006", a);
    return { balance: Kt(Qe(n.data().balances)) };
  }
  async function _o(e, t) {
    let a = Vt(t);
    Wt(t, e.cfg);
    let n = await e.db.doc(`users/${a}`).get();
    if (!n.exists) throw new U("G20006", a);
    let s = n.data(), o = String(e.cfg.siteUrl || "").replace(/\/+$/, ""), r = /^https:\/\//.test(s.photoURL || "") ? s.photoURL : e.cfg.defaultAvatarUrl || (o ? `${o}/icons/icon-192.png` : "");
    return { nickName: String(s.username || s.name || "Player").slice(0, 32), avatarUrl: r };
  }
  async function Io(e, t) {
    let a = Vt(t), n = Wt(t, e.cfg), s = re(t, "gameCode"), o = re(t, "roundId"), r = re(t, "betId"), i = re(t, "transactionId"), c = Da(t, "betAmount"), d = re(t, "timestamp", 40), { db: l } = e;
    return Pn(e, `bet_${pt(i)}`, t, { kind: "bet", transactionId: i, betId: r, roundId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: c, providerTime: d }, async (u) => {
      let m = l.doc(`users/${a}`), p = l.doc(`agBets/${pt(r)}`), h = l.doc(`agSessions/${a}`), [w, y, b] = await Promise.all([u.get(m), u.get(p), u.get(h)]);
      if (!w.exists) throw new U("G20006", a);
      let _ = w.data();
      So(_, b.exists ? b.data() : null, e.now);
      let k = y.exists ? y.data() : null;
      if (k && k.status === "cancelled") throw new U("C10002", `bet ${r} was already cancelled`);
      if (k && k.uid !== a) throw new U("C10002", `bet ${r} belongs to another player`);
      let f = Dn(_.balances, c);
      if (!f) throw new U("G30003", `needs ${c}, has ${Qe(_.balances)}`);
      let T = Mn(e, u, m);
      for (let [I, K] of Object.entries(f)) T.delta(I, -K);
      T.ledger(a, "game_bet", "out", c, Object.keys(f)[0] || "main", s, r), T.stat("agBetVolume", c), T.stat("agBetCount", 1);
      let A = k?.merchantBetId || vo(r), $ = k?.debitPlan || {};
      u.set(p, {
        betId: r,
        merchantBetId: A,
        uid: a,
        playerId: a,
        gameCode: s,
        roundId: o,
        currencyCode: n,
        betAmount: G((k?.betAmount || 0) + c),
        debitPlan: { main: G(($.main || 0) + (f.main || 0)), winning: G(($.winning || 0) + (f.winning || 0)) },
        winAmount: k?.winAmount || 0,
        winReversed: k?.winReversed || 0,
        betRefunded: !1,
        status: k?.status === "settled" ? "settled" : "placed",
        isFree: !1,
        createdAt: k?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: k?.at || e.now
      }, { merge: !0 }), T.flush();
      let E = { merchantBetId: A, balance: Kt(Qe(T.after(_.balances))) };
      return { data: E, record: { merchantBetId: A, balanceAfter: E.balance, debitPlan: f } };
    });
  }
  async function No(e, t) {
    let a = Vt(t), n = Wt(t, e.cfg), s = re(t, "gameCode"), o = re(t, "roundId"), r = re(t, "betId"), i = re(t, "transactionId"), c = Da(t, "betAmount"), d = Da(t, "winAmount"), l = bo(t, "isFree", !1), u = bo(t, "isEnd"), m = Ao(t, "betTime"), p = Ao(t, "settledTime"), h = re(t, "type", 16);
    if (!["win", "bet_win"].includes(h)) throw new U("C10002", "type must be win or bet_win");
    let { db: w } = e;
    return Pn(e, `win_${pt(i)}`, t, { kind: "win", type: h, transactionId: i, betId: r, roundId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: c, winAmount: d, isFree: l, isEnd: u, betTime: m, settledTime: p }, async (y) => {
      let b = w.doc(`users/${a}`), _ = w.doc(`agBets/${pt(r)}`), k = w.doc(`agSessions/${a}`), [f, T, A] = await Promise.all([y.get(b), y.get(_), y.get(k)]);
      if (!f.exists) throw new U("G20006", a);
      let $ = f.data(), E = T.exists ? T.data() : null;
      if (E && E.uid !== a) throw new U("C10002", `bet ${r} belongs to another player`);
      if (E && E.status === "cancelled") throw new U("C10002", `bet ${r} was cancelled`);
      let I = Mn(e, y, b), K = {}, te = h === "bet_win" && !l && c > 0;
      if (te) {
        if (So($, A.exists ? A.data() : null, e.now), K = Dn($.balances, c), !K) throw new U("G30003", `needs ${c}, has ${Qe($.balances)}`);
        for (let [na, sa] of Object.entries(K)) I.delta(na, -sa);
        I.ledger(a, "game_bet", "out", c, Object.keys(K)[0] || "main", s, r), I.stat("agBetVolume", c), I.stat("agBetCount", 1);
      }
      d > 0 && (I.delta("winning", d), I.ledger(a, "game_win", "in", d, "winning", s + (l ? " (free spin)" : ""), r), I.stat("agWinPayout", d)), !E && h === "win" && I.stat("agOrphanWins", 1);
      let F = E?.merchantBetId || vo(r), ae = E?.debitPlan || {};
      y.set(_, {
        betId: r,
        merchantBetId: F,
        uid: a,
        playerId: a,
        gameCode: s,
        roundId: o,
        currencyCode: n,
        betAmount: G((E?.betAmount || 0) + (te ? c : 0)),
        declaredBetAmount: c,
        debitPlan: { main: G((ae.main || 0) + (K.main || 0)), winning: G((ae.winning || 0) + (K.winning || 0)) },
        winAmount: G((E?.winAmount || 0) + d),
        winReversed: E?.winReversed || 0,
        betRefunded: E?.betRefunded || !1,
        isFree: l,
        isEnd: u,
        status: u ? "settled" : E?.status || "placed",
        betTime: m,
        settledTime: u ? p : E?.settledTime || null,
        createdAt: E?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: E?.at || e.now
      }, { merge: !0 }), I.flush();
      let xe = { merchantBetId: F, balance: Kt(Qe(I.after($.balances))) };
      return { data: xe, record: { merchantBetId: F, balanceAfter: xe.balance, debitPlan: K } };
    });
  }
  async function $o(e, t) {
    let a = Vt(t), n = Wt(t, e.cfg), s = re(t, "gameCode"), o = re(t, "betId"), r = re(t, "merchantBetId"), i = Da(t, "betAmount"), c = re(t, "cancelType", 8).toUpperCase(), d = re(t, "transactionId");
    if (!["BET", "WIN"].includes(c)) throw new U("C10002", "cancelType must be BET or WIN");
    let { db: l } = e;
    return Pn(e, `cancel_${pt(d)}`, t, { kind: "cancel", cancelType: c, transactionId: d, betId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: i, merchantBetId: r }, async (u) => {
      let m = l.doc(`users/${a}`), p = l.doc(`agBets/${pt(o)}`), [h, w] = await Promise.all([u.get(m), u.get(p)]);
      if (!h.exists) throw new U("G20006", a);
      let y = h.data(), b = Mn(e, u, m), _ = w.exists ? w.data() : null;
      if (_ && _.uid !== a) throw new U("C10002", `bet ${o} belongs to another player`);
      let k = 0, f = 0, T = "", A = e.FieldValue.serverTimestamp();
      if (!_)
        u.set(p, {
          betId: o,
          merchantBetId: r,
          uid: a,
          playerId: a,
          gameCode: s,
          currencyCode: n,
          betAmount: 0,
          debitPlan: {},
          winAmount: 0,
          winReversed: 0,
          betRefunded: c === "BET",
          status: c === "BET" ? "cancelled" : "placed",
          cancelledBeforeBet: !0,
          createdAt: A,
          updatedAt: A,
          at: e.now
        }), T = "no matching bet; tombstone stored";
      else if (c === "BET") {
        if (_.betRefunded)
          T = "bet already refunded";
        else {
          let I = _.debitPlan || {};
          for (let K of ["main", "winning"]) I[K] > 0 && b.delta(K, I[K]);
          k = G((I.main || 0) + (I.winning || 0)), b.ledger(a, "game_refund", "in", k, "main", `${s} bet cancelled`, o), b.stat("agBetVolume", -k), b.stat("agCancelCount", 1), Math.abs(k - i) > 1e-3 && (T = `refunded the ${k} actually debited (request said ${i})`);
        }
        u.set(p, { status: "cancelled", betRefunded: !0, cancelledAt: A, updatedAt: A }, { merge: !0 });
      } else {
        let I = G((_.winAmount || 0) - (_.winReversed || 0));
        if (I > 0) {
          let K = y.balances || {}, te = G(Math.min(Math.max(Number(K.winning) || 0, 0), I)), F = G(Math.min(Math.max(Number(K.main) || 0, 0), G(I - te))), ae = G(I - te - F);
          te + ae > 0 && b.delta("winning", -(te + ae)), F > 0 && b.delta("main", -F), f = I, b.ledger(a, "game_win_reversal", "out", f, "winning", `${s} win cancelled`, o), b.stat("agWinPayout", -f), b.stat("agCancelCount", 1), ae > 0 && (T = `player balance short by ${ae}; recorded as negative winning balance`, b.stat("agDebt", ae));
        } else T = "nothing to reverse";
        u.set(p, { winReversed: G((_.winReversed || 0) + f), winCancelledAt: A, updatedAt: A }, { merge: !0 });
      }
      b.flush();
      let E = { merchantBetId: _?.merchantBetId || r, betId: o, balance: Kt(Qe(b.after(y.balances))), currencyCode: n };
      return { data: E, record: { refunded: k, reversed: f, note: T, balanceAfter: E.balance } };
    });
  }
  var dc = {
    "/wallet/balance": (e, t) => Co(e, t),
    "/player/info": (e, t) => _o(e, t),
    "/wallet/bet": async (e, t) => (await Io(e, t)).data,
    "/wallet/win": async (e, t) => (await No(e, t)).data,
    "/wallet/cancel": async (e, t) => (await $o(e, t)).data
  };
  Eo.exports = { ROUTES: dc, STAT_SHARDS: To, balance: Co, playerInfo: _o, bet: Io, win: No, cancel: $o, planDebit: Dn, safeId: pt, requestHash: ko, playable: Qe, round2: G, money: Kt };
});

// src/ag/callbacks.js
var Oo = M((Md, Po) => {
  "use strict";
  var uc = be("crypto"), He = $n(), pe = It(), { ROUTES: Do, requestHash: lc } = Ro(), mc = 24 * 36e5, pc = 90;
  function Ma(e, t = null, a) {
    return { success: e === "C10000", code: e, msg: a || pe.info(e).msg, data: e === "C10000" ? t : null };
  }
  function Mo(e) {
    let t = String(e || "").split("?")[0].replace(/\/+$/, "");
    return Object.keys(Do).find((a) => t === a || t.endsWith(a)) || null;
  }
  function fc(e, t) {
    let a = He.header(e, "x-forwarded-for");
    return (a ? a.split(",")[0] : t || "").trim();
  }
  var On = Ya(), hc = (e, t) => On.run(() => gc(e, t));
  async function gc(e, t) {
    let a = Date.now(), n = Mo(t.path), s = Buffer.isBuffer(t.rawBody) ? t.rawBody.toString("utf8") : String(t.rawBody ?? ""), o = null, r, i = "";
    try {
      if (t.method !== "POST") throw new pe.AgError("C10003", "POST required");
      if (!n) throw new pe.AgError("C10002", `unknown endpoint ${t.path}`);
      let m = t.headers || {}, p = He.header(m, "X-MERCHANT-CODE"), h = He.header(m, "X-TIMESTAMP"), w = He.header(m, "X-NONCE"), y = He.header(m, "X-SIGN"), b = He.header(m, "X-CONTENT-PROCESSING-TYPE");
      if (!p || !h || !w || !y || !b) throw new pe.AgError("C10003", "missing signature headers");
      if (w.length > 64 || y.length > 256) throw new pe.AgError("C10003", "header too long");
      if (!e.cfg.merchantCode || !e.cfg.secretKey) throw new pe.AgError("C20001", "merchant not configured on our side");
      if (p !== e.cfg.merchantCode) throw new pe.AgError("C20001", `unknown merchant ${p}`);
      if (b !== He.SIGN_TYPE) throw new pe.AgError("C10003", `unsupported signType ${b}`);
      let _ = Number(h), k = (Number(e.cfg.timestampToleranceSec) || 300) * 1e3;
      if (!/^\d{10,16}$/.test(h) || !Number.isFinite(_) || Math.abs(e.now - _) > k) throw new pe.AgError("C10003", "timestamp outside allowed window");
      if (!He.verify(e.cfg.secretKey, p, h, w, s, y, b)) throw new pe.AgError("C10004");
      let f = Array.isArray(e.cfg.callbackIpWhitelist) ? e.cfg.callbackIpWhitelist.filter(Boolean) : [];
      if (f.length && !f.includes(t.ip)) throw new pe.AgError("C10003", `IP ${t.ip} not allowed`);
      try {
        o = JSON.parse(s || "{}");
      } catch {
        throw new pe.AgError("C10002", "body is not valid JSON");
      }
      if (!o || typeof o != "object" || Array.isArray(o)) throw new pe.AgError("C10002", "body must be a JSON object");
      let T = e.db.doc(`agNonces/${uc.createHash("sha256").update(p + ":" + w).digest("hex")}`), A = lc(o);
      try {
        await T.create({ route: n, bodyHash: A, at: e.now, expireAt: new Date(e.now + mc) });
      } catch (E) {
        if (!(E.code === 6 || /ALREADY_EXISTS/i.test(String(E.message || E)))) throw E;
        let I = await T.get();
        if (!I.exists || I.data().bodyHash !== A) throw new pe.AgError("C10003", "nonce already used (replay)");
        i = "identical retry (same nonce + payload)";
      }
      let $ = await Do[n](e, o);
      r = Ma("C10000", $);
    } catch (m) {
      m instanceof pe.AgError ? (r = Ma(m.code), i = m.detail || i) : (r = Ma("C10001"), i = String(m && m.stack || m).slice(0, 500));
    }
    On.mark("done");
    let c = On.summary();
    c && Date.now() - a > 1500 && (i = (i ? i + " | " : "") + "timing " + c);
    let d = JSON.stringify(r), l = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
    e.cfg.secretKey && e.cfg.merchantCode && Object.assign(l, He.signedHeaders(e.cfg.secretKey, e.cfg.merchantCode, d));
    let u = {
      route: n || String(t.path || "").slice(0, 100),
      code: r.code,
      ok: r.code === "C10000",
      detail: i,
      playerId: o?.playerId || "",
      transactionId: o?.transactionId || "",
      betId: o?.betId || "",
      reqTraceId: o?.reqTraceId || "",
      ip: t.ip || "",
      latencyMs: Date.now() - a,
      request: s.slice(0, 2e3),
      response: d.slice(0, 1e3),
      at: e.now,
      expireAt: new Date(e.now + pc * 864e5)
    };
    return { status: t.method === "POST" ? 200 : 405, headers: l, body: d, log: u };
  }
  Po.exports = { handle: hc, wrap: Ma, routeOf: Mo, clientIp: fc };
});

// src/ag/platform.js
var Bn = M((ie) => {
  "use strict";
  var Bo = be("net"), { onCall: $e, onRequest: wc, HttpsError: et } = se(), { onSchedule: Lo } = Ia(), { AggregateField: Nt } = no(), S = W(), { db: D, admin: yc, FieldValue: Z, REGION: ge } = S, $t = It(), { loadConfig: Ke, clearConfigCache: bc, DEFAULTS: qo } = Ea(), fe = Rn(), Uo = Oo(), Ac = ["slots", "live", "sports", "fishing", "lottery", "cards", "crash"], Tc = (e = "", t = "", a = "") => {
    let n = `${e} ${t} ${a}`.toUpperCase();
    return /LIVE|BACCARAT|ROULETTE/.test(n) ? "live" : /SPORT/.test(n) ? "sports" : /FISH/.test(n) ? "fishing" : /LOTT|KENO|BINGO/.test(n) ? "lottery" : /CARD|POKER|RUMMY|TEEN|ANDAR|TABLE/.test(n) ? "cards" : /CRASH|AVIATOR|ROCKET/.test(n) ? "crash" : "slots";
  }, Pa = (e) => String(e).replace(/[\/\s]/g, "_").slice(0, 400), kc = ["BR_BRL", "GB_GBP", "DK_DKK", "DE_EUR", "ES_EUR", "FI_EUR", "FR_EUR", "ID_IDR", "IT_EUR", "NL_EUR", "NO_NOK", "PL_PLN", "PT_EUR", "TH_THB", "TR_TRY", "VN_VND", "MM_MMK", "SG_SGD", "NG_NGN", "US_USD", "PK_PKR", "CO_COP", "PH_PHP", "MX_MXN", "AR_ARS", "KE_KES", "CL_CLP", "ZA_ZAR", "BD_BDT", "IN_INR", "LK_LKR"], Go = ["en", "ar", "az", "bg", "bn", "cs", "da", "de", "el", "en-stkus", "es", "et", "fa", "fi", "fr", "hi", "hu", "hy", "id", "it", "ja", "ko", "lo", "lt", "mn", "my", "ms", "nl", "no", "pl", "pt", "pt-br", "ro", "ru", "sh", "si", "sk", "sq", "sv", "th", "tr", "uk", "ur", "uz", "vi"];
  function Un(e, t = "Game service error") {
    if (e instanceof et) return e;
    if (e instanceof $t.AgError || e instanceof fe.ClientError && e.kind === "provider") {
      let a = e.code || "C10001", n = $t.info(a);
      return new et("failed-precondition", n.en, { agCode: a, bn: n.bn, providerMsg: e.providerMsg || e.detail || "", retry: $t.isRetryable(a) });
    }
    if (e instanceof fe.ClientError) {
      let a = {
        timeout: "The game provider did not respond in time. Please try again.",
        network: "Could not reach the game provider. Please try again.",
        http: `The game provider returned an error (HTTP ${e.status}).`,
        badjson: "The game provider sent an invalid response.",
        badsign: "The game provider response failed the security check."
      }[e.kind] || t;
      return new et("unavailable", a, { kind: e.kind, status: e.status || null, retry: ["timeout", "network", "http"].includes(e.kind) });
    }
    return console.error(e), new et("internal", t);
  }
  var qe = (e) => async (t) => {
    try {
      return await e(t);
    } catch (a) {
      throw Un(a);
    }
  }, vc = (e) => {
    let a = String(e.rawRequest?.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || String(e.rawRequest?.ip || "").replace(/^::ffff:/, "");
    return Bo.isIP(a) ? a : "";
  }, ft = (e, t, a, n) => {
    let s = Number(e);
    if (!Number.isInteger(s) || s < t || s > a) throw S.bad(`${n} must be a whole number ${t}-${a}.`);
    return s;
  }, Ua = (e, t) => {
    let a = S.str(e, { max: 40, label: t }), n = Date.parse(a);
    if (!Number.isFinite(n)) throw S.bad(`${t} must be an ISO-8601 date/time.`);
    return { s: new Date(n).toISOString(), ms: n };
  }, Oa = /^[A-Za-z0-9-]{1,50}$/, zt = /^[A-Za-z0-9_\-.]{1,128}$/;
  ie.agCallback = wc({ region: ge, timeoutSeconds: 30, memory: "256MiB", minInstances: 0, concurrency: 80, invoker: "public" }, async (e, t) => {
    let a;
    try {
      a = await Ke({ requireSecret: !1 });
    } catch {
      a = { ...qo };
    }
    let n = await Uo.handle({ db: D, FieldValue: Z, cfg: a, now: Date.now() }, {
      method: e.method,
      path: e.path || e.url,
      headers: e.headers,
      rawBody: e.rawBody || Buffer.from(""),
      ip: Uo.clientIp(e.headers, e.ip)
    });
    D.collection("agCallbackLogs").add({ ...n.log, at: Z.serverTimestamp(), atMs: n.log.at }).catch((s) => console.error("log", s.message)), n.log.code === "C10001" && console.error("agCallback internal error", n.log.detail), t.status(n.status).set(n.headers).send(n.body);
  });
  ie.adminSaveGameApiConfig = $e({ region: ge }, qe(async (e) => {
    let t = S.requireRole(e, ["super"]), a = e.data || {}, n = S.str(a.baseUrl, { max: 200, label: "Base URL", pattern: /^https:\/\/[^\s]+$/ }).replace(/\/+$/, ""), s = S.str(a.currencyCode || "BD_BDT", { max: 20, label: "Currency" });
    if (!kc.includes(s)) throw S.bad("Unsupported currency code (see PDF \xA72.7).");
    let o = S.str(a.lang || "bn", { max: 10, label: "Language" });
    if (!Go.includes(o)) throw S.bad("Unsupported language (see PDF \xA72.8).");
    let r = S.str(a.subMerchantCode || "site", { max: 50, label: "Sub-merchant code", pattern: Oa }), i = a.siteUrl ? S.str(a.siteUrl, { max: 200, label: "Site URL", pattern: /^https:\/\/[^\s/]+(\/[^\s]*)?$/ }).replace(/\/+$/, "") : "", c = (Array.isArray(a.callbackIpWhitelist) ? a.callbackIpWhitelist : String(a.callbackIpWhitelist || "").split(/[\s,]+/)).map((u) => String(u).trim()).filter(Boolean);
    if (c.some((u) => !Bo.isIP(u))) throw S.bad("IP allow-list contains an invalid IP address.");
    let d = {
      baseUrl: n,
      merchantCode: S.str(a.merchantCode, { max: 64, label: "Merchant code" }),
      currencyCode: s,
      lang: o,
      subMerchantCode: r,
      siteUrl: i,
      terminalType: a.terminalType === "PC" ? "PC" : "PHONE",
      env: a.env === "prod" ? "prod" : "staging",
      verifyResponseSign: ["auto", "strict", "off"].includes(a.verifyResponseSign) ? a.verifyResponseSign : "auto",
      timestampToleranceSec: ft(a.timestampToleranceSec ?? 300, 30, 900, "Timestamp tolerance"),
      callbackIpWhitelist: c.slice(0, 50),
      categoryMap: typeof a.categoryMap == "object" && a.categoryMap ? a.categoryMap : {},
      updatedAt: Z.serverTimestamp(),
      updatedBy: t
    };
    await D.doc("adminConfig/gameApi").set(d, { merge: !0 });
    let l = typeof a.secretKey == "string" && a.secretKey.trim().length > 0;
    return l && await D.doc("adminPrivate/gameApi").set({ secretKey: a.secretKey.trim(), rotatedAt: Z.serverTimestamp() }), await D.doc("adminConfig/gameApiStatus").set({ ok: !1, testedAt: null, message: "Configuration changed \u2014 run the connection test." }), bc(), S.audit(null, t, "game_api_config", { baseUrl: n, merchantCode: d.merchantCode, env: d.env, secretChanged: l }), { ok: !0 };
  }));
  ie.adminGetGameApiConfig = $e({ region: ge }, qe(async (e) => {
    S.requireRole(e, ["super"]);
    let [t, a, n, s] = await Promise.all([D.doc("adminConfig/gameApi").get(), D.doc("adminPrivate/gameApi").get(), D.doc("adminConfig/gameApiStatus").get(), D.doc("adminConfig/agMerchant").get()]), o = String((globalThis.__ENV || process.env).SUPABASE_URL || "").replace(/\/+$/, ""), r = { ...qo, ...t.exists ? t.data() : {} };
    return delete r.updatedAt, {
      config: r,
      secretSet: a.exists && !!a.data().secretKey,
      status: n.exists ? { ...n.data(), testedAt: n.data().testedAt?.toMillis?.() || null } : null,
      merchant: s.exists ? { ...s.data(), syncedAt: s.data().syncedAt?.toMillis?.() || null } : null,
      callbackUrls: [o ? `${o}/functions/v1/api/agw` : null].filter(Boolean)
    };
  }));
  ie.adminTestGameApi = $e({ region: ge, timeoutSeconds: 60 }, async (e) => {
    S.requireRole(e, ["super"]);
    let t = Date.now(), a;
    try {
      let n = await Ke({ fresh: !0 }), o = ((await fe.call(n, "/game/v5/providers", {}, { retries: 0 })).data?.providers || []).length;
      a = { ok: !0, latencyMs: Date.now() - t, message: `Connected \u2014 ${o} provider(s) returned.`, providerCount: o };
    } catch (n) {
      let s = Un(n);
      a = { ok: !1, latencyMs: Date.now() - t, message: n.message || s.message, agCode: s.details?.agCode || null, kind: n.kind || s.details?.kind || "config", httpStatus: n.status || null };
    }
    return await D.doc("adminConfig/gameApiStatus").set({ ...a, testedAt: Z.serverTimestamp() }), a;
  });
  ie.adminSyncGames = $e({ region: ge, timeoutSeconds: 540, memory: "512MiB" }, qe(async (e) => {
    let t = S.requireRole(e, ["super", "content"]), a = await Ke({ fresh: !0 }), s = ((await fe.call(a, "/game/v5/providers", {})).data?.providers || []).map((u) => typeof u == "string" ? { name: u, code: u } : u);
    await D.doc("adminConfig/agProviders").set({ providers: s, syncedAt: Z.serverTimestamp() });
    let o = (await fe.call(a, "/game/v5/categories", { currencyCode: a.currencyCode, lang: a.lang })).data?.categoryDataList || [], r = 0, i = [], c = /* @__PURE__ */ new Set(), d = new Set((await D.collection("games").limit(2e4).get()).docs.map((u) => u.id));
    for (let u of o) {
      let m = u.categoryCode || u.code;
      if (!m) continue;
      let p = (a.categoryMap || {})[m] || Tc(m, u.categoryName), h = 0;
      for (let w = 1; w <= 200; w++) {
        let y = await fe.call(a, "/game/v5/games", { categoryCode: m, currencyCode: a.currencyCode, lang: a.lang, pageIndex: w }), b = y.data?.gameItemList || y.data?.gameltemList || [];
        if (!b.length) break;
        let _ = D.batch();
        for (let f of b) {
          let T = f.gameCode;
          if (!T) continue;
          let A = Number.isInteger(Number(f.status)) ? Number(f.status) : 1;
          _.set(D.doc(`games/${Pa(T)}`), {
            gameCode: String(T),
            name: f.gameName || f.name || String(T),
            gameType: f.gameType || "",
            status: A,
            imageUrl: f.imageUrl || f.gameIcon || f.iconUrl || "",
            provider: f.providerCode || f.provider || "",
            categoryCode: m,
            categoryName: u.categoryName || m,
            lobbyCategory: p,
            syncedAt: Z.serverTimestamp(),
            ...d.has(Pa(T)) ? {} : { addedAt: Date.now() }
          }, { merge: !0 }), c.add(String(T)), r++, h++;
        }
        await _.commit();
        let k = Number(y.data?.totalSize) || 0;
        if (k && h >= k) break;
      }
      i.push({ code: m, name: u.categoryName || m, lobby: p, count: h });
    }
    let l = D.batch();
    return i.forEach((u) => l.set(D.doc(`gameCategories/${Pa(u.code)}`), { ...u, syncedAt: Z.serverTimestamp() }, { merge: !0 })), await l.commit(), S.audit(null, t, "games_synced", { providers: s.length, categories: i.length, games: r, unique: c.size }), { ok: !0, providers: s.length, categories: i.length, games: c.size };
  }));
  function Sc(e, t) {
    let a = String(e.rawRequest?.headers?.origin || "").replace(/\/+$/, ""), n = [t.siteUrl, String((globalThis.__ENV || process.env).SITE_URL || "").replace(/\/+$/, "")].filter(Boolean);
    if (a && (n.includes(a) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(a))) return a;
    if (t.siteUrl) return t.siteUrl;
    throw new et("failed-precondition", "Set the Site URL in Admin \u2192 Game API (needed for the game exit page).");
  }
  ie.launchGame = $e({ region: ge, timeoutSeconds: 30 }, qe(async (e) => {
    let t = S.requireVerified(e), a = e.data || {}, n = S.str(a.gameCode, { max: 120, label: "Game" }), [s, o, r] = await Promise.all([D.doc(`games/${Pa(n)}`).get(), D.doc(`users/${t}`).get(), Ke()]), i = o.data();
    S.assertActive(i);
    let c = i.rg?.excludedUntil;
    if ((c?.toMillis ? c.toMillis() : Number(c) || 0) > Date.now()) throw new et("failed-precondition", "You are on a self-exclusion break. Games are unavailable until it ends.");
    if (!s.exists || s.data().enabled === !1) throw new $t.AgError("G20002");
    if (s.data().status === 0) throw new $t.AgError("G20003");
    if (s.data().status === 2) throw new $t.AgError("G20010");
    let d = vc(e);
    if (!d) throw new et("failed-precondition", "Could not determine your IP address.");
    let l = a.terminalType === "PC" ? "PC" : a.terminalType === "PHONE" ? "PHONE" : r.terminalType, u = Sc(e, r), m = {
      gameCode: s.data().gameCode,
      playerId: t,
      currencyCode: r.currencyCode,
      language: Go.includes(a.language) ? a.language : r.lang,
      terminalType: l,
      returnUrl: `${u}/exitGame.html?game=${encodeURIComponent(s.data().gameCode)}`,
      ipAddress: d,
      subMerchantCode: r.subMerchantCode || "site",
      nickName: String(i.username || i.name || "Player").slice(0, 32)
    };
    /^https:\/\//.test(i.photoURL || "") && (m.avatarUrl = i.photoURL);
    let p = await fe.call(r, "/game/v5/game/url", m), h = p.data?.gameUrl || p.data?.url;
    if (!h || !/^https?:\/\//.test(h)) throw new et("unavailable", "The game provider did not return a game URL.");
    return await D.doc(`agSessions/${t}`).set({
      uid: t,
      status: "active",
      gameCode: s.data().gameCode,
      gameName: s.data().name || "",
      terminalType: l,
      ip: d,
      expireTime: p.data?.expireTime || null,
      launchedAt: Z.serverTimestamp(),
      launchedAtMs: Date.now(),
      closedAt: null,
      forcedAt: null
    }, { merge: !0 }), await D.collection("gameHistory").add({ uid: t, game: s.data().gameCode, provider: "ag", status: "launched", at: Z.serverTimestamp() }), { gameUrl: h, gameCode: s.data().gameCode, gameName: s.data().name || "", expireTime: p.data?.expireTime || null };
  }));
  ie.agExitGame = $e({ region: ge }, qe(async (e) => {
    let t = S.authUid(e), a = D.doc(`agSessions/${t}`);
    return await D.runTransaction(async (n) => {
      let s = await n.get(a);
      s.exists && s.data().status === "active" && n.update(a, { status: "closed", closedAt: Z.serverTimestamp() });
    }), { ok: !0 };
  }));
  async function xo(e, t, a, { revokeTokens: n = !1, reason: s = "" } = {}) {
    let o = "SKIPPED", r = "";
    try {
      let i = await fe.call(e, "/game/v5/player/force/logout", { playerId: t });
      o = i.data?.logoutStatus || "SUCCESS", r = i.data?.message || "";
    } catch (i) {
      o = "FAILED", r = Un(i).message;
    }
    return await D.doc(`agSessions/${t}`).set({ uid: t, status: "forced", forcedAt: Z.serverTimestamp(), forcedBy: a, forceReason: s, providerLogout: o }, { merge: !0 }), n && (await yc.auth().revokeRefreshTokens(t), await D.doc(`users/${t}`).set({ sessionsRevokedAt: Z.serverTimestamp() }, { merge: !0 })), await D.collection("users").doc(t).collection("notifications").add({
      title: "Signed out of games",
      body: s || "Your game session was ended by support.",
      type: "security",
      read: !1,
      createdAt: Z.serverTimestamp()
    }), { playerId: t, logoutStatus: o, message: r };
  }
  ie.adminForceLogout = $e({ region: ge, timeoutSeconds: 300 }, qe(async (e) => {
    let t = S.requireRole(e, ["super", "support"]), a = e.data || {}, n = await Ke(), s = typeof a.reason == "string" ? a.reason.trim().slice(0, 200) : "", o = [];
    a.all === !0 ? o = (await D.collection("agSessions").where("status", "==", "active").limit(200).get()).docs.map((c) => c.id) : o = [S.str(a.uid, { max: 128, label: "Player", pattern: zt })];
    let r = [];
    for (let i of o) r.push(await xo(n, i, t, { revokeTokens: a.revokeTokens === !0, reason: s }));
    return S.audit(null, t, "ag_force_logout", { count: r.length, all: a.all === !0, revokeTokens: a.revokeTokens === !0, failed: r.filter((i) => i.logoutStatus === "FAILED").length }), { ok: !0, results: r };
  }));
  ie.forceLogoutOne = xo;
  ie.adminAgRtp = $e({ region: ge, timeoutSeconds: 60 }, qe(async (e) => {
    let t = S.requireRole(e, ["super", "finance"]), a = e.data || {}, n = await Ke(), s = n.currencyCode, o, r = null;
    switch (a.action) {
      case "subMerchant": {
        let i = S.str(a.subMerchantCode || n.subMerchantCode, { max: 50, label: "Sub-merchant", pattern: Oa }), c = ft(a.rtp, 1, 100, "RTP");
        o = await fe.call(n, "/game/v5/set/sub/merchant/rtp", { subMerchantCode: i, rtp: c, currencyCode: s }), r = { scope: "SUB_MERCHANT", subMerchantCode: i, rtp: c, changed: o.data?.changedRtpValue };
        break;
      }
      case "player": {
        let i = S.str(a.playerId, { max: 128, label: "Player", pattern: zt }), c = ft(a.rtp, 1, 100, "RTP");
        o = await fe.call(n, "/game/v5/set/player/rtp", { currencyCode: s, rtp: c, playerId: i }), r = { scope: "PLAYER", playerId: i, rtp: c, changed: o.data?.changedRtpValue };
        break;
      }
      case "batch": {
        let i = [...new Set((Array.isArray(a.playerIds) ? a.playerIds : []).map((d) => String(d).trim()).filter(Boolean))];
        if (!i.length || i.length > 50) throw S.bad("Provide 1-50 player IDs.");
        if (i.some((d) => !zt.test(d))) throw S.bad("One of the player IDs is invalid.");
        let c = ft(a.rtp, 1, 100, "RTP");
        o = await fe.call(n, "/game/v5/batch/set/player/rtp", { currencyCode: s, rtp: c, playerIds: i }), r = { scope: "BATCH", playerIds: i, rtp: c, accepted: !0 };
        break;
      }
      case "effective": {
        let i = { currencyCode: s };
        a.subMerchantCode && (i.subMerchantCode = S.str(a.subMerchantCode, { max: 50, pattern: Oa, label: "Sub-merchant" })), a.playerId && (i.playerId = S.str(a.playerId, { max: 128, pattern: zt, label: "Player" })), o = await fe.call(n, "/game/v5/rtp/effective", i);
        break;
      }
      case "history": {
        let i = Ua(a.startTime, "Start time"), c = Ua(a.endTime, "End time");
        if (i.ms >= c.ms) throw S.bad("Start time must be before end time.");
        if (i.ms < Date.now() - 31 * 864e5) throw S.bad("Only the past month can be queried (PDF \xA75.4.4).");
        let d = { currencyCode: s, startTime: i.s, endTime: c.s, pageSize: ft(a.pageSize ?? 20, 1, 100, "Page size") };
        a.cursor && (d.cursor = S.str(a.cursor, { max: 200, label: "Cursor" })), a.subMerchantCode && (d.subMerchantCode = S.str(a.subMerchantCode, { max: 50, pattern: Oa, label: "Sub-merchant" })), a.playerId && (d.playerId = S.str(a.playerId, { max: 128, pattern: zt, label: "Player" })), Array.isArray(a.playerIds) && a.playerIds.length && (d.playerIds = a.playerIds.slice(0, 50).map(String)), o = await fe.call(n, "/game/v5/rtp/change/history", d);
        break;
      }
      default:
        throw S.bad("Unknown RTP action.");
    }
    return r && (await D.collection("agRtpChanges").add({ ...r, currencyCode: s, by: t, at: Z.serverTimestamp() }), S.audit(null, t, "ag_rtp_change", r)), { ok: !0, data: o.data ?? {} };
  }));
  async function jo(e, { startIso: t, endIso: a, pageNum: n, pageSize: s, sort: o }) {
    let i = (await fe.call(e, "/game/v5/game/record", { pageNum: n, pageSize: s, reqData: { startTime: t, endTime: a, sort: o } })).data?.gameRecordList || [];
    if (i.length) {
      let c = D.batch();
      for (let d of i) {
        if (d.orderNo === void 0 || d.orderNo === null) continue;
        let l = d.playerId || d.playerUniqueId || "", u = Number(d.betAmount) || 0, m = Number(d.winAmount) || 0;
        c.set(D.doc(`agGameRecords/${String(d.orderNo)}`), {
          orderNo: String(d.orderNo),
          playerId: l,
          uid: l,
          betAmount: u,
          winAmount: m,
          ggr: Math.round((u - m) * 100) / 100,
          betTime: d.betTime || "",
          winTime: d.winTime || "",
          betTimeMs: Date.parse(d.betTime) || 0,
          gameCode: d.gameCode || "",
          currencyCode: d.currencyCode || "",
          roundId: d.roundId || "",
          syncedAt: Z.serverTimestamp()
        }, { merge: !0 });
      }
      await c.commit();
    }
    return i;
  }
  ie.adminAgGameRecords = $e({ region: ge, timeoutSeconds: 120 }, qe(async (e) => {
    S.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = await Ke(), n = Ua(t.startTime, "Start time"), s = Ua(t.endTime, "End time");
    if (n.ms >= s.ms) throw S.bad("Start time must be before end time.");
    let o = await jo(a, { startIso: n.s, endIso: s.s, pageNum: ft(t.pageNum ?? 1, 1, 1e5, "Page"), pageSize: ft(t.pageSize ?? 20, 1, 100, "Page size"), sort: t.sort !== !1 });
    return { ok: !0, records: o, hasMore: o.length >= (Number(t.pageSize) || 20) };
  }));
  async function Fo(e) {
    let a = (await fe.call(e, "/game/v5/merchant/info", {})).data || {}, n = a.apiType === 0 || a.apiType === "0" || a.apiType === "SINGLE_WALLET" ? "SINGLE_WALLET" : a.apiType === 1 || a.apiType === "1" || a.apiType === "TRANSFER_WALLET" ? "TRANSFER_WALLET" : String(a.apiType ?? ""), s = (a.walletInfos || []).map((i) => ({ billingMode: i.billingMode || "", rtp: Number(i.rtp) || null, currencyCode: i.currencyCode || "", balance: Number(i.balance) || 0 })), o = s.find((i) => i.currencyCode === e.currencyCode), r = {
      merchantName: a.merchantName || "",
      merchantCode: a.merchantCode || e.merchantCode,
      apiType: n,
      apiTypeOk: n === "SINGLE_WALLET",
      singleControlInGlobal: !!a.singleControlInGlobal,
      callbackUrl: a.callbackUrl || "",
      whiteIps: a.whiteIps || "",
      walletInfos: s,
      balance: o ? o.balance : null,
      currencyCode: e.currencyCode,
      status: o ? o.balance > 0 ? "ACTIVE" : "NO_BALANCE" : "NO_WALLET_FOR_CURRENCY",
      syncedAt: Z.serverTimestamp()
    };
    return await D.doc("adminConfig/agMerchant").set(r), r;
  }
  ie.adminAgMerchantInfo = $e({ region: ge, timeoutSeconds: 60 }, qe(async (e) => (S.requireRole(e, ["super", "finance"]), { ok: !0, merchant: { ...await Fo(await Ke({ fresh: !0 })), syncedAt: Date.now() } })));
  ie.adminAgReport = $e({ region: ge, timeoutSeconds: 60 }, qe(async (e) => {
    S.requireRole(e, ["super", "finance"]);
    let t = e.data || {}, a = Number(t.from) || Date.now() - 864e5, n = Number(t.to) || Date.now();
    if (a >= n || n - a > 400 * 864e5) throw S.bad("Invalid date range.");
    let s = D.collection("agBets").where("at", ">=", a).where("at", "<", n), [o, r, i, c] = await Promise.all([
      s.aggregate({ bets: Nt.sum("betAmount"), wins: Nt.sum("winAmount"), reversed: Nt.sum("winReversed"), n: Nt.count() }).get(),
      s.where("status", "==", "cancelled").aggregate({ refunded: Nt.sum("betAmount"), n: Nt.count() }).get(),
      D.collection("statsShards").get(),
      D.collection("agSessions").where("status", "==", "active").count().get()
    ]), d = o.data(), l = r.data(), u = (d.bets || 0) - (l.refunded || 0), m = (d.wins || 0) - (d.reversed || 0), p = {};
    return i.docs.filter((h) => h.id.startsWith("ag_")).forEach((h) => {
      for (let [w, y] of Object.entries(h.data())) p[w] = Math.round(((p[w] || 0) + (Number(y) || 0)) * 100) / 100;
    }), {
      ok: !0,
      range: { from: a, to: n },
      betCount: d.n || 0,
      cancelledCount: l.n || 0,
      turnover: Math.round(u * 100) / 100,
      payout: Math.round(m * 100) / 100,
      ggr: Math.round((u - m) * 100) / 100,
      rtpActual: u > 0 ? Math.round(m / u * 1e4) / 100 : null,
      activeSessions: c.data().count,
      lifetime: p
    };
  }));
  ie.agScheduledSync = Lo({ region: ge, schedule: "every 30 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    let e;
    try {
      e = await Ke({ fresh: !0 });
    } catch {
      return;
    }
    try {
      await Fo(e);
    } catch (a) {
      console.error("merchant sync", a.message);
    }
    try {
      let a = /* @__PURE__ */ new Date(), n = new Date(a.getTime() - 40 * 6e4);
      for (let s = 1; s <= 50 && !((await jo(e, { startIso: n.toISOString(), endIso: a.toISOString(), pageNum: s, pageSize: 100, sort: !1 })).length < 100); s++)
        ;
    } catch (a) {
      console.error("records sync", a.message);
    }
    let t = await D.collection("agSessions").where("status", "==", "active").where("launchedAtMs", "<", Date.now() - 12 * 36e5).limit(400).get();
    if (!t.empty) {
      let a = D.batch();
      t.docs.forEach((n) => a.update(n.ref, { status: "expired", closedAt: Z.serverTimestamp() })), await a.commit();
    }
  });
  ie.agCleanup = Lo({ region: ge, schedule: "every day 04:10", timeZone: "Asia/Dhaka", timeoutSeconds: 540 }, async () => {
    let e = /* @__PURE__ */ new Date();
    for (let t of ["agNonces", "agCallbackLogs", "agApiLogs"])
      for (let a = 0; a < 40; a++) {
        let n = await D.collection(t).where("expireAt", "<", e).limit(400).get();
        if (n.empty) break;
        let s = D.batch();
        n.docs.forEach((o) => s.delete(o.ref)), await s.commit();
      }
  });
  ie.LOBBY = Ac;
});

// src/account.js
var Ho = M((Yt) => {
  "use strict";
  var { onCall: La } = se(), ke = W(), { db: ht, admin: Ln, FieldValue: Ba, HttpsError: Cc, REGION: qa } = ke;
  Yt.setResponsibleGaming = La({ region: qa }, async (e) => {
    let t = ke.authUid(e), a = e.data || {}, n = ht.doc(`users/${t}`), s = {};
    if (await ht.runTransaction(async (o) => {
      let r = await o.get(n);
      ke.assertActive(r.data());
      let i = { ...r.data().rg || {} }, c = Date.now();
      if (i.pendingLimitAt && i.pendingLimitAt <= c && (i.dailyDepositLimit = i.pendingLimit, delete i.pendingLimit, delete i.pendingLimitAt), a.dailyDepositLimit !== void 0) {
        let d = Number(a.dailyDepositLimit) || 0;
        if (d < 0 || d > 1e8) throw ke.bad("Invalid limit.");
        let l = Number(i.dailyDepositLimit) || 0;
        d > 0 && (l === 0 || d < l) ? (i.dailyDepositLimit = ke.round2(d), delete i.pendingLimit, delete i.pendingLimitAt, s.applied = "now") : d !== l && (i.pendingLimit = ke.round2(d), i.pendingLimitAt = c + 24 * 36e5, s.applied = "in24h");
      }
      if (a.excludeDays !== void 0) {
        let d = Number(a.excludeDays);
        if (![1, 7, 30, 90, 180, 365].includes(d)) throw ke.bad("Choose 1, 7, 30, 90, 180 or 365 days.");
        let l = c + d * 864e5, u = i.excludedUntil?.toMillis ? i.excludedUntil.toMillis() : Number(i.excludedUntil) || 0;
        i.excludedUntil = Math.max(u, l), s.excludedUntil = i.excludedUntil, o.set(ht.doc(`agSessions/${t}`), { uid: t, status: "forced", forcedAt: Ba.serverTimestamp(), forceReason: "self-exclusion" }, { merge: !0 });
      }
      o.update(n, { rg: i }), s.rg = i;
    }), s.excludedUntil)
      try {
        let { loadConfig: o } = Ea();
        await Rn().call(await o(), "/game/v5/player/force/logout", { playerId: t }, { retries: 1 });
      } catch (o) {
        console.warn("self-exclusion provider logout", o.message);
      }
    return { ok: !0, ...s };
  });
  Yt.revokeMySessions = La({ region: qa }, async (e) => {
    let t = ke.authUid(e);
    return await Ln.auth().revokeRefreshTokens(t), await ht.doc(`users/${t}`).set({ sessionsRevokedAt: Ba.serverTimestamp() }, { merge: !0 }), await ht.collection("loginHistory").add({ uid: t, event: "logout_all", at: Ba.serverTimestamp() }), { ok: !0 };
  });
  Yt.adminListStaff = La({ region: qa }, async (e) => (ke.requireRole(e, ["super"]), { staff: (await ht.collection("users").where("role", "in", ke.STAFF_ROLES).limit(100).get()).docs.map((a) => ({ uid: a.id, name: a.data().name || "", username: a.data().username || "", email: a.data().email || "", role: a.data().role, status: a.data().status })) }));
  Yt.adminSignOutUser = La({ region: qa, timeoutSeconds: 60 }, async (e) => {
    let t = ke.requireRole(e, ["super", "support"]), a = ke.str((e.data || {}).uid, { max: 128, label: "User" });
    if (!await Ln.auth().getUser(a).catch(() => null)) throw new Cc("not-found", "User not found.");
    await Ln.auth().revokeRefreshTokens(a), await ht.doc(`users/${a}`).set({ sessionsRevokedAt: Ba.serverTimestamp() }, { merge: !0 });
    try {
      let { loadConfig: s } = Ea(), { forceLogoutOne: o } = Bn();
      await o(await s(), a, t, { reason: "Signed out by support" });
    } catch (s) {
      console.warn("provider logout", s.message);
    }
    return ke.audit(null, t, "user_signed_out", { uid: a }), { ok: !0 };
  });
});

// src/fswrite.js
var Xo = M((Jo) => {
  "use strict";
  var { onCall: _c } = se(), gt = W(), { db: Ko, HttpsError: Wo, REGION: Ic } = gt, { merge: Vo, setPath: Nc, plain: $c } = Ot(), ve = (e) => typeof e == "number" && Number.isFinite(e), Ve = (e) => typeof e == "string", zo = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  }, Ee = (e, t) => t.includes(zo(e)), Yo = (e) => new Wo("permission-denied", e || "You do not have permission."), Ec = (e, t) => [.../* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])].filter((n) => JSON.stringify((e || {})[n]) !== JSON.stringify((t || {})[n])), Ga = (e, t, a) => Ec(e, t).every((n) => a.includes(n)), R = (e, t) => {
    if (!e) throw Yo(t);
  };
  function Rc(e, t, a, n, s, o) {
    let r = a.split("/"), i = zo(e) !== null;
    if (r[0] === "users" && r.length === 2) {
      R(n === "update" && t === r[1], "Not allowed."), R(Ga(s, o, ["name", "phone", "photoURL", "lastSeenAt"]), "You cannot change that field."), R(Ve(o.name) && o.name.length >= 2 && o.name.length <= 60, "Name must be 2-60 characters."), R(Ve(o.phone) && /^\+?[0-9]{8,15}$/.test(o.phone), "Invalid phone number."), R(Ve(o.photoURL) && o.photoURL.length < 600, "Invalid photo.");
      return;
    }
    if (r[0] === "users" && r[2] === "notifications" && r.length === 4) {
      if (R(t === r[1], "Not allowed."), n === "delete") return;
      R(n === "update" && Ga(s, o, ["read"]) && typeof o.read == "boolean", "Not allowed.");
      return;
    }
    if (r[0] === "users" && r[2] === "devices" && r.length === 4) {
      if (R(t === r[1], "Not allowed."), n === "delete") return;
      R(Object.keys(o).every((c) => ["platform", "updatedAt"].includes(c)) && Ve(o.platform), "Invalid device.");
      return;
    }
    if (r[0] === "users" && r[2] === "private" && r[3] === "withdrawAccounts" && r.length === 4) {
      if (R(t === r[1], "Not allowed."), n === "delete") return;
      R(Object.keys(o).every((c) => ["list", "updatedAt"].includes(c)) && Array.isArray(o.list) && o.list.length <= 6, "Invalid saved accounts.");
      return;
    }
    if (r[0] === "paymentMethods" && r.length === 2) {
      if (R(Ee(e, ["super", "finance"])), n === "delete") return;
      R(Ve(o.name) && o.name.length > 0 && o.name.length <= 60 && typeof o.enabled == "boolean", "Invalid payment method."), R(o.type === void 0 || ["deposit", "withdraw", "both"].includes(o.type), "Invalid type."), R(o.minAmount === void 0 || ve(o.minAmount) && o.minAmount >= 0, "Invalid minimum."), R(o.cardChangeFee === void 0 || ve(o.cardChangeFee) && o.cardChangeFee >= 0 && o.cardChangeFee <= 1e5, "Invalid card change fee."), R(o.cardLock === void 0 || typeof o.cardLock == "boolean", "Invalid card lock."), R(["logo", "cardBg"].every((c) => o[c] === void 0 || Ve(o[c]) && o[c].length <= 300), "Invalid logo.");
      return;
    }
    if (r[0] === "paymentAccounts" && r.length === 2) {
      if (R(Ee(e, ["super", "finance"])), n === "delete") return;
      R(Ve(o.methodId) && Ve(o.accountNumber) && ["active", "standby", "cooldown", "paused", "disabled", "maintenance", "locked", "archived"].includes(o.status) && ve(o.dailyLimit) && ve(o.monthlyLimit), "Invalid payment account."), R(["bankName", "branch"].every((c) => o[c] === void 0 || typeof o[c] == "string" && o[c].length <= 60), "Invalid bank details."), R(o.cycleLimit === void 0 || ve(o.cycleLimit) && o.cycleLimit >= 0 && o.cycleLimit <= 1e8, "Invalid cycle limit."), R(o.cooldownDays === void 0 || ve(o.cooldownDays) && o.cooldownDays >= 0 && o.cooldownDays <= 365, "Invalid cooldown.");
      return;
    }
    if (r[0] === "paymentAccounts" && r[2] === "private" && r.length === 4) {
      R(Ee(e, ["super", "finance"]));
      return;
    }
    if ((r[0] === "banners" || r[0] === "legal") && r.length === 2) {
      R(Ee(e, ["super", "content"]));
      return;
    }
    if (r[0] === "bonuses" && r.length === 2) {
      if (R(Ee(e, ["super", "content", "finance"])), n === "delete") return;
      R(Ve(o.title) && ve(o.amount) && o.amount > 0 && o.amount <= 1e6 && ["once", "daily", "weekly", "monthly"].includes(o.type) && typeof o.enabled == "boolean", "Invalid bonus."), R(o.kind === void 0 || ["fixed", "random", "lucky"].includes(o.kind), "Invalid bonus kind."), R(o.maxAmount === void 0 || ve(o.maxAmount) && o.maxAmount >= o.amount && o.maxAmount <= 1e6, "Maximum must be \u2265 minimum (up to 1,000,000)."), R(o.prizes === void 0 || Array.isArray(o.prizes) && o.prizes.length <= 12 && o.prizes.every((c) => c && ve(c.amount) && c.amount > 0 && c.amount <= 1e6 && ve(c.weight) && c.weight > 0 && c.weight <= 1e5), "Invalid prizes (max 12)."), R(o.kind !== "lucky" || Array.isArray(o.prizes) && o.prizes.length >= 2, "A lucky draw needs at least 2 prizes.");
      return;
    }
    if (r[0] === "lotteries" && r.length === 2) {
      if (R(Ee(e, ["super", "content"])), n === "delete") {
        R(s && s.sold === 0, "Tickets were already sold.");
        return;
      }
      if (!s) {
        R(o.sold === 0 && o.status === "open" && ve(o.price) && ve(o.prize) && ve(o.totalTickets), "Invalid lottery.");
        return;
      }
      R(Ga(s, o, ["title", "price", "prize", "endsAt", "totalTickets", "maxPerUser", "imageUrl", "status", "autoDraw"]), "You cannot change that field."), R(["open", "closed"].includes(o.status) && ["open", "closed"].includes(s.status) && o.totalTickets >= s.sold, "Invalid lottery.");
      return;
    }
    if (r[0] === "games" && r.length === 2) {
      R(n === "update" && Ee(e, ["super", "content"]) && Ga(s, o, ["enabled", "featured", "sort", "lobbyCategory", "name", "imageUrl"]), "Not allowed.");
      return;
    }
    if (r[0] === "settings" && r.length === 2) {
      let c = r[1];
      R(c === "support" && Ee(e, ["super", "support"]) || c === "content" && Ee(e, ["super", "content", "support"]) || c === "site" && Ee(e, ["super", "finance"]) || !["support", "content", "site"].includes(c) && Ee(e, ["super"]), "Not allowed.");
      return;
    }
    throw Yo("Not allowed.");
  }
  Jo.fsWrite = _c({ region: Ic }, async (e) => {
    let t = gt.authUid(e), a = (e.data || {}).ops;
    if (!Array.isArray(a) || !a.length || a.length > 400) throw gt.bad("Invalid request.");
    return await Ko.runTransaction(async (n) => {
      let s = [];
      for (let o of a) {
        let r = gt.str(o.path, { max: 300, label: "Path" });
        if (!/^[A-Za-z0-9_\-./]+$/.test(r) || r.includes("..") || r.split("/").length % 2 !== 0) throw gt.bad("Invalid path.");
        let i = Ko.doc(r), c = await n.get(i), d = c.exists ? c.data() : void 0, l = o.op === "create" ? "set" : o.op;
        if (!["set", "update", "delete"].includes(l)) throw gt.bad("Invalid operation.");
        let u;
        if (l === "delete") u = void 0;
        else {
          let m = $c(o.data || {});
          if (typeof m != "object" || Array.isArray(m)) throw gt.bad("Invalid data.");
          if (l === "update") {
            if (!d) throw new Wo("not-found", "Document not found.");
            u = JSON.parse(JSON.stringify(d));
            for (let [p, h] of Object.entries(m)) Nc(u, p, h);
          } else u = o.merge && d ? Vo(JSON.parse(JSON.stringify(d)), m) : Vo({}, m);
        }
        Rc(e, t, r, l === "delete" ? "delete" : d ? "update" : "create", d, u), s.push({ ref: i, type: l, data: o.data, merge: !!o.merge });
      }
      for (let o of s)
        o.type === "delete" ? n.delete(o.ref) : o.type === "update" ? n.update(o.ref, o.data) : n.set(o.ref, o.data, { merge: o.merge });
    }), { ok: !0 };
  });
});

// src/rotation.js
var tr = M((Jt) => {
  "use strict";
  var { onCall: Gn } = se(), { onSchedule: Dc } = Ia(), Se = W(), xa = cn(), { db: Re, FieldValue: Mc, HttpsError: qn, REGION: ja } = Se, Fa = xa.n0, Zo = async () => {
    let e = await Se.siteSettings();
    return Math.max(1, Fa((e.deposit || {}).min) || 1);
  }, Qo = (e) => e && typeof e.toMillis == "function" ? e.toMillis() : Fa(e);
  async function er(e = Date.now()) {
    let t = await Zo(), a = await Re.collection("paymentMethods").get(), n = 0;
    for (let i of a.docs)
      (await Re.runTransaction((d) => xa.rotateTx(d, i.id, { now: e, min: t, reason: "tick" }))).changed.length && n++;
    let s = await Se.siteSettings(), o = Fa((s.deposit || {}).expireHours), r = 0;
    if (o > 0) {
      let i = await Re.collection("deposits").where("status", "==", "pending").limit(200).get();
      for (let c of i.docs) {
        let d = c.data();
        if (!d.createdAt || Qo(d.createdAt) > e - o * 36e5) continue;
        await Re.runTransaction(async (u) => {
          let m = await u.get(c.ref);
          return !m.exists || m.data().status !== "pending" ? !1 : (d.accountId && await xa.rotateTx(u, d.methodId, { now: e, min: t, settle: { accountId: d.accountId, amount: d.amount, outcome: "release" } }), u.update(c.ref, { status: "expired", note: "Expired: not reviewed in time", reviewedAt: Mc.serverTimestamp(), reviewedBy: "system" }), Se.notify(u, d.uid, "Deposit expired", "Your deposit request expired. Please contact support if you already paid.", "deposit"), Se.bumpStats(u, { pendingDeposits: -1 }), Se.audit(u, "system", "deposit_expired", { depositId: c.id, amount: d.amount }), !0);
        }) && r++;
      }
    }
    return { rotated: n, expired: r };
  }
  Jt.paymentRotationTick = Dc({ region: ja, schedule: "every 10 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    await er();
  });
  Jt.paymentSync = Gn({ region: ja }, async (e) => {
    let t = Se.authUid(e), a = e.auth.token.admin === !0 && ["super", "finance"].includes(e.auth.token.role), n = Re.doc("system/paymentTick"), s = await n.get(), o = s.exists ? Fa(s.data().at) : 0;
    return !(a && (e.data || {}).force) && Date.now() - o < 45e3 ? { ok: !0, skipped: !0 } : (await n.set({ at: Date.now(), by: t }, { merge: !0 }), { ok: !0, ...await er() });
  });
  var Pc = ["activate", "pause", "resume", "reset"];
  Jt.paymentAccountAction = Gn({ region: ja }, async (e) => {
    let t = Se.requireRole(e, ["super", "finance"]), a = e.data || {}, n = Se.str(a.accountId, { max: 120, label: "Account" }), s = a.action;
    if (!Pc.includes(s)) throw Se.bad("Invalid action.");
    let o = await Zo(), i = await Re.doc(`paymentAccounts/${n}`).get();
    if (!i.exists) throw new qn("not-found", "Account not found.");
    let c = i.data().methodId;
    return await Re.runTransaction(async (d) => {
      let u = (await xa.rotateTx(d, c, { now: Date.now(), min: o, force: { [s]: n }, reason: "manual" })).accounts.find((m) => m.id === n);
      if (!u) throw new qn("not-found", "Account not found.");
      Se.audit(d, t, `payment_account_${s}`, { accountId: n, number: u.accountNumber || "", methodId: c });
    }).catch((d) => {
      throw d;
    }), { ok: !0 };
  });
  Jt.paymentAccountHistory = Gn({ region: ja }, async (e) => {
    Se.requireRole(e, ["super", "finance"]);
    let t = Se.str((e.data || {}).accountId, { max: 120, label: "Account" }), a = await Re.doc(`paymentAccounts/${t}`).get();
    if (!a.exists) throw new qn("not-found", "Account not found.");
    let [n, s, o] = await Promise.all([
      Re.collection("paymentCycles").where("accountId", "==", t).get(),
      Re.collection("deposits").where("accountId", "==", t).limit(200).get(),
      Re.collection("paymentRotationLogs").where("methodId", "==", a.data().methodId).limit(200).get()
    ]), r = (i) => JSON.parse(JSON.stringify(i));
    return {
      cycles: n.docs.map((i) => r(i.data())).sort((i, c) => c.cycleNo - i.cycleNo),
      deposits: s.docs.map((i) => ({ id: i.id, amount: i.data().amount, status: i.data().status, trxId: i.data().trxId, username: i.data().username, at: Qo(i.data().createdAt) })).sort((i, c) => c.at - i.at).slice(0, 100),
      logs: o.docs.map((i) => r(i.data())).filter((i) => i.oldAccountId === t || i.newAccountId === t).sort((i, c) => c.at - i.at).slice(0, 50)
    };
  });
});

// src/payout.js
var nr = M((Ce) => {
  "use strict";
  var { onCall: De } = se(), C = W(), xn = hn(), Xt = fa().helpers, { db: z, FieldValue: ce, HttpsError: le, REGION: Me } = C, J = xn.n0, we = (e) => z.doc(`payoutAgents/${e}`), Rt = ["super", "finance"], Et = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0;
  async function jn(e) {
    let t = C.requireRole(e, ["payout"]), a = await we(t).get();
    if (!a.exists || a.data().active === !1) throw new le("permission-denied", "Your payout access is turned off.");
    return t;
  }
  var Oc = (e, t) => ({
    id: e,
    methodId: t.methodId,
    methodName: t.methodName,
    accountNumber: t.accountNumber,
    holderName: t.holderName || "",
    bankName: t.bankName || "",
    branch: t.branch || "",
    amount: t.net,
    stage: t.stage,
    createdAt: Et(t.createdAt),
    assignedAt: Et(t.assignedAt),
    reviewNote: t.reviewNote || "",
    paidAt: Et(t.paidAt),
    payTrxId: t.payTrxId || "",
    hasProof: !!t.proofKey,
    status: t.status
  });
  Ce.payoutMyTasks = De({ region: Me }, async (e) => {
    let t = await jn(e), n = (await z.collection("withdrawals").where("assignedTo", "==", t).limit(300).get()).docs.map((r) => Oc(r.id, r.data())), s = (await we(t).get()).data() || {}, o = xn.startOfDhakaDay().getTime();
    return {
      open: n.filter((r) => r.status === "pending" && r.stage === "assigned").sort((r, i) => r.assignedAt - i.assignedAt),
      review: n.filter((r) => r.status === "pending" && r.stage === "paid_review").sort((r, i) => i.paidAt - r.paidAt),
      done: n.filter((r) => r.status === "approved").sort((r, i) => i.paidAt - r.paidAt).slice(0, 50),
      today: n.filter((r) => r.status === "approved" && r.paidAt >= o).reduce((r, i) => ({ count: r.count + 1, total: C.round2(r.total + J(i.amount)) }), { count: 0, total: 0 }),
      me: { name: s.name || "", methods: s.methods || [], ...Ha(s) },
      storage: Xt.configured()
    };
  });
  function Ha(e) {
    let t = J(e.floatGiven), a = J(e.floatReturned), n = J(e.paidTotal), s = J(e.reviewTotal);
    return { floatGiven: t, floatReturned: a, paidTotal: n, paidCount: J(e.paidCount), reviewTotal: s, reviewCount: J(e.reviewCount), remaining: C.round2(t - a - n - s), openCount: Math.max(0, J(e.openCount)) };
  }
  Ce.payoutMarkPaid = De({ region: Me }, async (e) => {
    let t = await jn(e), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = C.str(a.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), o = typeof a.fromNumber == "string" ? a.fromNumber.replace(/[^0-9+]/g, "").slice(0, 20) : "", r = typeof a.proofKey == "string" ? a.proofKey.trim() : "";
    if (Xt.configured()) {
      if (!r) throw C.bad("Please upload the payment screenshot.");
      if (!Xt.safeKey(r) || !r.startsWith(`payouts/${n}/${t}-`)) throw C.bad("Invalid screenshot.");
      await Xt.verifyImage(r);
    }
    return await z.runTransaction(async (i) => {
      let c = z.doc(`withdrawals/${n}`), d = await i.get(c), l = d.exists ? d.data() : null;
      if (!l || l.assignedTo !== t) throw new le("permission-denied", "This task is not assigned to you.");
      if (l.status !== "pending" || l.stage !== "assigned") throw new le("failed-precondition", "This task is not waiting for payment.");
      i.update(c, { stage: "paid_review", paidBy: t, paidAt: Date.now(), payTrxId: s, fromNumber: o, proofKey: r, reviewNote: "" }), i.update(we(t), { reviewTotal: ce.increment(J(l.net)), reviewCount: ce.increment(1), openCount: ce.increment(-1), lastPaidAt: Date.now() }), C.audit(i, t, "payout_paid", { withdrawalId: n, net: l.net, trx: s });
    }), { ok: !0 };
  });
  Ce.payoutReturn = De({ region: Me }, async (e) => {
    let t = await jn(e), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = C.str(a.reason, { min: 3, max: 200, label: "Reason" });
    return await z.runTransaction(async (o) => {
      let r = z.doc(`withdrawals/${n}`), i = await o.get(r), c = i.exists ? i.data() : null;
      if (!c || c.assignedTo !== t) throw new le("permission-denied", "This task is not assigned to you.");
      if (c.status !== "pending" || c.stage !== "assigned") throw new le("failed-precondition", "You can only return a task you have not paid yet.");
      o.update(r, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null, returnReason: s, returnedBy: t, returnedAt: Date.now() }), o.update(we(t), { openCount: ce.increment(-1), returnedCount: ce.increment(1) }), C.audit(o, t, "payout_returned", { withdrawalId: n, reason: s });
    }), { ok: !0 };
  });
  async function ar(e, t, a) {
    await z.runTransaction(async (n) => {
      let s = z.doc(`withdrawals/${e}`), [o, r] = await Promise.all([n.get(s), n.get(we(t))]), i = o.exists ? o.data() : null;
      if (!r.exists || r.data().active === !1) throw new le("failed-precondition", "That agent is not active.");
      if (!i || i.status !== "pending") throw new le("failed-precondition", "This request is no longer pending.");
      if (i.stage === "paid_review") throw new le("failed-precondition", "Already paid \u2014 waiting for review.");
      i.assignedTo !== t && (i.assignedTo && n.update(we(i.assignedTo), { openCount: ce.increment(-1) }), n.update(s, { stage: "assigned", assignedTo: t, assignedName: r.data().name || "", assignedAt: Date.now(), assignedBy: a }), n.update(we(t), { openCount: ce.increment(1) }), C.notify(n, t, "New payout task", `Send ${i.net} by ${i.methodName}.`, "payout"));
    });
  }
  Ce.payoutAssign = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, Rt), a = e.data || {}, n = Array.isArray(a.withdrawalIds) ? a.withdrawalIds.slice(0, 100).map((r) => C.str(r, { max: 80 })) : [];
    if (!n.length) throw C.bad("Pick at least one request.");
    let s = C.str(a.agentUid, { max: 80, label: "Agent" }), o = { ok: 0, failed: [] };
    for (let r of n)
      try {
        await ar(r, s, t), o.ok++;
      } catch (i) {
        o.failed.push({ id: r, error: i.message });
      }
    return C.audit(null, t, "payout_assign", { agentUid: s, count: o.ok }), o;
  });
  Ce.payoutAutoAssign = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, Rt), a = e.data || {}, n = a.mode === "method" ? "method" : "equal", s = Array.isArray(a.agentUids) && a.agentUids.length ? new Set(a.agentUids.map(String)) : null, o = (await z.collection("payoutAgents").where("active", "==", !0).get()).docs.map((c) => ({ uid: c.id, methods: c.data().methods || [], load: Math.max(0, J(c.data().openCount)) })).filter((c) => !s || s.has(c.uid));
    if (!o.length) throw new le("failed-precondition", "No active payout agents.");
    let r = (await z.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.filter((c) => !c.data().assignedTo && c.data().stage !== "paid_review").sort((c, d) => Et(c.data().createdAt) - Et(d.data().createdAt)), i = { ok: 0, skipped: 0, failed: [] };
    for (let c of r) {
      let d = n === "method" ? o.filter((u) => !u.methods.length || u.methods.includes(c.data().methodId)) : o;
      if (!d.length) {
        i.skipped++;
        continue;
      }
      let l = d.reduce((u, m) => m.load < u.load ? m : u, d[0]);
      try {
        await ar(c.id, l.uid, t), l.load++, i.ok++;
      } catch (u) {
        i.failed.push({ id: c.id, error: u.message });
      }
    }
    return C.audit(null, t, "payout_auto_assign", { mode: n, count: i.ok }), i;
  });
  Ce.payoutUnassign = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, Rt), a = C.str((e.data || {}).withdrawalId, { max: 80 });
    return await z.runTransaction(async (n) => {
      let s = z.doc(`withdrawals/${a}`), o = await n.get(s), r = o.exists ? o.data() : null;
      if (!r || r.status !== "pending" || !r.assignedTo) throw new le("failed-precondition", "Nothing to unassign.");
      if (r.stage === "paid_review") throw new le("failed-precondition", "Already paid \u2014 review it instead.");
      n.update(s, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null }), n.update(we(r.assignedTo), { openCount: ce.increment(-1) }), C.audit(n, t, "payout_unassign", { withdrawalId: a });
    }), { ok: !0 };
  });
  Ce.payoutReview = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, Rt), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = a.action;
    if (!["approve", "send_back"].includes(s)) throw C.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "";
    if (s === "send_back" && o.length < 3) throw C.bad("Write why it is sent back.");
    return await z.runTransaction(async (r) => {
      let i = z.doc(`withdrawals/${n}`), c = await r.get(i), d = c.exists ? c.data() : null;
      if (!d || d.status !== "pending" || d.stage !== "paid_review") throw new le("failed-precondition", "This payment is not waiting for review.");
      if (d.paidBy === t) throw new le("permission-denied", "You cannot approve a payment you made yourself.");
      let l = J(d.net);
      s === "approve" ? (xn.finalize(r, i, d, !0, t, o, { approvedBy: t }), r.update(we(d.paidBy), { reviewTotal: ce.increment(-l), reviewCount: ce.increment(-1), paidTotal: ce.increment(l), paidCount: ce.increment(1) })) : (r.update(i, { stage: "assigned", reviewNote: o, sentBackAt: Date.now(), sentBackBy: t }), r.update(we(d.paidBy), { reviewTotal: ce.increment(-l), reviewCount: ce.increment(-1), openCount: ce.increment(1) }), C.notify(r, d.paidBy, "Payout sent back", o, "payout")), C.audit(r, t, s === "approve" ? "payout_approved" : "payout_sent_back", { withdrawalId: n, net: l, agent: d.paidBy });
    }), { ok: !0 };
  });
  Ce.payoutAgents = De({ region: Me }, async (e) => {
    C.requireRole(e, Rt);
    let t = await z.collection("payoutAgents").limit(50).get(), a = (await z.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.map((o) => ({ id: o.id, ...o.data() })), n = t.docs.map((o) => {
      let r = o.data(), i = a.filter((c) => c.assignedTo === o.id);
      return {
        uid: o.id,
        name: r.name || "",
        email: r.email || "",
        active: r.active !== !1,
        methods: r.methods || [],
        ...Ha(r),
        openCount: i.filter((c) => c.stage === "assigned").length,
        reviewCount: i.filter((c) => c.stage === "paid_review").length,
        lastPaidAt: J(r.lastPaidAt)
      };
    }), s = a.map((o) => ({
      id: o.id,
      username: o.username || "",
      methodId: o.methodId,
      methodName: o.methodName,
      accountNumber: o.accountNumber,
      holderName: o.holderName || "",
      bankName: o.bankName || "",
      branch: o.branch || "",
      amount: o.amount,
      net: o.net,
      stage: o.stage || "new",
      assignedTo: o.assignedTo || "",
      assignedName: o.assignedName || "",
      createdAt: Et(o.createdAt),
      paidBy: o.paidBy || "",
      paidAt: J(o.paidAt),
      payTrxId: o.payTrxId || "",
      fromNumber: o.fromNumber || "",
      proofKey: o.proofKey || "",
      returnReason: o.returnReason || "",
      reviewNote: o.reviewNote || ""
    })).sort((o, r) => o.createdAt - r.createdAt);
    return { agents: n, queue: s, storage: Xt.configured() };
  });
  Ce.payoutAgentSave = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, ["super"]), a = e.data || {}, n = C.str(a.agentUid, { max: 80 }), s = we(n);
    if (!(await s.get()).exists) throw new le("not-found", "Agent not found.");
    let r = {};
    return typeof a.active == "boolean" && (r.active = a.active), Array.isArray(a.methods) && (r.methods = a.methods.slice(0, 20).map((i) => C.str(i, { max: 80 }))), await s.update(r), C.audit(null, t, "payout_agent_save", { uid: n, ...r }), { ok: !0 };
  });
  Ce.payoutFloat = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, ["super"]), a = e.data || {}, n = C.str(a.agentUid, { max: 80 }), s = C.amountOf(a.amount, { max: 1e8 }), o = a.direction === "take" ? "take" : "give", r = typeof a.note == "string" ? a.note.trim().slice(0, 200) : "";
    return await z.runTransaction(async (i) => {
      let c = await i.get(we(n));
      if (!c.exists) throw new le("not-found", "Agent not found.");
      if (o === "take" && s > Ha(c.data()).remaining + 1e-9) throw C.bad("Cannot take back more than the agent has left.");
      i.update(we(n), o === "give" ? { floatGiven: ce.increment(s) } : { floatReturned: ce.increment(s) }), i.set(z.collection("payoutFloat").doc(), { agentUid: n, amount: s, direction: o, note: r, by: t, at: Date.now() }), C.audit(i, t, "payout_float", { uid: n, amount: s, dir: o });
    }), { ok: !0 };
  });
  Ce.payoutReport = De({ region: Me }, async (e) => {
    C.requireRole(e, Rt);
    let t = e.data || {}, a = C.str(t.agentUid, { max: 80 }), n = J(t.from), s = J(t.to) || Date.now() + 864e5, o = await we(a).get();
    if (!o.exists) throw new le("not-found", "Agent not found.");
    let r = (await z.collection("withdrawals").where("paidBy", "==", a).limit(1e3).get()).docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => J(d.paidAt) >= n && J(d.paidAt) <= s).map((d) => ({ id: d.id, methodName: d.methodName, accountNumber: d.accountNumber, net: d.net, status: d.status, stage: d.stage, payTrxId: d.payTrxId || "", fromNumber: d.fromNumber || "", proofKey: d.proofKey || "", paidAt: J(d.paidAt), approvedBy: d.approvedBy || d.reviewedBy || "" })).sort((d, l) => l.paidAt - d.paidAt), i = (await z.collection("payoutFloat").where("agentUid", "==", a).limit(300).get()).docs.map((d) => d.data()).sort((d, l) => l.at - d.at), c = {};
    for (let d of r.filter((l) => l.status === "approved")) {
      let l = d.accountNumber;
      c[l] = c[l] || { accountNumber: l, methodName: d.methodName, count: 0, total: 0 }, c[l].count++, c[l].total = C.round2(c[l].total + J(d.net));
    }
    return { agent: { uid: a, name: o.data().name || "", ...Ha(o.data()) }, rows: r, float: i, byNumber: Object.values(c).sort((d, l) => l.total - d.total) };
  });
});

// src/community.js
var dr = M((Dt) => {
  "use strict";
  var { onCall: ea } = se(), Y = W(), { db: Q, FieldValue: sr, HttpsError: Fn, REGION: ta } = Y, rr = 24 * 36e5, Uc = 6 * 36e5, or = (e) => new Date(e + Uc).toISOString().slice(0, 10), Qt = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0, H = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, Bc = ["super", "finance", "support"];
  async function ir() {
    let e = await Q.doc("settings/content").get();
    return e.exists ? e.data() : {};
  }
  var Lc = (e) => (Array.isArray(e) ? e : []).slice(0, 7).map((t) => Math.max(0, Math.min(1e5, Math.round(H(t)))));
  function cr(e, t, a) {
    let n = Lc(e && e.rewards), s = !!(e && e.enabled) && n.some((u) => u > 0), o = or(a), r = or(a - rr), i = t ? H(t.streak) : 0, c = t ? t.lastDay : "", d = c === o;
    !d && c !== r && (i = 0);
    let l = i % 7;
    return { enabled: s, rewards: n, streak: i, claimedToday: d, today: o, nextIndex: l, lastDay: c || "" };
  }
  Dt.checkinStatus = ea({ region: ta }, async (e) => {
    let t = Y.authUid(e), [a, n] = await Promise.all([ir(), Q.doc(`bonusClaims/${t}_checkin`).get()]), s = cr(a.checkin, n.exists ? n.data() : null, Date.now());
    return { enabled: s.enabled, rewards: s.rewards, streak: s.streak, claimedToday: s.claimedToday, nextIndex: s.nextIndex };
  });
  Dt.claimCheckin = ea({ region: ta }, async (e) => {
    let t = Y.requireVerified(e), a = 0, n = 0, s = 0;
    return await Q.runTransaction(async (o) => {
      let [r, i, c] = await Promise.all([o.get(Q.doc("settings/content")), o.get(Q.doc(`users/${t}`)), o.get(Q.doc(`bonusClaims/${t}_checkin`))]);
      Y.assertActive(i.data());
      let d = Date.now(), l = cr((r.exists ? r.data() : {}).checkin, c.exists ? c.data() : null, d);
      if (!l.enabled) throw new Fn("failed-precondition", "Daily check-in is not available right now.");
      if (l.claimedToday) throw new Fn("failed-precondition", "You already checked in today. Come back tomorrow.");
      n = l.nextIndex, s = l.streak + 1, a = Y.round2(l.rewards[n] || 0), a > 0 && (Y.applyDelta(o, i.ref, { main: a }), Y.ledger(o, { uid: t, type: "bonus", direction: "in", amount: a, bucket: "main", note: `Daily check-in \xB7 day ${n + 1}`, ref: "checkin" }), Y.bumpStats(o, { bonusPaid: a })), o.set(c.ref, { uid: t, bonusId: "checkin", lastDay: l.today, streak: s, best: Math.max(s, H(c.exists ? c.data().best : 0)), lastClaimAt: sr.serverTimestamp(), lastClaimMs: d, lastAmount: a, count: sr.increment(1) }, { merge: !0 });
    }), { ok: !0, amount: a, day: n, streak: s };
  });
  var qc = (e) => {
    let t = String(e || "").trim();
    return t ? t.slice(0, Math.min(2, t.length)) + "***" : "Player";
  }, Zt = { at: 0, data: null };
  Dt.publicBoard = ea({ region: ta }, async (e) => {
    Y.authUid(e);
    let t = (await ir()).board || {};
    if (!t.enabled) return { enabled: !1, weekly: [], latest: [] };
    if (Zt.data && Date.now() - Zt.at < 6e4 && Zt.min === H(t.minShow)) return Zt.data;
    let a = Math.max(0, H(t.minShow)), n = Date.now() - 7 * rr, o = (await Q.collection("transactions").where("type", "in", ["win", "game_win"]).where("createdAt", ">=", n).orderBy("createdAt", "desc").limit(4e3).get()).docs.map((m) => m.data()).filter((m) => H(m.amount) >= a && H(m.amount) > 0), r = /* @__PURE__ */ new Map();
    for (let m of o) {
      let p = r.get(m.uid);
      (!p || H(m.amount) > p.amount) && r.set(m.uid, { uid: m.uid, amount: H(m.amount), game: m.note || "" });
    }
    let i = [...r.values()].sort((m, p) => p.amount - m.amount).slice(0, 10), c = o.slice(0, 20), d = [.../* @__PURE__ */ new Set([...i.map((m) => m.uid), ...c.map((m) => m.uid)])], l = /* @__PURE__ */ new Map();
    await Promise.all(d.map(async (m) => {
      let p = await Q.doc(`users/${m}`).get(), h = p.exists ? p.data() : {};
      l.set(m, qc(h.username || h.name));
    }));
    let u = {
      enabled: !0,
      weekly: i.map((m) => ({ name: l.get(m.uid), amount: m.amount, game: m.game })),
      latest: c.map((m) => ({ name: l.get(m.uid), amount: H(m.amount), game: m.note || "", at: Qt(m.createdAt) }))
    };
    return Zt = { at: Date.now(), data: u, min: H(t.minShow) }, u;
  });
  var Ge = ["main", "winning", "referral", "commission"];
  Dt.adminReconcile = ea({ region: ta, timeoutSeconds: 120 }, async (e) => {
    Y.requireRole(e, ["super", "finance"]);
    let t = 6e4, [a, n] = await Promise.all([Q.collection("users").limit(2e4).get(), Q.collection("transactions").orderBy("createdAt", "desc").limit(t).get()]), s = /* @__PURE__ */ new Map();
    for (let d of n.docs) {
      let l = d.data();
      if (!l.uid) continue;
      let u = H(l.amount) * (l.direction === "out" ? -1 : 1), m = Ge.includes(l.bucket) ? l.bucket : "main", p = s.get(l.uid) || { main: 0, winning: 0, referral: 0, commission: 0 };
      p[m] += u, s.set(l.uid, p);
    }
    let o = n.docs.length >= t, r = { main: 0, winning: 0, referral: 0, commission: 0 }, i = [];
    for (let d of a.docs) {
      let l = d.data(), u = l.balances || {};
      for (let w of Ge) r[w] += H(u[w]);
      let m = s.get(d.id) || { main: 0, winning: 0, referral: 0, commission: 0 }, p = {}, h = !1;
      for (let w of Ge)
        p[w] = Y.round2(H(u[w]) - m[w]), Math.abs(p[w]) >= 0.01 && (h = !0);
      h && i.push({ uid: d.id, name: l.username || l.name || l.email || d.id, balances: Ge.reduce((w, y) => ({ ...w, [y]: Y.round2(H(u[y])) }), {}), ledger: Ge.reduce((w, y) => ({ ...w, [y]: Y.round2(m[y]) }), {}), diff: p });
    }
    i.sort((d, l) => Math.max(...Ge.map((u) => Math.abs(l.diff[u]))) - Math.max(...Ge.map((u) => Math.abs(d.diff[u]))));
    let c = (await Q.doc("stats/global").get()).data() || {};
    return {
      at: Date.now(),
      users: a.size,
      ledgerRows: n.size,
      partial: o,
      totals: Ge.reduce((d, l) => ({ ...d, [l]: Y.round2(r[l]) }), {}),
      allBalances: Y.round2(Ge.reduce((d, l) => d + r[l], 0)),
      deposits: H(c.totalDeposits),
      withdrawals: H(c.totalWithdrawals),
      bonusPaid: H(c.bonusPaid),
      mismatched: i.length,
      diffs: i.slice(0, 50)
    };
  });
  Dt.adminUserOverview = ea({ region: ta }, async (e) => {
    Y.requireRole(e, Bc);
    let t = Y.str((e.data || {}).uid, { max: 128, label: "User" }), a = await Q.doc(`users/${t}`).get();
    if (!a.exists) throw new Fn("not-found", "User not found.");
    let n = a.data(), [s, o, r, i, c, d] = await Promise.all([
      Q.collection("transactions").where("uid", "==", t).orderBy("createdAt", "desc").limit(25).get(),
      Q.collection("deposits").where("uid", "==", t).orderBy("createdAt", "desc").limit(200).get(),
      Q.collection("withdrawals").where("uid", "==", t).orderBy("createdAt", "desc").limit(200).get(),
      Q.collection("loginHistory").where("uid", "==", t).orderBy("at", "desc").limit(10).get(),
      Q.collection("referrals").where("referrerUid", "==", t).limit(500).get(),
      Q.doc(`bonusClaims/${t}_checkin`).get()
    ]), l = (p, h) => p.filter((w) => h(w.data())).reduce((w, y) => w + H(y.data().amount), 0), u = o.docs, m = r.docs;
    return {
      user: { uid: t, name: n.name || "", username: n.username || "", email: n.email || "", phone: n.phone || "", status: n.status || "active", role: n.role || "user", createdAt: Qt(n.createdAt), lastLoginAt: Qt(n.lastLoginAt), referredBy: n.referredBy || "" },
      balances: Ge.reduce((p, h) => ({ ...p, [h]: Y.round2(H((n.balances || {})[h])) }), {}),
      totals: {
        deposited: Y.round2(l(u, (p) => p.status === "approved")),
        depositCount: u.filter((p) => p.data().status === "approved").length,
        withdrawn: Y.round2(l(m, (p) => p.status === "approved" || p.status === "paid")),
        withdrawCount: m.filter((p) => ["approved", "paid"].includes(p.data().status)).length,
        pendingDeposits: u.filter((p) => p.data().status === "pending").length,
        pendingWithdraws: m.filter((p) => p.data().status === "pending").length,
        referrals: c.size,
        checkinStreak: d.exists ? H(d.data().streak) : 0
      },
      ledger: s.docs.map((p) => {
        let h = p.data();
        return { type: h.type, direction: h.direction, amount: H(h.amount), bucket: h.bucket, note: h.note || "", at: Qt(h.createdAt) };
      }),
      logins: i.docs.map((p) => {
        let h = p.data();
        return { at: Qt(h.at), ok: h.success !== !1, device: h.device || h.ua || "", ip: h.ip || "" };
      })
    };
  });
});

// src/growth.js
var kr = M((ee) => {
  "use strict";
  var { onCall: ye } = se(), { onSchedule: Gc } = Ia(), v = W(), xc = Ta(), { db: N, FieldValue: ur, HttpsError: Pe, REGION: he } = v, j = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, Pt = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0, Kn = (e) => (e = String(e || ""), e ? e.slice(0, 2) + "***" : "***"), wt = () => globalThis.__ENV || process.env;
  async function pr() {
    let e = await N.doc("settings/content").get();
    return e.exists ? e.data() : {};
  }
  function fr(e) {
    let t = e && e.refMs || {}, a = (Array.isArray(t.steps) ? t.steps : []).map((s) => ({ count: Math.round(j(s && s.count)), reward: v.round2(j(s && s.reward)) })).filter((s) => s.count >= 1 && s.count <= 1e5 && s.reward > 0 && s.reward <= 1e6).sort((s, o) => s.count - o.count).slice(0, 20), n = a.filter((s, o) => o === 0 || s.count !== a[o - 1].count);
    return { enabled: !!t.enabled && n.length > 0, minDeposit: Math.max(0, j(t.minDeposit)), bucket: t.bucket === "main" ? "main" : "referral", steps: n };
  }
  async function hr(e) {
    let a = (await N.collection("users").where("referredBy", "==", e).limit(3e3).get()).docs.map((n) => ({ uid: n.id, username: n.data().username || "", at: Pt(n.data().createdAt), deposited: 0 }));
    for (let n = 0; n < a.length; n += 100) {
      let s = a.slice(n, n + 100), o = s.map((c) => c.uid), r = await N.collection("deposits").where("uid", "in", o).where("status", "==", "approved").get(), i = {};
      r.docs.forEach((c) => {
        let d = c.data();
        i[d.uid] = (i[d.uid] || 0) + j(d.amount);
      }), s.forEach((c) => {
        c.deposited = v.round2(i[c.uid] || 0);
      });
    }
    return a;
  }
  var gr = (e, t) => e.filter((a) => t.minDeposit > 0 ? a.deposited >= t.minDeposit : a.deposited > 0 || t.minDeposit === 0).length;
  ee.refProgress = ye({ region: he }, async (e) => {
    let t = v.authUid(e), a = fr(await pr()), n = await hr(t), s = gr(n, a), o = await N.doc(`bonusClaims/${t}_refms`).get(), r = o.exists && Array.isArray(o.data().claimed) ? o.data().claimed : [];
    return {
      enabled: a.enabled,
      minDeposit: a.minDeposit,
      steps: a.steps,
      total: n.length,
      active: s,
      claimed: r,
      friends: n.sort((i, c) => c.at - i.at).slice(0, 100).map((i) => ({ name: Kn(i.username), at: i.at, active: a.minDeposit > 0 ? i.deposited >= a.minDeposit : !0, deposited: i.deposited > 0 }))
    };
  });
  ee.claimRefMilestone = ye({ region: he }, async (e) => {
    let t = v.requireVerified(e), a = Math.round(j((e.data || {}).count)), n = fr(await pr());
    if (!n.enabled) throw new Pe("failed-precondition", "Invite rewards are off.");
    let s = n.steps.find((r) => r.count === a);
    if (!s) throw v.bad("Unknown reward step.");
    let o = gr(await hr(t), n);
    if (o < s.count) throw new Pe("failed-precondition", `\u0986\u09B0\u0993 ${s.count - o} \u099C\u09A8 \u09B8\u0995\u09CD\u09B0\u09BF\u09AF\u09BC \u09AC\u09A8\u09CD\u09A7\u09C1 \u09A6\u09B0\u0995\u09BE\u09B0\u0964`);
    return await N.runTransaction(async (r) => {
      let i = N.doc(`bonusClaims/${t}_refms`), c = N.doc(`users/${t}`), [d, l] = await Promise.all([r.get(i), r.get(c)]);
      v.assertActive(l.data());
      let u = d.exists && Array.isArray(d.data().claimed) ? d.data().claimed : [];
      if (u.includes(s.count)) throw new Pe("already-exists", "\u098F\u0987 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u0986\u0997\u09C7\u0987 \u09A8\u09C7\u0993\u09AF\u09BC\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964");
      v.applyDelta(r, c, { [n.bucket]: s.reward }), v.ledger(r, { uid: t, type: "referral", direction: "in", amount: s.reward, bucket: n.bucket, note: `Invite reward \xB7 ${s.count} friends`, ref: "refms" }), v.notify(r, t, "Invite reward \u{1F389}", `${s.count} friends joined. +${s.reward}`, "referral"), r.set(i, { uid: t, kind: "refms", claimed: [...u, s.count], updatedAt: Date.now() }), v.bumpStats(r, { bonusPaid: s.reward });
    }), { ok: !0, reward: s.reward };
  });
  var lr = { mobile: /^01[3-9]\d{8}$/, bank: /^[0-9A-Za-z\- ]{6,30}$/, crypto: /^[0-9A-Za-z]{20,100}$/ };
  ee.wdCardList = ye({ region: he }, async (e) => {
    let t = v.authUid(e), a = await N.doc(`users/${t}/private/wdCards`).get(), n = a.exists && Array.isArray(a.data().list) ? a.data().list : [], s = await Promise.all(n.map((o) => N.doc(`paymentMethods/${o.methodId}`).get()));
    return { cards: n.map((o, r) => ({ ...o, index: r, fee: s[r].exists ? Math.max(0, j(s[r].data().cardChangeFee)) : 0, lock: s[r].exists ? s[r].data().cardLock === !0 : !1 })) };
  });
  ee.wdCardChange = ye({ region: he }, async (e) => {
    let t = v.requireVerified(e), a = e.data || {}, n = Math.round(j(a.index));
    if (n < 0 || n > 5) throw v.bad("Invalid card.");
    let s = v.str(a.methodId, { max: 80, label: "Method" }), o = v.str(a.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }).replace(/\s+/g, " "), r = v.str(a.holderName, { min: 2, max: 60, label: "Name" }), i = typeof a.bankName == "string" ? a.bankName.trim().slice(0, 60) : "", c = typeof a.branch == "string" ? a.branch.trim().slice(0, 60) : "", d = 0;
    return await N.runTransaction(async (l) => {
      let u = N.doc(`users/${t}/private/wdCards`), m = N.doc(`users/${t}`), [p, h, w] = await Promise.all([l.get(u), l.get(m), l.get(N.doc(`paymentMethods/${s}`))]);
      v.assertActive(h.data());
      let y = p.exists && Array.isArray(p.data().list) ? p.data().list.slice() : [], b = y[n];
      if (!b) throw new Pe("not-found", "Card not found.");
      let _ = await l.get(N.doc(`paymentMethods/${b.methodId}`)), k = w.data();
      if (!w.exists || k.enabled !== !0 || !["withdraw", "both"].includes(k.type || "both")) throw v.bad("This method is not available.");
      let f = k.kind || "mobile", T = f === "mobile" ? o.replace(/\s/g, "") : o;
      if (lr[f] && !lr[f].test(T)) throw v.bad(f === "mobile" ? "\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F, 01 \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B6\u09C1\u09B0\u09C1\u0964" : "\u09B8\u09A0\u09BF\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09BF\u09A8\u0964");
      if (f === "bank" && (i.length < 2 || c.length < 2)) throw v.bad("\u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7\u09B0 \u09A8\u09BE\u09AE \u0993 \u09B6\u09BE\u0996\u09BE \u09A6\u09BF\u09A8\u0964");
      if (y.some((A, $) => $ !== n && A.methodId === s)) throw v.bad("\u098F\u0987 \u09AE\u09C7\u09A5\u09A1\u09C7 \u0986\u0997\u09C7\u0987 \u0986\u09B0\u09C7\u0995\u099F\u09BE \u0995\u09BE\u09B0\u09CD\u09A1 \u0986\u099B\u09C7\u0964");
      if (b.methodId === s && b.accountNumber === T && (b.holderName || "") === r && (b.bankName || "") === i && (b.branch || "") === c) throw v.bad("\u0995\u09BF\u099B\u09C1 \u09AC\u09A6\u09B2\u09BE\u09AF\u09BC\u09A8\u09BF\u0964");
      if (d = _.exists ? Math.min(1e5, Math.max(0, v.round2(j(_.data().cardChangeFee)))) : 0, d > 0) {
        let A = v.planDebit(h.data().balances, d, ["main", "winning", "referral", "commission"]), $ = {};
        for (let [E, I] of Object.entries(A)) $[E] = -I;
        v.applyDelta(l, m, $);
        for (let [E, I] of Object.entries(A)) v.ledger(l, { uid: t, type: "fee", direction: "out", amount: I, bucket: E, note: "Card number change", ref: "wdcard" });
        v.bumpStats(l, { feesCollected: d });
      }
      y[n] = { methodId: s, accountNumber: T, holderName: r, ...i ? { bankName: i, branch: c } : {}, savedAt: b.savedAt || Date.now(), changedAt: Date.now() }, l.set(u, { list: y, updatedAt: Date.now() }), v.notify(l, t, "Card updated", d > 0 ? `Withdraw card changed. Fee ${d}.` : "Withdraw card changed.", "withdraw"), v.audit(l, t, "wd_card_changed", { index: n, from: b.methodId, to: s, fee: d });
    }), { ok: !0, fee: d };
  });
  var Hn = /* @__PURE__ */ new Map();
  async function jc(e) {
    let t = Hn.get(e);
    if (t && t.at > Date.now() - 15e3) return t.v;
    let n = (await N.collection("lotteryTickets").where("lotteryId", "==", e).limit(3e3).get()).docs.map((i) => i.data()).filter((i) => i.status === "active" || i.status === "won").sort((i, c) => j(i.number) - j(c.number)), s = [...new Set(n.map((i) => i.uid))], o = {};
    for (let i = 0; i < s.length; i += 50)
      (await Promise.all(s.slice(i, i + 50).map((d) => N.doc(`users/${d}`).get()))).forEach((d) => {
        d.exists && (o[d.id] = d.data().username || "");
      });
    let r = { players: s.length, entries: n.slice(0, 600).map((i) => ({ t: i.number, n: Kn(o[i.uid]), uid: i.uid })) };
    return Hn.set(e, { at: Date.now(), v: r }), r;
  }
  async function wr(e, t) {
    if (!t || t.autoDraw !== !0 || t.status !== "open" || !Pt(t.endsAt) || Pt(t.endsAt) > Date.now() || !(j(t.sold) > 0)) return !1;
    try {
      return await xc.drawLottery(e, "auto"), Hn.delete(e), !0;
    } catch {
      return !1;
    }
  }
  ee.lotteryLive = ye({ region: he }, async (e) => {
    let t = v.authUid(e), a = v.str((e.data || {}).lotteryId, { max: 80 }), n = await N.doc(`lotteries/${a}`).get();
    if (!n.exists) throw new Pe("not-found", "Lottery not found.");
    await wr(a, n.data()) && (n = await N.doc(`lotteries/${a}`).get());
    let s = n.data(), o = await jc(a);
    return {
      id: a,
      title: s.title || "",
      prize: j(s.prize),
      price: j(s.price),
      sold: j(s.sold),
      total: j(s.totalTickets),
      status: s.status,
      endsAt: Pt(s.endsAt),
      now: Date.now(),
      autoDraw: s.autoDraw === !0,
      seedHash: s.seedHash || "",
      drawSeed: s.status === "drawn" && s.drawSeed || "",
      drawCount: j(s.drawCount),
      winnerTicket: s.winnerTicket || null,
      winnerName: s.status === "drawn" ? Kn(s.winnerName) : "",
      winnerIsMe: s.status === "drawn" && s.winnerUid === t,
      players: o.players,
      mine: o.entries.filter((r) => r.uid === t).map((r) => r.t),
      entries: o.entries.map((r) => ({ t: r.t, n: r.n }))
    };
  });
  async function yr() {
    let e = await N.collection("lotteries").where("status", "==", "open").limit(100).get(), t = 0;
    for (let a of e.docs) await wr(a.id, a.data()) && t++;
    return t;
  }
  ee.lotteryTick = Gc({ region: he, schedule: "every 1 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 120 }, async () => {
    await yr();
  });
  ee.lotteryAutoCheck = ye({ region: he }, async (e) => (v.authUid(e), { drawn: await yr() }));
  var Fc = ["deposit", "withdraw", "account", "game", "other"], Hc = { deposit: "\u09A1\u09BF\u09AA\u09CB\u099C\u09BF\u099F", withdraw: "\u0989\u0987\u09A5\u09A1\u09CD\u09B0", account: "\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F", game: "\u0997\u09C7\u09AE", other: "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF" }, br = { fetch: (...e) => fetch(...e) };
  async function Mt(e, t) {
    let a = wt().TELEGRAM_BOT_TOKEN;
    if (!a) return null;
    try {
      return await (await br.fetch(`https://api.telegram.org/bot${a}/${e}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(t) })).json();
    } catch {
      return null;
    }
  }
  async function Vn(e, t, a, n = {}) {
    let s = N.doc(`supportThreads/${e}`), o = Date.now();
    await N.collection(`supportThreads/${e}/msgs`).doc().set({ from: t, text: a, at: o, ...n });
    let r = { lastAt: o, lastText: a.slice(0, 120), lastFrom: t };
    t === "user" ? (r.unreadStaff = ur.increment(1), r.status = "open") : (r.unreadUser = ur.increment(1), r.unreadStaff = 0), await s.set(r, { merge: !0 });
  }
  ee.supportSend = ye({ region: he }, async (e) => {
    let t = v.authUid(e), a = e.data || {}, n = v.str(a.text, { min: 1, max: 1e3, label: "Message" }), s = Fc.includes(a.topic) ? a.topic : "other", o = (await N.doc(`users/${t}`).get()).data() || {}, r = N.doc(`supportThreads/${t}`), i = await r.get(), c = i.exists ? i.data() : {}, d = Math.floor(Date.now() / 36e5), l = c.rateHour === d ? j(c.rateCount) : 0;
    if (l >= 30) throw new Pe("resource-exhausted", "\u0985\u09A8\u09C7\u0995 \u09AE\u09C7\u09B8\u09C7\u099C \u09AA\u09BE\u09A0\u09BF\u09AF\u09BC\u09C7\u099B\u09C7\u09A8, \u098F\u0995\u099F\u09C1 \u09AA\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u09B2\u09BF\u0996\u09C1\u09A8\u0964");
    i.exists || await r.set({ uid: t, username: o.username || "", createdAt: Date.now(), unreadUser: 0, unreadStaff: 0 }), await r.set({ rateHour: d, rateCount: l + 1, topic: s, username: o.username || "" }, { merge: !0 }), await Vn(t, "user", n, { topic: s });
    let u = wt().TELEGRAM_CHAT_ID;
    if (u) {
      let m = await Mt("sendMessage", { chat_id: u, text: `\u{1F198} ${o.username || "player"} \xB7 ${Hc[s]}

${n}

#U${t.slice(0, 8)} \u2014 \u098F\u0987 \u09AE\u09C7\u09B8\u09C7\u099C\u09C7 Reply \u09A6\u09BF\u09B2\u09C7 \u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0 \u09B8\u09BE\u0987\u099F\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09AA\u09BE\u09AC\u09C7` });
      m && m.ok && m.result && await N.doc(`tgMap/${m.result.message_id}`).set({ uid: t, at: Date.now() });
    }
    return { ok: !0 };
  });
  ee.supportMine = ye({ region: he }, async (e) => {
    let t = v.authUid(e), a = await N.collection(`supportThreads/${t}/msgs`).orderBy("at", "desc").limit(60).get(), n = await N.doc(`supportThreads/${t}`).get();
    return n.exists && j(n.data().unreadUser) && await N.doc(`supportThreads/${t}`).update({ unreadUser: 0 }), { msgs: a.docs.map((s) => {
      let o = s.data();
      return { from: o.from, text: o.text, at: o.at, via: o.via || "" };
    }).reverse() };
  });
  ee.adminSupportList = ye({ region: he }, async (e) => (v.requireRole(e, ["super", "support"]), {
    threads: (await N.collection("supportThreads").orderBy("lastAt", "desc").limit(100).get()).docs.map((a) => {
      let n = a.data();
      return { uid: a.id, username: n.username || "", lastAt: n.lastAt || 0, lastText: n.lastText || "", lastFrom: n.lastFrom || "", unread: j(n.unreadStaff), topic: n.topic || "" };
    }),
    telegram: !!(wt().TELEGRAM_BOT_TOKEN && wt().TELEGRAM_CHAT_ID)
  }));
  ee.adminSupportThread = ye({ region: he }, async (e) => {
    v.requireRole(e, ["super", "support"]);
    let t = v.str((e.data || {}).uid, { max: 80 }), a = await N.collection(`supportThreads/${t}/msgs`).orderBy("at", "desc").limit(100).get(), n = await N.doc(`supportThreads/${t}`).get();
    return n.exists && j(n.data().unreadStaff) && await N.doc(`supportThreads/${t}`).update({ unreadStaff: 0 }), { username: n.exists && n.data().username || "", msgs: a.docs.map((s) => {
      let o = s.data();
      return { from: o.from, text: o.text, at: o.at, via: o.via || "" };
    }).reverse() };
  });
  ee.adminSupportReply = ye({ region: he }, async (e) => {
    let t = v.requireRole(e, ["super", "support"]), a = e.data || {}, n = v.str(a.uid, { max: 80 }), s = v.str(a.text, { min: 1, max: 1e3, label: "Message" });
    if (!(await N.doc(`supportThreads/${n}`).get()).exists) throw new Pe("not-found", "Chat not found.");
    return await Vn(n, "staff", s, { by: t, via: "panel" }), await N.runTransaction(async (o) => {
      v.notify(o, n, "Support replied", s.slice(0, 140), "support");
    }), { ok: !0 };
  });
  ee.adminSupportClose = ye({ region: he }, async (e) => {
    v.requireRole(e, ["super", "support"]);
    let t = v.str((e.data || {}).uid, { max: 80 });
    return await N.doc(`supportThreads/${t}`).set({ status: "closed", unreadStaff: 0 }, { merge: !0 }), { ok: !0 };
  });
  ee.adminTelegramSetup = ye({ region: he }, async (e) => {
    v.requireRole(e, ["super"]);
    let t = wt();
    if (!t.TELEGRAM_BOT_TOKEN) throw new Pe("failed-precondition", "Supabase Secrets \u098F TELEGRAM_BOT_TOKEN \u09A8\u09C7\u0987\u0964");
    if (!t.TELEGRAM_WEBHOOK_SECRET) throw new Pe("failed-precondition", "Supabase Secrets \u098F TELEGRAM_WEBHOOK_SECRET \u09A8\u09C7\u0987\u0964");
    let a = await Mt("getMe", {});
    if (!a || !a.ok) throw new Pe("failed-precondition", "\u09AC\u099F\u09C7\u09B0 \u099F\u09CB\u0995\u09C7\u09A8 \u0995\u09BE\u099C \u0995\u09B0\u099B\u09C7 \u09A8\u09BE\u0964");
    let n = `${String(t.SUPABASE_URL || "").replace(/\/+$/, "")}/functions/v1/api/tg`, s = await Mt("setWebhook", { url: n, secret_token: t.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ["message"] });
    if (!s || !s.ok) throw new Pe("failed-precondition", "Webhook \u09B8\u09C7\u099F \u09B9\u09AF\u09BC\u09A8\u09BF: " + (s && s.description || "unknown"));
    return t.TELEGRAM_CHAT_ID && await Mt("sendMessage", { chat_id: t.TELEGRAM_CHAT_ID, text: "\u2705 DEEMBD \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u09AC\u099F \u099A\u09BE\u09B2\u09C1 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" }), { ok: !0, bot: a.result.username, chat: !!t.TELEGRAM_CHAT_ID };
  });
  async function Ar(e) {
    let t = e && e.message;
    if (!t || typeof t.text != "string") return;
    let a = String(t.chat && t.chat.id), n = t.text.trim();
    if (/^\/(id|start)\b/.test(n)) {
      await Mt("sendMessage", { chat_id: a, text: `\u098F\u0987 \u099A\u09CD\u09AF\u09BE\u099F\u09C7\u09B0 \u0986\u0987\u09A1\u09BF: ${a}
\u098F\u099F\u09BE Supabase Secrets \u098F TELEGRAM_CHAT_ID \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09AC\u09B8\u09BE\u09A8\u0964` });
      return;
    }
    if (!wt().TELEGRAM_CHAT_ID || a !== String(wt().TELEGRAM_CHAT_ID)) return;
    let s = t.reply_to_message;
    if (!s) return;
    let o = await N.doc(`tgMap/${s.message_id}`).get();
    if (!o.exists) return;
    let r = o.data().uid, i = t.from && (t.from.first_name || t.from.username) || "Support";
    await Vn(r, "staff", n.slice(0, 1e3), { via: "telegram", by: `tg:${i}` }), await N.runTransaction(async (c) => {
      v.notify(c, r, "Support replied", n.slice(0, 140), "support");
    }), await Mt("sendMessage", { chat_id: a, text: "\u2713 \u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0\u0995\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09AF\u09BC\u09C7\u099B\u09C7", reply_to_message_id: t.message_id });
  }
  Ar.__kind = "hook";
  ee.telegramHook = Ar;
  ee.__net = br;
  var aa = null;
  try {
    aa = Ut();
  } catch {
    aa = null;
  }
  var Tr = (e) => Pt(e && e.createdAt), Kc = () => {
    let e = new Date(Date.now() + 216e5);
    return e.setUTCHours(0, 0, 0, 0), e.getTime() - 6 * 36e5;
  }, mr = (e, t) => ({
    kind: "deposit",
    id: e,
    trxId: t.trxId || "",
    username: t.username || "",
    uid: t.uid || "",
    method: t.methodName || t.methodId || "",
    amount: j(t.amount),
    from: t.senderNumber || "",
    to: t.accountNumber || "",
    holder: t.holderName || "",
    status: t.status || "",
    at: Tr(t),
    reviewedBy: t.reviewedBy || "",
    shot: t.screenshotPath || "",
    shotStore: t.screenshotStore || "",
    bank: t.bankName ? `${t.bankName}${t.branch ? ", " + t.branch : ""}` : ""
  }), Vc = (e, t) => ({
    kind: "withdraw",
    id: e,
    trxId: t.payTrxId || "",
    username: t.username || "",
    uid: t.uid || "",
    method: t.methodName || t.methodId || "",
    amount: j(t.net || t.amount),
    from: t.fromNumber || "",
    to: t.accountNumber || "",
    holder: t.holderName || "",
    status: t.status || "",
    at: Tr(t),
    reviewedBy: t.reviewedBy || "",
    shot: t.proofKey || "",
    shotStore: t.proofKey ? "s3" : "",
    bank: t.bankName ? `${t.bankName}${t.branch ? ", " + t.branch : ""}` : ""
  });
  async function Wc(e, t, a, n) {
    let s = "%" + a.replace(/[\\%_]/g, (i) => "\\" + i) + "%", o = t.map((i, c) => `coalesce(data->>'${i}','') ilike $1`).join(" or ");
    return (await aa.sql.unsafe(`select id, data from public.docs where collection = $2 and (${o}) order by coalesce((data->'createdAt'->>'__ts')::bigint, 0) desc limit ${n}`, [s, e])).map((i) => [i.id, i.data]);
  }
  async function zc(e, t, a, n) {
    let s = await N.collection(e).orderBy("createdAt", "desc").limit(5e3).get(), o = a.toLowerCase();
    return s.docs.filter((r) => t.some((i) => String(r.data()[i] || "").toLowerCase().includes(o))).slice(0, n).map((r) => [r.id, r.data()]);
  }
  ee.adminTrxSearch = ye({ region: he, timeoutSeconds: 60 }, async (e) => {
    v.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = ["deposit", "withdraw"].includes(t.kind) ? t.kind : "all", n = ["today", "approved", "pending", "dup"].includes(t.list) ? t.list : "";
    if (n === "dup") {
      let i = await N.collection("auditLogs").where("action", "==", "duplicate_trx_attempt").orderBy("at", "desc").limit(60).get(), c = [...new Set(i.docs.map((l) => l.data().actorUid).filter(Boolean))], d = {};
      return (await Promise.all(c.map((l) => N.doc(`users/${l}`).get()))).forEach((l) => {
        l.exists && (d[l.id] = l.data().username || "");
      }), { results: i.docs.map((l) => {
        let u = l.data(), m = u.detail || {};
        return { kind: "dup", id: l.id, trxId: m.trxId || "", method: m.methodId || "", username: d[u.actorUid] || "", uid: u.actorUid || "", count: j(m.count), at: Pt(u.at) };
      }) };
    }
    if (n) {
      let c = (await N.collection("deposits").where("createdAt", ">=", Kc()).orderBy("createdAt", "desc").limit(500).get()).docs.map((d) => mr(d.id, d.data()));
      return n !== "today" && (c = c.filter((d) => d.status === n)), { results: c.slice(0, 200) };
    }
    let s = v.str(t.q, { min: 2, max: 60, label: "Search" }), o = aa && aa.sql ? Wc : zc, r = [];
    return a !== "withdraw" && (await o("deposits", ["trxId", "senderNumber", "username", "accountNumber"], s, 40)).forEach(([i, c]) => r.push(mr(i, c))), a !== "deposit" && (await o("withdrawals", ["payTrxId", "accountNumber", "username", "fromNumber"], s, 40)).forEach(([i, c]) => r.push(Vc(i, c))), r.sort((i, c) => c.at - i.at), { results: r.slice(0, 60) };
  });
});

// src/index.js
var vr = M((yt) => {
  "use strict";
  Object.assign(
    yt,
    ys(),
    Os(),
    qs(),
    Ks(),
    Zs(),
    eo(),
    Bn(),
    Ho(),
    Xo(),
    tr(),
    nr(),
    fa(),
    dr(),
    kr()
  );
  delete yt.ensureUserDoc;
  delete yt.LOBBY;
  delete yt.forceLogoutOne;
  delete yt.helpers;
  delete yt.__net;
});

// supa/handler.js
var Ir = M((jd, _r) => {
  "use strict";
  var de = Ut(), { HttpsError: Sr } = se(), Yc = {
    "invalid-argument": 400,
    "failed-precondition": 400,
    "out-of-range": 400,
    unauthenticated: 401,
    "permission-denied": 403,
    "not-found": 404,
    "already-exists": 409,
    aborted: 409,
    "resource-exhausted": 429,
    cancelled: 499,
    internal: 500,
    unknown: 500,
    "data-loss": 500,
    unimplemented: 501,
    unavailable: 503,
    "deadline-exceeded": 504
  }, Jc = (e) => String(e).toUpperCase().replace(/-/g, "_"), Xc = null, Ka = () => Xc ||= vr();
  function Cr(e) {
    return {
      "access-control-allow-origin": de.env.ALLOWED_ORIGIN || "*",
      "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-max-age": "86400",
      vary: "origin",
      ...e
    };
  }
  var Oe = (e, t, a) => ({ status: e, headers: Cr({ "content-type": "application/json", "cache-control": "no-store", ...a || {} }), body: JSON.stringify(t) }), Zc = (e) => e instanceof Sr || e && e.name === "HttpsError" ? Oe(Yc[e.code] || 500, { error: { status: Jc(e.code), code: e.code, message: e.message, details: e.details === void 0 ? null : e.details } }) : (console.error("unhandled", e && e.stack || e), Oe(500, { error: { status: "INTERNAL", code: "internal", message: "Something went wrong on the server. Please try again.", details: null } })), Va = de.tokenCache = /* @__PURE__ */ new Map();
  async function Qc(e) {
    if (de.verifyToken) return de.verifyToken(e);
    let t = Va.get(e);
    if (t && t.exp > Date.now()) return t.user;
    let a = String(de.env.SUPABASE_URL || "").replace(/\/$/, "") + "/auth/v1/user", n = await de.fetch(a, { headers: { apikey: de.env.SUPABASE_ANON_KEY || de.env.SUPABASE_SERVICE_ROLE_KEY || "", authorization: "Bearer " + e } });
    if (!n.ok) return null;
    let s = await n.json();
    if (!s || !s.id) return null;
    let o = { uid: s.id, email: s.email || "", confirmed: !!s.email_confirmed_at, app: s.app_metadata || {}, lastSignIn: s.last_sign_in_at };
    return Va.set(e, { user: o, exp: Date.now() + (Number(de.env.TOKEN_CACHE_MS) >= 0 && de.env.TOKEN_CACHE_MS !== void 0 && de.env.TOKEN_CACHE_MS !== "" ? Number(de.env.TOKEN_CACHE_MS) : 3e3) }), Va.size > 500 && Va.clear(), o;
  }
  var ed = (e) => e && {
    uid: e.uid,
    token: { uid: e.uid, email: e.email, email_verified: e.confirmed || !de.requireVerified(), admin: e.app.admin === !0, role: e.app.role || null, auth_time: e.lastSignIn ? Math.floor(Date.parse(e.lastSignIn) / 1e3) : void 0 }
  }, Wn = (e) => e == null ? Buffer.alloc(0) : Buffer.from(e), td = (e) => {
    let t = {};
    for (let [a, n] of Object.entries(e || {})) t[String(a).toLowerCase()] = n;
    return t;
  };
  async function ad(e) {
    let t = td(e.headers), a = String(e.method || "GET").toUpperCase();
    if (a === "OPTIONS") return { status: 204, headers: Cr(), body: "" };
    let s = new URL(e.url, "http://x").pathname, o = s.indexOf("/api/");
    o >= 0 ? s = s.slice(o + 4) : s.endsWith("/api") && (s = "/"), s = s.replace(/\/+$/, "") || "/";
    try {
      if (s === "/health") return Oe(200, { ok: !0, time: Date.now() });
      if (s === "/agw" || s.startsWith("/agw/")) {
        let h = Ka().agCallback, w = { status: 200, headers: {}, body: "" }, y = { status(b) {
          return w.status = b, y;
        }, set(b) {
          return Object.assign(w.headers, b), y;
        }, send(b) {
          return w.body = b, y;
        } };
        return await h({ method: a, path: s, url: s, headers: t, rawBody: Wn(e.body), ip: t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : "" }, y), { status: w.status, headers: { "cache-control": "no-store", ...w.headers }, body: typeof w.body == "string" ? w.body : JSON.stringify(w.body) };
      }
      if (s === "/tg") {
        if (!de.env.TELEGRAM_WEBHOOK_SECRET || t["x-telegram-bot-api-secret-token"] !== de.env.TELEGRAM_WEBHOOK_SECRET) return Oe(401, { ok: !1 });
        let h = null;
        try {
          h = JSON.parse(Wn(e.body).toString("utf8") || "{}");
        } catch {
          h = null;
        }
        try {
          await Ka().telegramHook(h);
        } catch {
        }
        return Oe(200, { ok: !0 });
      }
      if (s.startsWith("/_cron/")) {
        if (!de.env.CRON_SECRET || t["x-cron-secret"] !== de.env.CRON_SECRET) return Oe(401, { error: { code: "unauthenticated", message: "bad secret" } });
        let h = Ka()[s.slice(7)];
        return !h || h.__kind !== "schedule" ? Oe(404, { error: { code: "not-found", message: "unknown job" } }) : (await h(), Oe(200, { ok: !0 }));
      }
      if (a !== "POST") return Oe(405, { error: { code: "invalid-argument", message: "POST only" } });
      let r = s.slice(1), i = Ka()[r];
      if (!i || i.__kind !== "call") return Oe(404, { error: { status: "NOT_FOUND", code: "not-found", message: "Unknown function." } });
      let c = null, d = /^Bearer\s+(.+)$/i.exec(t.authorization || "");
      if (d) {
        let h = await Qc(d[1]).catch(() => null);
        h && (c = ed(h));
      }
      let l = {}, u = Wn(e.body).toString("utf8");
      if (u)
        try {
          let h = JSON.parse(u);
          l = h && h.data !== void 0 ? h.data : h;
        } catch {
          throw new Sr("invalid-argument", "Bad JSON.");
        }
      let m = t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : t["cf-connecting-ip"] || "", p = await i({ data: l, auth: c, rawRequest: { headers: t, ip: m } });
      return Oe(200, { result: p === void 0 ? null : p });
    } catch (r) {
      return Zc(r);
    }
  }
  _r.exports = { handle: ad };
});

// supa/entry-deno.mjs
var Nr = Zn(Ut(), 1), $r = Zn(Ir(), 1);
import nd from "npm:postgres@3.4.4";
var Er = {};
for (let e of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET", "REQUIRE_VERIFIED", "ALLOWED_ORIGIN", "SITE_URL", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_REGION"]) Er[e] = Deno.env.get(e) || "";
var sd = Deno.env.get("DB_URL") || Deno.env.get("SUPABASE_DB_URL"), od = nd(sd, { max: 4, prepare: !1, idle_timeout: 20, connect_timeout: 10, onnotice() {
} });
Nr.default.configure({ sql: od, env: Er });
Deno.serve(async (e) => {
  let t = {};
  e.headers.forEach((s, o) => {
    t[o] = s;
  });
  let a = e.method === "GET" || e.method === "HEAD" || e.method === "OPTIONS" ? void 0 : new Uint8Array(await e.arrayBuffer()), n = await (0, $r.handle)({ method: e.method, url: e.url, headers: t, body: a });
  return new Response(n.status === 204 ? null : n.body, { status: n.status, headers: n.headers });
});
