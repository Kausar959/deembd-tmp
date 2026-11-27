// @ts-nocheck
import { createRequire as __cr } from "node:module";
import { Buffer as __Buf } from "node:buffer";
import __proc from "node:process";
const require = __cr("file:///src/index.ts");
globalThis.Buffer = globalThis.Buffer || __Buf;
globalThis.process = globalThis.process || __proc;
var Ps = Object.create;
var ba = Object.defineProperty;
var Ds = Object.getOwnPropertyDescriptor;
var Os = Object.getOwnPropertyNames;
var Ms = Object.getPrototypeOf, Us = Object.prototype.hasOwnProperty;
var fe = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, {
  get: (t, n) => (typeof require < "u" ? require : t)[n]
}) : e)(function(e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var R = (e, t) => () => {
  try {
    return t || e((t = { exports: {} }).exports, t), t.exports;
  } catch (n) {
    throw t = 0, n;
  }
};
var Bs = (e, t, n, a) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let o of Os(t))
      !Us.call(e, o) && o !== n && ba(e, o, { get: () => t[o], enumerable: !(a = Ds(t, o)) || a.enumerable });
  return e;
};
var Aa = (e, t, n) => (n = e != null ? Ps(Ms(e)) : {}, Bs(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  t || !e || !e.__esModule ? ba(n, "default", { value: e, enumerable: !0 }) : n,
  e
));

// src/trace.js
var vn = R((Bt) => {
  "use strict";
  var { AsyncLocalStorage: Ls } = fe("async_hooks"), Tn = new Ls();
  Bt.run = (e) => Tn.run({ t0: Date.now(), marks: [] }, e);
  Bt.mark = (e) => {
    let t = Tn.getStore();
    t && t.marks.length < 40 && t.marks.push(`${e}@${Date.now() - t.t0}`);
  };
  Bt.summary = () => {
    let e = Tn.getStore();
    return e ? e.marks.join(" ") : "";
  };
});

// supa/pgdb.js
var yt = R((zi, Sa) => {
  "use strict";
  var qs = fe("crypto"), { mark: Fe } = vn(), Gs = {
    increment: (e) => ({ __op: "inc", n: e }),
    serverTimestamp: () => ({ __op: "ts" })
  }, xs = {
    count: () => ({ aggregateType: "count" }),
    sum: (e) => ({ aggregateType: "sum", _field: e })
  }, js = (e) => Object.defineProperties({ __ts: e }, {
    toMillis: { value: () => e },
    toDate: { value: () => new Date(e) },
    seconds: { value: Math.floor(e / 1e3) },
    nanoseconds: { value: e % 1e3 * 1e6 }
  });
  function Lt(e) {
    if (Array.isArray(e)) return e.map(Lt);
    if (e && typeof e == "object") {
      if (typeof e.__ts == "number" && Object.keys(e).length === 1) return js(e.__ts);
      let t = {};
      for (let [n, a] of Object.entries(e)) t[n] = Lt(a);
      return t;
    }
    return e;
  }
  function Ie(e) {
    if (e instanceof Date) return { __ts: e.getTime() };
    if (Array.isArray(e)) return e.map(Ie);
    if (e && typeof e == "object") {
      if (e.__op) return e;
      if (typeof e.toMillis == "function" && typeof e.__ts == "number") return { __ts: e.__ts };
      let t = {};
      for (let [n, a] of Object.entries(e)) a !== void 0 && (t[n] = Ie(a));
      return t;
    }
    return e;
  }
  function qt(e, t) {
    if (t && t.__op === "inc") return (Number(e) || 0) + t.n;
    if (t && t.__op === "ts") return { __ts: Date.now() };
    if (Array.isArray(t)) return t.map((n) => qt(void 0, n));
    if (t && typeof t == "object" && typeof t.__ts != "number") {
      let n = {};
      for (let [a, o] of Object.entries(t)) n[a] = qt(void 0, o);
      return n;
    }
    return t;
  }
  function Ta(e, t, n) {
    let a = t.split("."), o = e;
    for (let r = 0; r < a.length - 1; r++)
      (typeof o[a[r]] != "object" || o[a[r]] === null) && (o[a[r]] = {}), o = o[a[r]];
    let s = a[a.length - 1];
    o[s] = qt(o[s], n);
  }
  function He(e, t) {
    for (let [n, a] of Object.entries(t))
      a && typeof a == "object" && !a.__op && !Array.isArray(a) && typeof a.__ts != "number" && e[n] && typeof e[n] == "object" && !Array.isArray(e[n]) && typeof e[n].__ts != "number" ? He(e[n], a) : e[n] = qt(e[n], a);
    return e;
  }
  var Sn = (e) => {
    let t = e.lastIndexOf("/");
    return { collection: e.slice(0, t), id: e.slice(t + 1) };
  }, ot = class {
    constructor(t, n) {
      this.ref = t, this.id = t.id, this._d = n, this.exists = n !== void 0;
    }
    data() {
      return this._d === void 0 ? void 0 : Lt(JSON.parse(JSON.stringify(this._d)));
    }
  }, va = (e) => {
    let t = new Error("ALREADY_EXISTS " + e);
    return t.code = 6, t;
  }, Fs = (e) => {
    let t = new Error("NOT_FOUND " + e);
    return t.code = 5, t;
  }, kn = class {
    /** @param sql a `postgres` (porsager) client */
    constructor(t) {
      this.sql = t;
    }
    doc(t) {
      return new st(this, t);
    }
    collection(t) {
      return new Gt(this, t);
    }
    batch() {
      let t = [], n = {
        set: (a, o, s = {}) => (t.push({ type: "set", path: a.path, data: o, merge: !!s.merge }), n),
        update: (a, o) => (t.push({ type: "update", path: a.path, data: o }), n),
        delete: (a) => (t.push({ type: "delete", path: a.path }), n),
        commit: async () => {
          await this.sql.begin((a) => this._applyAll(a, t));
        }
      };
      return n;
    }
    async _lockRead(t, n) {
      let [, a] = await Promise.all([t`select pg_advisory_xact_lock(hashtextextended(${n}, 0))`, t`select data from public.docs where path = ${n}`]);
      return Fe("get"), a.length ? a[0].data : void 0;
    }
    /**
     * Apply a list of buffered ops with a constant number of round trips (the DB may be far from the Edge Function):
     * 1 sorted advisory-lock statement, 1 read of every touched doc, 1 bulk upsert (+1 bulk delete, pipelined).
     * Ops on the same path are folded in order in memory, so semantics equal the old one-op-at-a-time loop.
     */
    async _applyAll(t, n) {
      if (!n.length) return;
      let a = [...new Set(n.map((c) => c.path))].sort(), [, o] = await Promise.all([
        t`select pg_advisory_xact_lock(hashtextextended(s.p, 0)) from (select p from unnest(${a}::text[]) as p order by p) s`,
        t`select path, data from public.docs where path = any(${a}::text[])`
      ]);
      Fe("lock+read");
      let s = /* @__PURE__ */ new Map();
      for (let c of o) s.set(c.path, c.data);
      for (let c of n) {
        let l = s.get(c.path);
        if (c.type === "delete") {
          s.set(c.path, void 0);
          continue;
        }
        let u;
        if (c.type === "create") {
          if (l !== void 0) throw va(c.path);
          u = He({}, Ie(c.data));
        } else if (c.type === "set") u = c.merge && l ? He(JSON.parse(JSON.stringify(l)), Ie(c.data)) : He({}, Ie(c.data));
        else if (c.type === "update") {
          if (l === void 0) throw Fs(c.path);
          u = JSON.parse(JSON.stringify(l));
          for (let [m, f] of Object.entries(Ie(c.data))) Ta(u, m, f);
        } else throw new Error("bad op " + c.type);
        s.set(c.path, u);
      }
      let r = [], i = [];
      for (let c of a) {
        let l = s.get(c);
        if (l === void 0) {
          o.some((f) => f.path === c) && i.push(c);
          continue;
        }
        let { collection: u, id: m } = Sn(c);
        r.push({ path: c, collection: u, id: m, data: l });
      }
      let d = [];
      r.length && d.push(t`insert into public.docs (path, collection, id, data)
        select t.path, t.collection, t.id, t.data from jsonb_to_recordset(${t.json(r)}::jsonb) as t(path text, collection text, id text, data jsonb)
        on conflict (path) do update set data = excluded.data`), i.length && d.push(t`delete from public.docs where path = any(${i}::text[])`), await Promise.all(d), Fe("write");
    }
    async _one(t) {
      return this.sql.begin((n) => this._applyAll(n, [t]));
    }
    /** Reads first, writes buffered and applied atomically (retried on deadlock / serialization failure like Firestore). */
    async runTransaction(t) {
      for (let n = 0; ; n++)
        try {
          return await this.sql.begin(async (a) => {
            Fe("txopen");
            let o = [], s = {
              get: async (i) => i instanceof st ? new ot(i, await this._lockRead(a, i.path)) : typeof i._exec == "function" ? i._exec(a) : i.get(),
              getAll: async (...i) => Promise.all(i.map(async (d) => new ot(d, await this._lockRead(a, d.path)))),
              set: (i, d, c = {}) => (o.push({ type: "set", path: i.path, data: d, merge: !!c.merge }), s),
              update: (i, d) => (o.push({ type: "update", path: i.path, data: d }), s),
              create: (i, d) => (o.push({ type: "create", path: i.path, data: d }), s),
              delete: (i) => (o.push({ type: "delete", path: i.path }), s)
            }, r = await t(s);
            return Fe("fn"), await this._applyAll(a, o), Fe("applied"), r;
          });
        } catch (a) {
          if ((a.code === "40P01" || a.code === "40001") && n < 4) {
            await new Promise((o) => setTimeout(o, 30 * (n + 1) + Math.random() * 40));
            continue;
          }
          throw a;
        }
    }
  }, st = class {
    constructor(t, n) {
      this.db = t, this.path = n, this.id = n.split("/").pop();
    }
    async get() {
      let t = await this.db.sql`select data from public.docs where path = ${this.path}`;
      return new ot(this, t.length ? t[0].data : void 0);
    }
    /** Plain overwrite = one atomic upsert statement (1 round trip, no transaction). */
    async set(t, n = {}) {
      if (n.merge) return this.db._one({ type: "set", path: this.path, data: t, merge: !0 });
      let { collection: a, id: o } = Sn(this.path);
      await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${a}, ${o}, ${this.db.sql.json(He({}, Ie(t)))}::jsonb)
                      on conflict (path) do update set data = excluded.data`;
    }
    update(t) {
      return this.db._one({ type: "update", path: this.path, data: t });
    }
    /** create = one `insert … on conflict do nothing` (1 round trip); no row back → ALREADY_EXISTS. */
    async create(t) {
      let { collection: n, id: a } = Sn(this.path), o = await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${n}, ${a}, ${this.db.sql.json(He({}, Ie(t)))}::jsonb)
                                on conflict (path) do nothing returning path`;
      if (Fe("create"), !o.length) throw va(this.path);
    }
    delete() {
      return this.db._one({ type: "delete", path: this.path });
    }
    collection(t) {
      return new Gt(this.db, `${this.path}/${t}`);
    }
  }, Cn = class e {
    constructor(t, n, a = [], o = [], s = null, r = null) {
      Object.assign(this, { db: t, path: n, f: a, o, lim: s, after: r });
    }
    where(t, n, a) {
      return new e(this.db, this.path, [...this.f, [t, n, Ie(a)]], this.o, this.lim, this.after);
    }
    orderBy(t, n = "asc") {
      return new e(this.db, this.path, this.f, [...this.o, [t, n]], this.lim, this.after);
    }
    limit(t) {
      return new e(this.db, this.path, this.f, this.o, t, this.after);
    }
    startAfter(t) {
      return new e(this.db, this.path, this.f, this.o, this.lim, t);
    }
    async _exec(t) {
      let a = (await t`select * from public.fs_query(${this.path}::text, ${t.json(this.f)}::jsonb, ${t.json(this.o)}::jsonb, ${this.lim}::int, ${this.after ? this.after.ref.path : null}::text)`).map((o) => new ot(new st(this.db, o.path), o.data));
      return { docs: a, empty: !a.length, size: a.length, forEach: (o) => a.forEach(o) };
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
        let n = {};
        for (let [a, o] of Object.entries(t)) {
          let s = await this.db.sql`select public.fs_agg(${this.path}::text, ${this.db.sql.json(this.f)}::jsonb, ${o.aggregateType === "sum" ? o._field : null}::text) as a`;
          n[a] = o.aggregateType === "count" ? Number(s[0].a.count) : Number(s[0].a.sum);
        }
        return { data: () => n };
      } };
    }
  }, Gt = class extends Cn {
    constructor(t, n) {
      super(t, n);
    }
    doc(t) {
      return new st(this.db, `${this.path}/${t || qs.randomBytes(10).toString("hex")}`);
    }
    async add(t) {
      let n = this.doc();
      return await n.set(t), n;
    }
  };
  Sa.exports = { PgDb: kn, FieldValue: Gs, AggregateField: xs, revive: Lt, plain: Ie, merge: He, setPath: Ta };
});

// supa/runtime.js
var xt = R((Yi, ka) => {
  "use strict";
  var _e = { sql: null, db: null, env: {}, fetch: (...e) => fetch(...e) };
  _e.configure = ({ sql: e, env: t, fetch: n }) => {
    let { PgDb: a } = yt();
    return _e.sql = e, _e.db = new a(e), _e.env = t || {}, globalThis.__ENV = _e.env, n && (_e.fetch = n), _e;
  };
  _e.requireVerified = () => String(_e.env.REQUIRE_VERIFIED || "0") === "1";
  ka.exports = _e;
});

// supa/shims/functions-https.js
var ne = R((Xi, Ca) => {
  "use strict";
  var In = class extends Error {
    constructor(t, n, a) {
      super(n), this.code = t, this.details = a, this.name = "HttpsError";
    }
  }, Hs = (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "call", n;
  }, Vs = (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "request", n;
  };
  Ca.exports = { HttpsError: In, onCall: Hs, onRequest: Vs };
});

// supa/shims/functions-v1.js
var Na = R((Ji, _a) => {
  "use strict";
  var Ia = () => {
    let e = () => {
    };
    return e.__kind = "trigger", e;
  };
  _a.exports = { region: () => ({ auth: { user: () => ({ onCreate: Ia, onDelete: Ia }) } }) };
});

// supa/shims/firebase-admin.js
var Ma = R((Zi, _n) => {
  "use strict";
  var G = xt(), { FieldValue: Pa, AggregateField: Ks } = yt(), Da = () => G.db;
  Da.FieldValue = Pa;
  var Ws = new Proxy(Da, { get: (e, t) => t === "FieldValue" ? Pa : t === "AggregateField" ? Ks : G.db[t] && typeof G.db[t] == "function" ? G.db[t].bind(G.db) : e[t] }), $a = (e) => e && {
    uid: e.id,
    email: e.email || "",
    emailVerified: !!e.email_confirmed_at || !G.requireVerified(),
    displayName: e.raw_user_meta_data && (e.raw_user_meta_data.displayName || e.raw_user_meta_data.name) || "",
    disabled: !!e.banned_until && new Date(e.banned_until).getTime() > Date.now(),
    customClaims: e.raw_app_meta_data || {}
  }, Ra = (e) => {
    let t = new Error(e || "There is no user record");
    return t.code = "auth/user-not-found", t;
  }, zs = {
    async getUser(e) {
      let t = await G.sql`select * from auth.users where id = ${e}::uuid`;
      if (!t.length) throw Ra();
      return $a(t[0]);
    },
    async getUserByEmail(e) {
      let t = await G.sql`select * from auth.users where lower(email) = lower(${e}) limit 1`;
      if (!t.length) throw Ra();
      return $a(t[0]);
    },
    async updateUser(e, t) {
      t.displayName !== void 0 && await G.sql`update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || ${G.sql.json({ displayName: t.displayName })}::jsonb where id = ${e}::uuid`, t.disabled !== void 0 && (await G.sql`update auth.users set banned_until = case when ${!!t.disabled}::boolean then 'infinity'::timestamptz else null end where id = ${e}::uuid`, G.tokenCache && G.tokenCache.clear());
    },
    async setCustomUserClaims(e, t) {
      await G.sql`update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || ${G.sql.json(t)}::jsonb where id = ${e}::uuid`;
    },
    /** Kills every session of the user: their refresh tokens stop working and the access token is rejected on the next call. */
    async revokeRefreshTokens(e) {
      await G.sql`delete from auth.sessions where user_id = ${e}::uuid`, G.tokenCache && G.tokenCache.clear();
    }
  }, Ea = (e) => e.startsWith("deposits/") ? { bucket: "deposits", name: e.slice(9) } : { bucket: "pub", name: e }, Ys = () => ({
    bucket: () => ({
      file: (e) => ({
        async exists() {
          let t = Ea(e);
          return [(await G.sql`select 1 from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`).length > 0];
        },
        async getMetadata() {
          let t = Ea(e), n = await G.sql`select metadata from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`, a = n[0] && n[0].metadata || {};
          return [{ contentType: a.mimetype || a.contentType || "", size: Number(a.size) || 0 }];
        }
      })
    })
  }), Xs = () => ({ sendEachForMulticast: async () => ({ responses: [] }) }), Oa = { apps: [1], initializeApp() {
  }, firestore: Ws, auth: () => zs, storage: Ys, messaging: Xs };
  _n.exports = Oa;
  _n.exports.default = Oa;
});

// src/util.js
var z = R((Qi, Ba) => {
  "use strict";
  var bt = Ma(), { HttpsError: Oe } = ne();
  bt.apps.length || bt.initializeApp();
  var rt = bt.firestore(), it = bt.firestore.FieldValue, Js = "asia-south1", Ua = ["main", "winning", "referral", "commission"], Zs = ["super", "finance", "support", "content", "payout"], De = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, Ve = (e) => new Oe("invalid-argument", e);
  function Nn(e) {
    if (!e.auth) throw new Oe("unauthenticated", "Please sign in.");
    return e.auth.uid;
  }
  function Qs(e) {
    let t = Nn(e);
    if (!e.auth.token.email_verified) throw new Oe("failed-precondition", "Please verify your email first.");
    return t;
  }
  function er(e, t) {
    let n = Nn(e), a = e.auth.token;
    if (a.admin !== !0 || !t.includes(a.role)) throw new Oe("permission-denied", "You do not have permission.");
    return n;
  }
  function tr(e, { min: t = 0.01, max: n = 1e9, label: a = "Amount" } = {}) {
    let o = Number(e);
    if (!Number.isFinite(o)) throw Ve(`${a} must be a number.`);
    if (o < t) throw Ve(`${a} must be at least ${t}.`);
    if (o > n) throw Ve(`${a} must be at most ${n}.`);
    return De(o);
  }
  function nr(e, { min: t = 1, max: n = 200, label: a = "Value", pattern: o = null } = {}) {
    if (typeof e != "string") throw Ve(`${a} is required.`);
    let s = e.trim();
    if (s.length < t || s.length > n) throw Ve(`${a} must be ${t}-${n} characters.`);
    if (o && !o.test(s)) throw Ve(`${a} has an invalid format.`);
    return s;
  }
  function ar(e) {
    if (!e) throw new Oe("not-found", "User profile not found.");
    if (e.status !== "active") throw new Oe("permission-denied", "This account is not active.");
  }
  function or(e, t, n = ["main", "winning"]) {
    let a = De(t);
    if (De(n.reduce((r, i) => r + (Number(e?.[i]) || 0), 0)) < a) throw new Oe("failed-precondition", "Insufficient balance.");
    let s = {};
    for (let r of n) {
      let i = Math.min(Number(e?.[r]) || 0, a);
      if (i > 0 && (s[r] = De(i), a = De(a - i)), a <= 0) break;
    }
    return s;
  }
  function sr(e, t, n) {
    let a = {};
    for (let [o, s] of Object.entries(n)) {
      if (!Ua.includes(o)) throw new Error("bad bucket " + o);
      a[`balances.${o}`] = it.increment(De(s));
    }
    e.update(t, a);
  }
  function rr(e, { uid: t, type: n, direction: a, amount: o, bucket: s = "main", note: r = "", ref: i = "" }) {
    e.set(rt.collection("transactions").doc(), {
      uid: t,
      type: n,
      direction: a,
      amount: De(o),
      bucket: s,
      note: r,
      ref: i,
      createdAt: it.serverTimestamp()
    });
  }
  function ir(e, t, n, a, o = "info") {
    e.set(rt.collection("users").doc(t).collection("notifications").doc(), {
      title: n,
      body: a,
      type: o,
      read: !1,
      createdAt: it.serverTimestamp()
    });
  }
  function cr(e, t) {
    let n = {};
    for (let [a, o] of Object.entries(t)) n[a] = it.increment(o);
    e.set(rt.doc("stats/global"), n, { merge: !0 });
  }
  function dr(e, t, n, a = {}) {
    let o = rt.collection("auditLogs").doc(), s = { actorUid: t, action: n, detail: a, at: it.serverTimestamp() };
    e ? e.set(o, s) : o.set(s);
  }
  async function ur() {
    let e = await rt.doc("settings/site").get();
    return e.exists ? e.data() : {};
  }
  Ba.exports = {
    admin: bt,
    db: rt,
    FieldValue: it,
    HttpsError: Oe,
    REGION: Js,
    BUCKETS: Ua,
    STAFF_ROLES: Zs,
    round2: De,
    bad: Ve,
    authUid: Nn,
    requireVerified: Qs,
    requireRole: er,
    amountOf: tr,
    str: nr,
    assertActive: ar,
    planDebit: or,
    applyDelta: sr,
    ledger: rr,
    notify: ir,
    bumpStats: cr,
    audit: dr,
    siteSettings: ur
  };
});

// src/auth.js
var Ga = R((At) => {
  "use strict";
  var lr = Na(), { onCall: qa } = ne(), Y = z(), { db: de, admin: $n, FieldValue: Ke, HttpsError: Rn, REGION: En } = Y, La = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", mr = () => Array.from({ length: 8 }, () => La[fe("crypto").randomInt(0, La.length)]).join("");
  async function jt(e, t = "", n = "") {
    let a = de.doc(`users/${e}`);
    if ((await a.get()).exists) return;
    let o = null;
    for (let s = 0; s < 8 && !o; s++) {
      let r = mr();
      try {
        await de.doc(`referralCodes/${r}`).create({ uid: e }), o = r;
      } catch (i) {
        if (i.code !== 6 && !/ALREADY_EXISTS/.test(String(i))) throw i;
      }
    }
    if (!o) throw new Rn("internal", "Could not allocate referral code.");
    await de.runTransaction(async (s) => {
      (await s.get(a)).exists || (s.set(a, {
        email: t,
        name: n,
        username: "",
        phone: "",
        photoURL: "",
        role: "user",
        status: "active",
        referralCode: o,
        referredBy: "",
        profileComplete: !1,
        signupRewardsGiven: !1,
        balances: { main: 0, winning: 0, referral: 0, commission: 0 },
        createdAt: Ke.serverTimestamp(),
        lastLoginAt: null,
        lastSeenAt: null
      }), Y.bumpStats(s, { totalUsers: 1 }));
    });
  }
  At.onAuthCreate = lr.region(En).auth.user().onCreate((e) => jt(e.uid, e.email || "", e.displayName || ""));
  At.completeRegistration = qa({ region: En }, async (e) => {
    let t = Y.authUid(e), n = e.data || {}, a = Y.str(n.name, { min: 2, max: 60, label: "Name" }), o = Y.str(n.username, { min: 3, max: 20, label: "Username", pattern: /^[A-Za-z0-9_]+$/ }).toLowerCase(), s = Y.str(n.phone, { min: 8, max: 16, label: "Phone", pattern: /^\+?[0-9]{8,15}$/ }), r = typeof n.referralCode == "string" ? n.referralCode.trim().toUpperCase() : "", i = await $n.auth().getUser(t);
    await jt(t, i.email || "", a);
    let d = "";
    if (r) {
      let c = await de.doc(`referralCodes/${r}`).get();
      if (!c.exists) throw Y.bad("Referral code not found.");
      if (c.data().uid === t) throw Y.bad("You cannot use your own referral code.");
      d = c.data().uid;
    }
    return await de.runTransaction(async (c) => {
      let l = de.doc(`users/${t}`);
      if ((await c.get(l)).data().profileComplete) return;
      let m = de.doc(`usernames/${o}`);
      if ((await c.get(m)).exists) throw new Rn("already-exists", "Username is already taken.");
      c.set(m, { uid: t }), c.update(l, { name: a, username: o, phone: s, referredBy: d, profileComplete: !0 });
    }), await $n.auth().updateUser(t, { displayName: a }), { ok: !0 };
  });
  At.bootstrap = qa({ region: En }, async (e) => {
    let t = Y.authUid(e), n = await $n.auth().getUser(t);
    await jt(t, n.email || "", n.displayName || "");
    let a = de.doc(`users/${t}`), o = await Y.siteSettings(), s = Y.round2(Number(o.welcomeBonus) || 0), r = Y.round2(Number(o.referral?.signupReward) || 0);
    if ((await de.runTransaction(async (c) => {
      let u = (await c.get(a)).data();
      if (u.status !== "active") return { banned: !0 };
      let m = n.emailVerified && u.profileComplete && !u.signupRewardsGiven, f = null;
      m && u.referredBy && r > 0 && (f = await c.get(de.doc(`users/${u.referredBy}`)));
      let g = { lastLoginAt: Ke.serverTimestamp(), lastSeenAt: Ke.serverTimestamp() };
      if (m && (g.signupRewardsGiven = !0, s > 0 && (g["balances.main"] = Ke.increment(s), Y.ledger(c, { uid: t, type: "bonus", direction: "in", amount: s, bucket: "main", note: "Welcome bonus" }), Y.notify(c, t, "Welcome!", `${s} welcome bonus has been added to your wallet.`, "bonus")), f && f.exists && f.data().status === "active")) {
        let b = u.referredBy;
        c.update(de.doc(`users/${b}`), { "balances.referral": Ke.increment(r) }), Y.ledger(c, { uid: b, type: "referral", direction: "in", amount: r, bucket: "referral", note: `Referral: ${u.username}` }), Y.notify(c, b, "New referral", `${u.username} joined with your code. +${r}`, "referral"), c.set(de.doc(`referrals/${t}`), {
          referrerUid: b,
          referredUid: t,
          referredName: u.username,
          rewardAmount: r,
          commissionTotal: 0,
          createdAt: Ke.serverTimestamp()
        }), Y.bumpStats(c, { totalReferrals: 1 });
      }
      return c.update(a, g), { banned: !1 };
    })).banned) throw new Rn("permission-denied", "This account is banned.");
    let d = (e.rawRequest?.headers?.["x-forwarded-for"] || e.rawRequest?.ip || "").toString().split(",")[0].trim();
    return await de.collection("loginHistory").add({
      uid: t,
      at: Ke.serverTimestamp(),
      ip: d,
      ua: (e.rawRequest?.headers?.["user-agent"] || "").toString().slice(0, 300)
    }), { ok: !0, emailVerified: n.emailVerified };
  });
  At.ensureUserDoc = jt;
});

// src/payrot.js
var On = R((tc, Va) => {
  "use strict";
  var We = z(), { db: Tt } = We, ja = 864e5, pr = 25e3, Fa = 30, E = (e) => Number.isFinite(Number(e)) ? Number(e) : 0, Pn = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 10), ze = (e) => E(e.cycleLimit) > 0, Ft = (e) => E(e.cycleReceived), Dn = (e) => E(e.cycleReserved), Ha = (e) => ze(e) ? Math.max(0, We.round2(E(e.cycleLimit) - Ft(e) - Dn(e))) : 1 / 0, xa = (e, t) => E(e.priority) - E(t.priority) || E(e.lastActivatedAt) - E(t.lastActivatedAt) || E(e.createdAt) - E(t.createdAt) || String(e.id).localeCompare(String(t.id));
  function fr(e, t = {}) {
    return {
      accountId: e.id,
      methodId: e.methodId,
      cycleNo: E(e.cycleNo) || 1,
      receivedAmount: Ft(e),
      limit: E(e.cycleLimit),
      activatedAt: E(e.lastActivatedAt),
      limitReachedAt: E(e.limitReachedAt),
      cooldownStartedAt: E(e.cooldownStartedAt),
      cooldownEndsAt: E(e.cooldownUntil),
      ...t
    };
  }
  async function gr(e, t, n = {}) {
    let a = n.now || Date.now(), o = Math.max(1, E(n.min) || 1), s = await e.get(Tt.doc(`paymentMethods/${t}`)), r = await e.get(Tt.collection("paymentAccounts").where("methodId", "==", t)), i = s.exists ? s.data() : null, d = !i || i.autoRotation !== !1, l = (r.docs.length ? await e.getAll(...r.docs.map((p) => p.ref)) : []).filter((p) => p.exists).map((p) => ({ id: p.id, ref: p.ref, ...p.data() })), u = /* @__PURE__ */ new Map(), m = [], f = (p) => l.find((A) => A.id === p), g = (p, A) => {
      Object.assign(p, A), u.set(p.id, { ...u.get(p.id) || {}, ...A });
    }, b = (p, A) => {
      e.set(Tt.doc(`paymentCycles/${p.id}_${E(p.cycleNo) || 1}`), fr(p, { endReason: A, closedAt: a }), { merge: !0 });
    }, T = n.settle;
    if (T) {
      let p = f(T.accountId);
      if (p) {
        let A = {};
        ze(p) && (A.cycleReserved = Math.max(0, We.round2(Dn(p) - T.amount)), T.outcome === "approve" && (A.cycleReceived = We.round2(Ft(p) + T.amount))), T.outcome === "release" && (p.usedTodayKey === Pn(a) && (A.usedToday = Math.max(0, We.round2(E(p.usedToday) - T.amount))), p.usedMonthKey === Pn(a).slice(0, 7) && (A.usedMonth = Math.max(0, We.round2(E(p.usedMonth) - T.amount))), A.totalCollected = Math.max(0, We.round2(E(p.totalCollected) - T.amount)), A.totalDeposits = Math.max(0, E(p.totalDeposits) - 1)), g(p, A);
      }
    }
    let w = n.force || {};
    if (w.reset) {
      let p = f(w.reset);
      p && (b(p, "manual_reset"), g(p, { cycleReceived: 0, cycleNo: (E(p.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0, ...p.status === "cooldown" ? { status: "standby" } : {} }));
    }
    if (w.pause) {
      let p = f(w.pause);
      p && g(p, { status: "paused" });
    }
    if (w.resume) {
      let p = f(w.resume);
      p && p.status === "paused" && g(p, { status: "standby" });
    }
    if (w.activate) {
      let p = f(w.activate);
      if (p) {
        for (let A of l) A.id !== p.id && A.status === "active" && ze(A) && d && g(A, { status: "standby" });
        g(p, { status: "active", lastActivatedAt: a, cooldownStartedAt: 0, cooldownUntil: 0, limitReachedAt: 0 }), m.push({ old: "", next: p.id, reason: "manual" });
      }
    }
    for (let p of l)
      ze(p) && p.status === "cooldown" && E(p.cooldownUntil) && E(p.cooldownUntil) <= a && (e.set(Tt.doc(`paymentCycles/${p.id}_${E(p.cycleNo) || 1}`), { completedAt: a, endReason: "cooldown_ended" }, { merge: !0 }), g(p, { status: "standby", cycleReceived: 0, cycleNo: (E(p.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0 }));
    let C = "", v = "";
    if (d) {
      for (let y of l)
        if (ze(y) && y.status === "active" && (C = C || y.id, E(y.cycleLimit) - Ft(y) < o && Dn(y) <= 0)) {
          let O = E(y.cooldownDays) > 0 ? E(y.cooldownDays) : Fa;
          g(y, { status: "cooldown", limitReachedAt: a, cooldownStartedAt: a, cooldownUntil: a + O * ja }), b(y, "limit_reached"), v = v || y.id;
        }
      let p = l.filter(ze), A = p.filter((y) => y.status === "active").sort((y, O) => E(O.lastActivatedAt) - E(y.lastActivatedAt) || xa(y, O));
      for (let y of A.slice(1)) g(y, { status: "standby" });
      if (!A.length) {
        let y = p.filter((O) => O.status === "standby" && Ha(O) >= o).sort(xa)[0];
        y ? (g(y, { status: "active", lastActivatedAt: a }), m.push({ old: v || C, next: y.id, reason: v ? "limit_reached" : n.reason || "no_active" })) : v && m.push({ old: v, next: "", reason: "limit_reached_no_standby" });
      }
    }
    for (let [p, A] of u) e.update(f(p).ref, { ...A, updatedAt: a });
    for (let p of m)
      !p.next && !p.old || e.set(Tt.collection("paymentRotationLogs").doc(), { methodId: t, oldAccountId: p.old || "", newAccountId: p.next || "", reason: p.reason, at: a });
    return { changed: [...u.keys()], activated: (m.find((p) => p.next) || {}).next || null, accounts: l };
  }
  Va.exports = { rotateTx: gr, cycleOn: ze, room: Ha, n0: E, dayKey: Pn, DAY: ja, DEFAULT_LIMIT: pr, DEFAULT_COOLDOWN_DAYS: Fa };
});

// src/storage.js
var Wt = R((Kt, Qa) => {
  "use strict";
  var { onCall: Bn } = ne(), ue = z(), { HttpsError: Ye, REGION: Ln } = ue, hr = () => globalThis.__ENV || process.env, Ka = () => {
    let e = hr(), n = { endpoint: String(e.S3_ENDPOINT || "").replace(/\/+$/, ""), bucket: String(e.S3_BUCKET || ""), key: String(e.S3_ACCESS_KEY_ID || ""), secret: String(e.S3_SECRET_ACCESS_KEY || ""), region: String(e.S3_REGION || "auto") };
    return n.ok = !!(n.endpoint && /^https:\/\//.test(n.endpoint) && n.bucket && n.key && n.secret), n;
  }, qn = () => Ka().ok, Mn = new TextEncoder(), Wa = (e) => [...new Uint8Array(e)].map((t) => t.toString(16).padStart(2, "0")).join(""), Un = () => globalThis.crypto && globalThis.crypto.subtle || fe("node:crypto").webcrypto.subtle, wr = async (e) => Wa(await Un().digest("SHA-256", Mn.encode(e))), vt = async (e, t) => {
    let n = await Un().importKey("raw", typeof e == "string" ? Mn.encode(e) : e, { name: "HMAC", hash: "SHA-256" }, !1, ["sign"]);
    return Un().sign("HMAC", n, Mn.encode(t));
  }, Ht = (e) => encodeURIComponent(e).replace(/[!'()*]/g, (t) => "%" + t.charCodeAt(0).toString(16).toUpperCase());
  async function St(e, t, { expires: n = 300, contentType: a = "", now: o = Date.now() } = {}) {
    let s = Ka();
    if (!s.ok) throw new Ye("failed-precondition", "File storage is not set up yet.");
    let r = new URL(s.endpoint), i = r.host, c = `${r.pathname.replace(/\/+$/, "")}/${Ht(s.bucket)}/${t.split("/").map(Ht).join("/")}`, l = new Date(o).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), u = l.slice(0, 8), m = `${u}/${s.region}/s3/aws4_request`, f = a ? "content-type;host" : "host", g = { "X-Amz-Algorithm": "AWS4-HMAC-SHA256", "X-Amz-Credential": `${s.key}/${m}`, "X-Amz-Date": l, "X-Amz-Expires": String(n), "X-Amz-SignedHeaders": f }, b = Object.keys(g).sort().map((A) => `${Ht(A)}=${Ht(g[A])}`).join("&"), T = (a ? `content-type:${a}
` : "") + `host:${i}
`, w = [e, c, b, T, f, "UNSIGNED-PAYLOAD"].join(`
`), C = ["AWS4-HMAC-SHA256", l, m, await wr(w)].join(`
`), v = await vt("AWS4" + s.secret, u);
    v = await vt(v, s.region), v = await vt(v, "s3"), v = await vt(v, "aws4_request");
    let p = Wa(await vt(v, C));
    return `${r.protocol}//${i}${c}?${b}&X-Amz-Signature=${p}`;
  }
  var za = (...e) => (ue.storageFetch || globalThis.fetch)(...e);
  async function Ya(e) {
    let t = await za(await St("HEAD", e, { expires: 60 }), { method: "HEAD" });
    if (t.status === 404) return { exists: !1 };
    if (!t.ok) throw new Ye("unavailable", "File storage did not answer. Please try again.");
    let n = (a) => (t.headers && t.headers.get ? t.headers.get(a) : "") || "";
    return { exists: !0, contentType: n("content-type"), size: Number(n("content-length")) || 0 };
  }
  async function Xa(e) {
    try {
      await za(await St("DELETE", e, { expires: 60 }), { method: "DELETE" });
    } catch {
    }
  }
  var Gn = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }, Vt = 3 * 1024 * 1024, Ja = (e) => typeof e == "string" && e.length <= 220 && /^[A-Za-z0-9_\-/.]+$/.test(e) && !e.includes("..") && !e.startsWith("/");
  async function yr(e) {
    let t = await Ya(e);
    if (!t.exists) throw new Ye("failed-precondition", "The screenshot upload was not found. Please upload again.");
    if (!Gn[String(t.contentType).split(";")[0]] || t.size > Vt)
      throw await Xa(e), ue.bad("Screenshot must be a JPG/PNG/WEBP image under 3 MB.");
    return t;
  }
  var Za = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  };
  async function br(e, t) {
    let n = ue.authUid(e), a = Za(e), o = t.split("/");
    if (o[0] === "deposits") return o[1] === n || ["super", "finance", "support"].includes(a);
    if (o[0] === "payouts") {
      if (["super", "finance"].includes(a)) return !0;
      if (a === "payout") {
        let s = await ue.db.doc(`withdrawals/${o[1]}`).get();
        return s.exists && s.data().assignedTo === n;
      }
      return !1;
    }
    return o[0] === "staff" ? !!a && a !== "payout" : !1;
  }
  Kt.storageStatus = Bn({ region: Ln }, async (e) => (ue.authUid(e), { configured: qn(), maxBytes: Vt, types: Object.keys(Gn) }));
  Kt.storageUploadUrl = Bn({ region: Ln }, async (e) => {
    let t = ue.authUid(e), n = e.data || {}, a = Za(e);
    if (!qn()) throw new Ye("failed-precondition", "File storage is not set up yet.");
    let o = String(n.contentType || ""), s = Gn[o];
    if (!s) throw ue.bad("Only JPG, PNG or WEBP images.");
    let r = Number(n.size) || 0;
    if (r <= 0 || r > Vt) throw ue.bad("Image must be under 3 MB.");
    let i = Math.random().toString(36).slice(2, 10), d = Date.now(), c;
    if (n.kind === "deposit") c = `deposits/${t}/${d}-${i}.${s}`;
    else if (n.kind === "payout") {
      let l = ue.str(n.withdrawalId, { max: 80, label: "Withdrawal" }), u = await ue.db.doc(`withdrawals/${l}`).get();
      if (!u.exists || u.data().assignedTo !== t || u.data().status !== "pending") throw new Ye("permission-denied", "This task is not assigned to you.");
      c = `payouts/${l}/${t}-${d}-${i}.${s}`;
    } else if (n.kind === "staff") {
      if (!a || a === "payout") throw new Ye("permission-denied", "Staff only.");
      c = `staff/${t}/${d}-${i}.${s}`;
    } else throw ue.bad("Unknown upload type.");
    return { url: await St("PUT", c, { expires: 300, contentType: o }), key: c, contentType: o, expiresIn: 300 };
  });
  Kt.storageViewUrl = Bn({ region: Ln }, async (e) => {
    let t = e.data && e.data.key;
    if (!Ja(t)) throw ue.bad("Invalid file.");
    if (!await br(e, t)) throw new Ye("permission-denied", "You cannot view this file.");
    return { url: await St("GET", t, { expires: 300 }), expiresIn: 300 };
  });
  Qa.exports.helpers = { presign: St, headObject: Ya, deleteObject: Xa, verifyImage: yr, configured: qn, safeKey: Ja, MAX_BYTES: Vt };
});

// src/wdcore.js
var xn = R((nc, eo) => {
  "use strict";
  var Me = z(), { db: Ar, FieldValue: Tr } = Me, Ue = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  function vr(e = Date.now()) {
    let t = new Date(e + 216e5);
    return t.setUTCHours(0, 0, 0, 0), new Date(t.getTime() - 6 * 36e5);
  }
  function Sr(e) {
    let t = e && e.withdraw || {};
    return {
      enabled: t.enabled !== !1,
      min: Ue(t.min),
      max: Ue(t.max),
      feePct: Ue(t.feePct),
      feeFlat: Ue(t.feeFlat),
      allowedBuckets: Array.isArray(t.allowedBuckets) && t.allowedBuckets.length ? t.allowedBuckets : ["winning", "referral", "commission"],
      dailyLimit: Ue(t.dailyLimit),
      dailyCount: Ue(t.dailyCount),
      maxPending: Ue(t.maxPending) || 3,
      processingText: typeof t.processingText == "string" ? t.processingText : "",
      notice: typeof t.notice == "string" ? t.notice : ""
    };
  }
  function kr(e, t, n, a, o, s, r = {}) {
    e.update(t, { status: a ? "approved" : "rejected", stage: a ? "done" : "rejected", note: s, reviewedAt: Tr.serverTimestamp(), reviewedBy: o, ...r }), a ? (Me.notify(e, n.uid, "Withdrawal approved", `${n.net} has been sent to ${n.accountNumber}.`, "withdraw"), Me.ledger(e, { uid: n.uid, type: "withdraw", direction: "out", amount: 0, bucket: n.bucket, note: `Paid ${n.net} (fee ${n.fee})`, ref: t.id }), Me.bumpStats(e, { totalWithdrawals: n.amount, feesCollected: n.fee, withdrawCount: 1, pendingWithdrawals: -1 })) : (Me.applyDelta(e, Ar.doc(`users/${n.uid}`), n.plan && Object.keys(n.plan).length ? n.plan : { [n.bucket]: n.amount }), Me.ledger(e, { uid: n.uid, type: "withdraw_refund", direction: "in", amount: n.amount, bucket: n.bucket, note: "Withdrawal rejected", ref: t.id }), Me.notify(e, n.uid, "Withdrawal rejected", s || "Your withdrawal was rejected and the amount was returned.", "withdraw"), Me.bumpStats(e, { pendingWithdrawals: -1 }));
  }
  eo.exports = { n0: Ue, startOfDhakaDay: vr, withdrawSettings: Sr, finalize: kr };
});

// src/wallet.js
var ao = R((Be) => {
  "use strict";
  var { onCall: Xe } = ne(), h = z(), { db: _, admin: Cr, FieldValue: $e, HttpsError: q, REGION: Je } = h, zt = On(), no = (e, t) => e && e.enabled === !0 && [t, "both"].includes(e.type || "both"), jn = () => new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10), to = () => jn().slice(0, 7), Q = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  Be.submitDeposit = Xe({ region: Je }, async (e) => {
    let t = h.requireVerified(e), n = e.data || {}, a = h.str(n.methodId, { max: 80, label: "Method" }), o = n.accountId ? h.str(n.accountId, { max: 120, label: "Account" }) : "", s = h.amountOf(n.amount), r = h.str(n.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), i = typeof n.senderNumber == "string" ? n.senderNumber.trim().slice(0, 30) : "", d = typeof n.screenshotPath == "string" ? n.screenshotPath.trim().slice(0, 200) : "";
    if (d) {
      if (!d.startsWith(`deposits/${t}/`) || d.includes("..")) throw h.bad("Invalid screenshot path.");
      let y = Wt().helpers;
      if (y.configured() && n.store === "s3") await y.verifyImage(d);
      else {
        let O = Cr.storage().bucket().file(d), [$] = await O.exists();
        if (!$) throw new q("failed-precondition", "Screenshot upload was not found. Please upload again.");
        let [P] = await O.getMetadata();
        if (!String(P.contentType || "").startsWith("image/")) throw h.bad("Screenshot must be an image.");
      }
    }
    let c = d && n.store === "s3" ? "s3" : "", u = (await h.siteSettings()).deposit || {}, m = Q(u.min) || 1, f = Q(u.max) || 1e7;
    if (s < m || s > f) throw h.bad(`Amount must be between ${m} and ${f}.`);
    if ((await _.collection("deposits").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= 5) throw new q("resource-exhausted", "Too many pending deposits. Please wait for review.");
    let b = new Date(Date.now() + 6 * 36e5);
    b.setUTCHours(0, 0, 0, 0);
    let T = new Date(b.getTime() - 6 * 36e5), C = (await _.collection("deposits").where("uid", "==", t).where("createdAt", ">=", T).get()).docs.filter((y) => y.data().status !== "rejected").reduce((y, O) => y + Q(O.data().amount), 0), p = (await _.doc(`users/${t}`).get()).data()?.dupTrx || {};
    if (p.blockedUntil && p.blockedUntil > Date.now()) throw new q("permission-denied", `Deposits are blocked until ${new Date(p.blockedUntil).toISOString().slice(0, 16).replace("T", " ")} UTC because of repeated duplicate transaction IDs.`);
    if ((await _.doc(`trxIndex/${a}_${r}`).get()).exists) {
      let y = p.lastAt && p.lastAt > Date.now() - 864e5 ? (p.count || 0) + 1 : 1, O = { "dupTrx.count": y, "dupTrx.lastAt": Date.now() };
      throw y >= 2 && (O["dupTrx.blockedUntil"] = Date.now() + 864e5), await _.doc(`users/${t}`).update(O), await _.doc("stats/global").set({ duplicateAttempts: $e.increment(1) }, { merge: !0 }), h.audit(null, t, "duplicate_trx_attempt", { methodId: a, trxId: r, count: y }), new q("already-exists", y >= 2 ? "This transaction ID was already used. Deposits are blocked for 24 hours." : "This transaction ID was already used. Another attempt will block deposits for 24 hours.");
    }
    let A = _.collection("deposits").doc();
    return await _.runTransaction(async (y) => {
      let O = [y.get(_.doc(`paymentMethods/${a}`)), y.get(_.doc(`users/${t}`)), y.get(_.doc(`trxIndex/${a}_${r}`))];
      o && O.push(y.get(_.doc(`paymentAccounts/${o}`)));
      let [$, P, H, pe] = await Promise.all(O);
      h.assertActive(P.data());
      let j = $.data();
      if (!$.exists || !no(j, "deposit")) throw h.bad("This payment method is not available.");
      if (j.minAmount && s < j.minAmount) throw h.bad(`Minimum for ${j.name} is ${j.minAmount}.`);
      if (j.maxAmount && s > j.maxAmount) throw h.bad(`Maximum for ${j.name} is ${j.maxAmount}.`);
      let ce = P.data().rg || {}, je = ce.pendingLimitAt && ce.pendingLimitAt <= Date.now() ? Q(ce.pendingLimit) : Q(ce.dailyDepositLimit);
      if (je > 0 && C + s > je) throw new q("failed-precondition", `Your daily deposit limit is ${je}. Remaining today: ${Math.max(0, h.round2(je - C))}.`);
      if (H.exists) throw new q("already-exists", "This transaction ID has already been submitted.");
      let Mt = j.accountNumber || "", Ut = "";
      if (o) {
        let te = pe && pe.exists ? pe.data() : null;
        if (!te || te.status !== "active" || te.methodId !== a) throw new q("failed-precondition", "This payment account is no longer available. Please choose again.");
        let wa = te.usedTodayKey === jn() ? Q(te.usedToday) : 0, ya = te.usedMonthKey === to() ? Q(te.usedMonth) : 0;
        if (wa + s > Q(te.dailyLimit) || ya + s > Q(te.monthlyLimit)) throw new q("failed-precondition", "This account reached its limit. Please choose again.");
        let Es = zt.cycleOn(te) ? { cycleReserved: h.round2(Q(te.cycleReserved) + s) } : {};
        if (zt.cycleOn(te) && s > zt.room(te)) throw new q("failed-precondition", "This payment number has reached its limit. Please try again shortly.");
        y.update(pe.ref, {
          usedToday: h.round2(wa + s),
          usedTodayKey: jn(),
          usedMonth: h.round2(ya + s),
          usedMonthKey: to(),
          totalDeposits: $e.increment(1),
          totalCollected: $e.increment(s),
          lastUsedAt: Date.now(),
          ...Es
        }), Mt = te.accountNumber || "", Ut = te.holderName || "";
      }
      y.set(_.doc(`trxIndex/${a}_${r}`), { uid: t, depositId: A.id }), y.set(A, {
        uid: t,
        username: P.data().username,
        methodId: a,
        methodName: j.name,
        accountId: o,
        accountNumber: Mt,
        holderName: Ut,
        amount: s,
        trxId: r,
        senderNumber: i,
        screenshotPath: d,
        screenshotStore: c,
        status: "pending",
        note: "",
        createdAt: $e.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), h.notify(y, t, "Deposit submitted", `${s} is waiting for approval.`, "deposit"), h.bumpStats(y, { pendingDeposits: 1 });
    }), { ok: !0, depositId: A.id };
  });
  Be.reviewDeposit = Xe({ region: Je }, async (e) => {
    let t = h.requireRole(e, ["super", "finance"]), n = e.data || {}, a = h.str(n.depositId, { max: 80 }), o = n.action === "approve";
    if (!o && n.action !== "reject") throw h.bad("Invalid action.");
    let s = typeof n.note == "string" ? n.note.trim().slice(0, 300) : "", r = await h.siteSettings(), i = Number(r.referral?.depositCommissionPct) || 0;
    return await _.runTransaction(async (d) => {
      let c = _.doc(`deposits/${a}`), l = await d.get(c);
      if (!l.exists) throw new q("not-found", "Deposit not found.");
      let u = l.data();
      if (u.status !== "pending") throw new q("failed-precondition", `Already ${u.status}.`);
      let m = _.doc(`users/${u.uid}`), f = await d.get(m), g = null, b = null;
      o && i > 0 && f.data().referredBy && (g = await d.get(_.doc(`users/${f.data().referredBy}`)), b = await d.get(_.doc(`referrals/${u.uid}`))), u.accountId && await zt.rotateTx(d, u.methodId, { now: Date.now(), min: Math.max(1, Q((r.deposit || {}).min) || 1), settle: { accountId: u.accountId, amount: u.amount, outcome: o ? "approve" : "release" } });
      let T = { status: o ? "approved" : "rejected", note: s, reviewedAt: $e.serverTimestamp(), reviewedBy: t };
      if (d.update(c, T), o) {
        if (h.applyDelta(d, m, { main: u.amount }), h.ledger(d, { uid: u.uid, type: "deposit", direction: "in", amount: u.amount, bucket: "main", note: u.methodName, ref: a }), h.notify(d, u.uid, "Deposit approved", `${u.amount} has been added to your wallet.`, "deposit"), h.bumpStats(d, { totalDeposits: u.amount, depositCount: 1, pendingDeposits: -1 }), g && g.exists && g.data().status === "active") {
          let w = h.round2(u.amount * i / 100);
          w > 0 && (h.applyDelta(d, g.ref, { commission: w }), h.ledger(d, { uid: g.id, type: "commission", direction: "in", amount: w, bucket: "commission", note: `Deposit by ${f.data().username}`, ref: a }), h.notify(d, g.id, "Referral commission", `+${w} from ${f.data().username}'s deposit.`, "referral"), b && b.exists && d.update(b.ref, { commissionTotal: $e.increment(w) }), h.bumpStats(d, { commissionPaid: w }));
        }
      } else
        d.delete(_.doc(`trxIndex/${u.methodId}_${u.trxId}`)), h.notify(d, u.uid, "Deposit rejected", s || "Your deposit request was rejected.", "deposit"), h.bumpStats(d, { pendingDeposits: -1 });
      h.audit(d, t, o ? "deposit_approved" : "deposit_rejected", { depositId: a, amount: u.amount, uid: u.uid });
    }), { ok: !0 };
  });
  Be.markDepositProcessing = Xe({ region: Je }, async (e) => {
    let t = h.requireRole(e, ["super", "finance"]), n = h.str((e.data || {}).depositId, { max: 80 });
    return await _.runTransaction(async (a) => {
      let o = _.doc(`deposits/${n}`), s = await a.get(o), r = s.exists ? s.data() : null;
      if (!r || r.status !== "pending") throw new q("failed-precondition", "Only a pending deposit can be marked processing.");
      r.stage !== "processing" && (a.update(o, { stage: "processing", processingAt: Date.now(), processingBy: t }), h.notify(a, r.uid, "Deposit processing", `Your deposit of ${r.amount} is being checked.`, "deposit"), h.audit(a, t, "deposit_processing", { depositId: n }));
    }), { ok: !0 };
  });
  Be.refundDeposit = Xe({ region: Je }, async (e) => {
    let t = h.requireRole(e, ["super", "finance"]), n = e.data || {}, a = h.str(n.depositId, { max: 80 }), o = h.str(n.note, { min: 3, max: 300, label: "Reason" });
    return await _.runTransaction(async (s) => {
      let r = _.doc(`deposits/${a}`), i = await s.get(r), d = i.exists ? i.data() : null;
      if (!d || d.status !== "approved") throw new q("failed-precondition", "Only an approved deposit can be refunded.");
      let c = _.doc(`users/${d.uid}`), l = await s.get(c), u = Q(l.data()?.balances?.main);
      if (u + 1e-9 < Q(d.amount)) throw new q("failed-precondition", `The player's main wallet has only ${h.round2(u)} \u2014 they already used part of this deposit.`);
      s.update(r, { status: "refunded", refundNote: o, refundedAt: $e.serverTimestamp(), refundedBy: t }), h.applyDelta(s, c, { main: -Q(d.amount) }), h.ledger(s, { uid: d.uid, type: "deposit_refund", direction: "out", amount: d.amount, bucket: "main", note: o, ref: a }), h.notify(s, d.uid, "Deposit refunded", `${d.amount} was returned to you. ${o}`, "deposit"), h.bumpStats(s, { totalDeposits: -Q(d.amount), depositCount: -1, depositsRefunded: Q(d.amount) }), h.audit(s, t, "deposit_refunded", { depositId: a, amount: d.amount, uid: d.uid, note: o });
    }), { ok: !0 };
  });
  var Yt = xn();
  Be.requestWithdraw = Xe({ region: Je }, async (e) => {
    let t = h.requireVerified(e), n = e.data || {}, a = h.str(n.methodId, { max: 80, label: "Method" }), o = n.bucket ? h.str(n.bucket, { max: 20, label: "Wallet" }) : "auto", s = h.amountOf(n.amount), r = h.str(n.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }), i = typeof n.holderName == "string" ? n.holderName.trim().slice(0, 60) : "", d = await h.siteSettings(), c = Yt.withdrawSettings(d);
    if (!c.enabled) throw new q("failed-precondition", c.notice || "Withdrawals are paused right now. Please try again later.");
    let l = c.allowedBuckets;
    if (o !== "auto" && !l.includes(o)) throw h.bad("This wallet cannot be withdrawn from.");
    let u = h.round2(s * c.feePct / 100 + c.feeFlat);
    if (u >= s) throw h.bad("Amount is too small after fees.");
    if ((await _.collection("withdrawals").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= c.maxPending) throw new q("resource-exhausted", `You already have ${c.maxPending} pending withdrawal(s). Please wait until they are processed.`);
    if (c.dailyLimit > 0 || c.dailyCount > 0) {
      let b = (await _.collection("withdrawals").where("uid", "==", t).where("createdAt", ">=", Yt.startOfDhakaDay()).get()).docs.filter((w) => w.data().status !== "rejected"), T = b.reduce((w, C) => w + Yt.n0(C.data().amount), 0);
      if (c.dailyCount > 0 && b.length >= c.dailyCount) throw new q("failed-precondition", `Daily limit reached: ${c.dailyCount} withdrawal(s) per day. Try again tomorrow.`);
      if (c.dailyLimit > 0 && T + s > c.dailyLimit) throw new q("failed-precondition", `Daily withdraw limit is ${c.dailyLimit}. You can withdraw ${Math.max(0, h.round2(c.dailyLimit - T))} more today.`);
    }
    let f = _.collection("withdrawals").doc();
    return await _.runTransaction(async (g) => {
      let [b, T] = await Promise.all([g.get(_.doc(`paymentMethods/${a}`)), g.get(_.doc(`users/${t}`))]);
      h.assertActive(T.data());
      let w = b.data();
      if (!b.exists || !no(w, "withdraw")) throw h.bad("This withdraw method is not available.");
      let C = Math.max(c.min || 0, w.withdrawMin || 0), v = Math.min(c.max || 1 / 0, w.withdrawMax || 1 / 0);
      if (s < C || s > v) throw h.bad(`Amount must be between ${C} and ${v === 1 / 0 ? "\u221E" : v}.`);
      let p = o === "auto" ? l : [o], A = h.planDebit(T.data().balances, s, p), y = {};
      for (let [O, $] of Object.entries(A)) y[O] = -$;
      h.applyDelta(g, T.ref, y), h.ledger(g, { uid: t, type: "withdraw_hold", direction: "out", amount: s, bucket: Object.keys(A)[0], note: w.name, ref: f.id }), h.notify(g, t, "Withdrawal requested", `${s} is waiting for approval (you receive ${h.round2(s - u)}).`, "withdraw"), g.set(f, {
        uid: t,
        username: T.data().username,
        methodId: a,
        methodName: w.name,
        bucket: Object.keys(A)[0],
        plan: A,
        holderName: i,
        accountNumber: r,
        amount: s,
        fee: u,
        net: h.round2(s - u),
        status: "pending",
        stage: "new",
        note: "",
        createdAt: $e.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), h.bumpStats(g, { pendingWithdrawals: 1 });
    }), { ok: !0, withdrawalId: f.id, fee: u, net: h.round2(s - u) };
  });
  Be.reviewWithdrawal = Xe({ region: Je }, async (e) => {
    let t = h.requireRole(e, ["super", "finance"]), n = e.data || {}, a = h.str(n.withdrawalId, { max: 80 }), o = n.action === "approve";
    if (!o && n.action !== "reject") throw h.bad("Invalid action.");
    let s = typeof n.note == "string" ? n.note.trim().slice(0, 300) : "";
    return await _.runTransaction(async (r) => {
      let i = _.doc(`withdrawals/${a}`), d = await r.get(i);
      if (!d.exists) throw new q("not-found", "Withdrawal not found.");
      let c = d.data();
      if (c.status !== "pending") throw new q("failed-precondition", `Already ${c.status}.`);
      if (c.stage === "paid_review") throw new q("failed-precondition", "An agent already paid this. Review it in Payout Review.");
      if (c.assignedTo && o) throw new q("failed-precondition", "This request is assigned to a payout agent. Unassign it first.");
      c.assignedTo && r.update(_.doc(`payoutAgents/${c.assignedTo}`), { openCount: $e.increment(-1) }), Yt.finalize(r, i, c, o, t, s), h.audit(r, t, o ? "withdraw_approved" : "withdraw_rejected", { withdrawalId: a, amount: c.amount, uid: c.uid });
    }), { ok: !0 };
  });
  Be.saveWithdrawSettings = Xe({ region: Je }, async (e) => {
    let t = h.requireRole(e, ["super", "finance"]), n = e.data || {}, a = (d, c, l, u) => {
      let m = Number(d);
      if (!Number.isFinite(m) || m < c || m > l) throw h.bad(`${u} must be between ${c} and ${l}.`);
      return h.round2(m);
    }, o = {
      enabled: n.enabled !== !1,
      min: a(n.min ?? 0, 0, 1e7, "Minimum"),
      max: a(n.max ?? 0, 0, 1e8, "Maximum"),
      feePct: a(n.feePct ?? 0, 0, 50, "Fee %"),
      feeFlat: a(n.feeFlat ?? 0, 0, 1e5, "Flat fee"),
      dailyLimit: a(n.dailyLimit ?? 0, 0, 1e8, "Daily limit"),
      dailyCount: Math.floor(a(n.dailyCount ?? 0, 0, 100, "Withdrawals per day")),
      maxPending: Math.floor(a(n.maxPending ?? 3, 1, 20, "Pending at once")),
      processingText: typeof n.processingText == "string" ? n.processingText.trim().slice(0, 80) : "",
      notice: typeof n.notice == "string" ? n.notice.trim().slice(0, 200) : ""
    };
    if (o.max > 0 && o.min > o.max) throw h.bad("Minimum cannot be bigger than maximum.");
    let s = Array.isArray(n.allowedBuckets) ? n.allowedBuckets.filter((d) => ["main", "winning", "referral", "commission"].includes(d)) : null;
    if (s) {
      if (!s.length) throw h.bad("Pick at least one wallet.");
      o.allowedBuckets = s;
    }
    let r = _.doc("settings/site"), i = (await r.get()).data() || {};
    return await r.set({ withdraw: { ...i.withdraw || {}, ...o } }, { merge: !0 }), h.audit(null, t, "withdraw_settings", o), { ok: !0, withdraw: { ...i.withdraw || {}, ...o } };
  });
});

// supa/shims/functions-firestore.js
var so = R((oc, oo) => {
  "use strict";
  oo.exports = { onDocumentCreated: (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "trigger", n;
  } };
});

// src/admin.js
var io = R((ct) => {
  "use strict";
  var { onCall: Xt } = ne(), { onDocumentCreated: Ir } = so(), U = z(), { db: ye, admin: Ze, FieldValue: _r, HttpsError: ro, REGION: kt } = U;
  ct.adminAdjustBalance = Xt({ region: kt }, async (e) => {
    let t = U.requireRole(e, ["super", "finance"]), n = e.data || {}, a = U.str(n.uid, { max: 128 }), o = U.str(n.bucket, { max: 20 });
    if (!U.BUCKETS.includes(o)) throw U.bad("Invalid wallet.");
    let s = U.amountOf(Math.abs(Number(n.delta)), { min: 0.01, max: 1e7, label: "Amount" }) * (Number(n.delta) < 0 ? -1 : 1), r = U.str(n.reason, { min: 3, max: 200, label: "Reason" });
    return await ye.runTransaction(async (i) => {
      let d = ye.doc(`users/${a}`), c = await i.get(d);
      if (!c.exists) throw new ro("not-found", "User not found.");
      if (U.round2((c.data().balances?.[o] || 0) + s) < 0) throw U.bad("Balance cannot go below zero.");
      U.applyDelta(i, d, { [o]: s }), U.ledger(i, { uid: a, type: "admin_adjust", direction: s > 0 ? "in" : "out", amount: Math.abs(s), bucket: o, note: r }), U.notify(i, a, "Balance updated", `${s > 0 ? "+" : ""}${s} (${r})`, "info"), U.audit(i, t, "balance_adjust", { uid: a, bucket: o, delta: s, reason: r });
    }), { ok: !0 };
  });
  ct.setUserStatus = Xt({ region: kt }, async (e) => {
    let t = U.requireRole(e, ["super", "support"]), n = e.data || {}, a = U.str(n.uid, { max: 128 }), o = n.banned === !0, s = typeof n.reason == "string" ? n.reason.trim().slice(0, 200) : "";
    if ((await Ze.auth().getUser(a)).customClaims?.admin) throw new ro("permission-denied", "Staff accounts cannot be banned here.");
    return await ye.doc(`users/${a}`).update({ status: o ? "banned" : "active", banReason: o ? s : "" }), await Ze.auth().updateUser(a, { disabled: o }), o && await Ze.auth().revokeRefreshTokens(a), U.audit(null, t, o ? "user_banned" : "user_unbanned", { uid: a, reason: s }), { ok: !0 };
  });
  ct.setStaffRole = Xt({ region: kt }, async (e) => {
    let t = U.requireRole(e, ["super"]), n = e.data || {}, a = await Ze.auth().getUserByEmail(U.str(n.email, { max: 200, label: "Email" })), o = n.role === null ? null : U.str(n.role, { max: 20 });
    if (o && !U.STAFF_ROLES.includes(o)) throw U.bad("Invalid role.");
    if (a.uid === t && o !== "super") throw U.bad("You cannot demote yourself.");
    await Ze.auth().setCustomUserClaims(a.uid, o ? { admin: !0, role: o } : { admin: !1, role: null }), await Ze.auth().revokeRefreshTokens(a.uid), await ye.doc(`users/${a.uid}`).set({ role: o || "user" }, { merge: !0 });
    let s = ye.doc(`payoutAgents/${a.uid}`), r = await s.get();
    if (o === "payout") {
      let i = (await ye.doc(`users/${a.uid}`).get()).data() || {};
      await s.set(r.exists ? { active: !0, name: i.name || a.displayName || "", email: a.email } : { active: !0, name: i.name || a.displayName || "", email: a.email, methods: [], floatGiven: 0, floatReturned: 0, paidTotal: 0, paidCount: 0, reviewTotal: 0, reviewCount: 0, openCount: 0, createdAt: Date.now() }, { merge: !0 });
    } else r.exists && await s.set({ active: !1 }, { merge: !0 });
    return U.audit(null, t, "staff_role", { uid: a.uid, role: o }), { ok: !0 };
  });
  ct.adminNotify = Xt({ region: kt, timeoutSeconds: 300 }, async (e) => {
    let t = U.requireRole(e, ["super", "support"]), n = e.data || {}, a = U.str(n.title, { max: 80, label: "Title" }), o = U.str(n.body, { max: 400, label: "Message" }), s = (i) => ({ ref: ye.collection("users").doc(i).collection("notifications").doc(), data: { title: a, body: o, type: "announcement", read: !1, createdAt: _r.serverTimestamp() } }), r = 0;
    if (n.uid) {
      let i = s(String(n.uid));
      await i.ref.set(i.data), r = 1;
    } else {
      let i = null;
      for (; ; ) {
        let d = ye.collection("users").where("status", "==", "active").orderBy("__name__").limit(400);
        i && (d = d.startAfter(i));
        let c = await d.get();
        if (c.empty) break;
        let l = ye.batch();
        c.docs.forEach((u) => {
          let m = s(u.id);
          l.set(m.ref, m.data);
        }), await l.commit(), r += c.size, i = c.docs[c.docs.length - 1];
      }
    }
    return U.audit(null, t, "notify", { title: a, recipients: r }), { ok: !0, recipients: r };
  });
  ct.pushOnNotification = Ir({ document: "users/{uid}/notifications/{nid}", region: kt }, async (e) => {
    let t = e.data?.data();
    if (!t) return;
    let a = (await ye.collection("users").doc(e.params.uid).collection("devices").get()).docs.map((r) => r.id);
    if (!a.length) return;
    let o = await Ze.messaging().sendEachForMulticast({ tokens: a, notification: { title: t.title, body: t.body } }), s = [];
    o.responses.forEach((r, i) => {
      !r.success && /registration-token-not-registered|invalid-registration-token/.test(r.error?.code || "") && s.push(a[i]);
    }), await Promise.all(s.map((r) => ye.doc(`users/${e.params.uid}/devices/${r}`).delete()));
  });
});

// src/math.js
var mo = R((rc, lo) => {
  "use strict";
  var co = fe("crypto"), Fn = {
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
  }, Nr = 0.99, Hn = () => co.randomInt(0, 2 ** 32) / 2 ** 32;
  function Vn(e) {
    let t = [], n = 1;
    for (let a = 0; a <= e; a++)
      t.push(n / 2 ** e), n = n * (e - a) / (a + 1);
    return t;
  }
  var $r = { low: { base: 1, spread: 4, e: 2 }, medium: { base: 0.4, spread: 30, e: 3 }, high: { base: 0.15, spread: 300, e: 4.5 } };
  function uo(e, t, n, a = 1e3) {
    let o = $r[t];
    if (!o) throw new Error("bad risk");
    let s = Vn(e), r = s.map((d, c) => o.base + Math.pow(Math.abs(c - e / 2) / (e / 2), o.e) * o.spread), i = r.reduce((d, c, l) => d + c * s[l], 0);
    return r.map((d) => Math.min(a, Math.round(d * n / i * 100) / 100));
  }
  function Rr(e, t, n, a) {
    let o = uo(e, t, n, a), s = Vn(e);
    return o.reduce((r, i, d) => r + i * s[d], 0);
  }
  function Er(e) {
    let t = [];
    for (let n = 0; n < e; n++) t.push(co.randomInt(0, 2));
    return { path: t, slot: t.reduce((n, a) => n + a, 0) };
  }
  function Pr(e) {
    let t = e.reduce((n, a) => n + a.weight, 0);
    return e.reduce((n, a) => n + a.mult * a.weight, 0) / t;
  }
  function Dr(e) {
    let t = e.reduce((a, o) => a + o.weight, 0), n = Hn() * t;
    for (let a = 0; a < e.length; a++)
      if (n -= e[a].weight, n < 0) return a;
    return e.length - 1;
  }
  function Or(e, t = 1e3) {
    let n = Hn();
    return Math.min(t, Math.max(1, Math.floor(100 * e / (1 - n)) / 100));
  }
  var Mr = (e, t) => Math.floor(Math.exp(t * e) * 100) / 100, Ur = (e, t) => Math.log(e) / t;
  function Br(e = {}) {
    let t = { ...Fn, ...e };
    for (let n of ["plinko", "wheel", "rocket"]) t[n] = { ...Fn[n], ...e[n] || {} };
    return t;
  }
  lo.exports = {
    DEFAULTS: Fn,
    MAX_RTP: Nr,
    binomProbs: Vn,
    plinkoTable: uo,
    plinkoRtp: Rr,
    plinkoDrop: Er,
    wheelRtp: Pr,
    wheelSpin: Dr,
    rocketCrashPoint: Or,
    rocketMultiplierAt: Mr,
    rocketCrashTimeMs: Ur,
    mergeConfig: Br,
    randFloat: Hn
  };
});

// src/games.js
var fo = R((Qe) => {
  "use strict";
  var { onCall: dt } = ne(), B = z(), be = mo(), { db: V, FieldValue: Kn, HttpsError: Jt, REGION: ut } = B;
  async function Zt() {
    let e = await V.doc("settings/games").get();
    return be.mergeConfig(e.exists ? e.data() : {});
  }
  function Wn(e, t, n) {
    let a = e[t];
    if (!a.enabled) throw new Jt("failed-precondition", "This game is currently disabled.");
    if (e.rtp > be.MAX_RTP) throw new Jt("failed-precondition", "Game configuration is invalid.");
    if (n < a.minBet || n > a.maxBet) throw B.bad(`Bet must be between ${a.minBet} and ${a.maxBet}.`);
  }
  function zn(e, t, n, a, o, s, r) {
    let i = B.planDebit(n.balances, o, ["main", "winning"]), d = {};
    for (let [c, l] of Object.entries(i)) d[c] = -l;
    B.applyDelta(e, t, d), B.ledger(e, { uid: a, type: "bet", direction: "out", amount: o, bucket: Object.keys(i)[0], note: s, ref: r }), B.bumpStats(e, { betVolume: o });
  }
  function Yn(e, t, n, a, o, s) {
    a <= 0 || (B.applyDelta(e, t, { winning: a }), B.ledger(e, { uid: n, type: "win", direction: "in", amount: a, bucket: "winning", note: o, ref: s }), B.bumpStats(e, { winPayout: a }));
  }
  Qe.getGameConfig = dt({ region: ut }, async (e) => {
    B.authUid(e);
    let t = await Zt(), n = {};
    for (let a of t.plinko.rows) {
      n[a] = {};
      for (let o of ["low", "medium", "high"]) n[a][o] = be.plinkoTable(a, o, t.rtp, t.plinko.maxMultiplier);
    }
    return { rtp: t.rtp, plinko: { ...t.plinko, tables: n }, wheel: t.wheel, rocket: t.rocket };
  });
  Qe.playPlinko = dt({ region: ut }, async (e) => {
    let t = B.requireVerified(e), n = e.data || {}, a = await Zt(), o = B.amountOf(n.bet, { label: "Bet" });
    Wn(a, "plinko", o);
    let s = Number(n.rows), r = String(n.risk);
    if (!a.plinko.rows.includes(s) || !["low", "medium", "high"].includes(r)) throw B.bad("Invalid Plinko settings.");
    let i = be.plinkoTable(s, r, a.rtp, a.plinko.maxMultiplier), d = be.plinkoDrop(s), c = i[d.slot], l = B.round2(o * c), u = V.collection("gameHistory").doc();
    return await V.runTransaction(async (m) => {
      let f = V.doc(`users/${t}`), g = await m.get(f);
      B.assertActive(g.data()), zn(m, f, g.data(), t, o, "plinko", u.id), Yn(m, f, t, l, "plinko", u.id), m.set(u, { uid: t, game: "plinko", bet: o, payout: l, multiplier: c, status: "settled", detail: { rows: s, risk: r, path: d.path, slot: d.slot }, at: Kn.serverTimestamp() });
    }), { path: d.path, slot: d.slot, multiplier: c, payout: l, historyId: u.id };
  });
  Qe.playWheel = dt({ region: ut }, async (e) => {
    let t = B.requireVerified(e), n = e.data || {}, a = await Zt(), o = B.amountOf(n.bet, { label: "Bet" });
    Wn(a, "wheel", o);
    let s = a.wheel.segments;
    if (!Array.isArray(s) || s.length < 2 || be.wheelRtp(s) > be.MAX_RTP) throw new Jt("failed-precondition", "Wheel configuration is invalid.");
    let r = be.wheelSpin(s), i = s[r].mult, d = B.round2(o * i), c = V.collection("gameHistory").doc();
    return await V.runTransaction(async (l) => {
      let u = V.doc(`users/${t}`), m = await l.get(u);
      B.assertActive(m.data()), zn(l, u, m.data(), t, o, "wheel", c.id), Yn(l, u, t, d, "wheel", c.id), l.set(c, { uid: t, game: "wheel", bet: o, payout: d, multiplier: i, status: "settled", detail: { segment: r, label: s[r].label }, at: Kn.serverTimestamp() });
    }), { segment: r, label: s[r].label, multiplier: i, payout: d, historyId: c.id };
  });
  Qe.rocketStart = dt({ region: ut }, async (e) => {
    let t = B.requireVerified(e), n = e.data || {}, a = await Zt(), o = B.amountOf(n.bet, { label: "Bet" });
    Wn(a, "rocket", o);
    let s = be.rocketCrashPoint(a.rtp, a.rocket.maxMultiplier), r = V.collection("rocketRounds").doc().id, i = Date.now();
    return await V.runTransaction(async (d) => {
      let c = V.doc(`users/${t}`), l = await d.get(c);
      B.assertActive(l.data()), zn(d, c, l.data(), t, o, "rocket", r), d.set(V.doc(`rocketRounds/${r}`), { uid: t, bet: o, startedAt: i, status: "running", growth: a.rocket.growth }), d.set(V.doc(`rocketSecrets/${r}`), { crash: s }), d.set(V.doc(`gameHistory/${r}`), { uid: t, game: "rocket", bet: o, payout: 0, multiplier: 0, status: "running", detail: {}, at: Kn.serverTimestamp() });
    }), { roundId: r, startedAt: i, growth: a.rocket.growth };
  });
  async function po(e, t, n) {
    return V.runTransaction(async (a) => {
      let o = V.doc(`rocketRounds/${t}`), [s, r] = await Promise.all([a.get(o), a.get(V.doc(`rocketSecrets/${t}`))]);
      if (!s.exists || s.data().uid !== e) throw new Jt("not-found", "Round not found.");
      let i = s.data(), d = r.data().crash;
      if (i.status !== "running") return { status: i.status, crash: i.status === "running" ? void 0 : d, multiplier: i.cashedAt || null, payout: i.payout || 0 };
      let c = Date.now() - i.startedAt, l = be.rocketCrashTimeMs(d, i.growth), u = V.doc(`gameHistory/${t}`);
      if (c >= l)
        return a.update(o, { status: "crashed", payout: 0 }), a.update(u, { status: "settled", detail: { crash: d } }), { status: "crashed", crash: d, payout: 0 };
      let m = be.rocketMultiplierAt(c, i.growth);
      if (!n) return { status: "running", multiplier: m };
      let f = B.round2(i.bet * m);
      return Yn(a, V.doc(`users/${e}`), e, f, "rocket", t), a.update(o, { status: "cashed", payout: f, cashedAt: m }), a.update(u, { status: "settled", payout: f, multiplier: m, detail: { crash: d } }), { status: "cashed", multiplier: m, payout: f, crash: d };
    });
  }
  Qe.rocketPoll = dt({ region: ut }, (e) => po(B.authUid(e), B.str((e.data || {}).roundId, { max: 80 }), !1));
  Qe.rocketCashout = dt({ region: ut }, (e) => po(B.requireVerified(e), B.str((e.data || {}).roundId, { max: 80 }), !0));
});

// src/engagement.js
var wo = R((It) => {
  "use strict";
  var Lr = fe("crypto"), { onCall: Qt } = ne(), D = z(), { db: K, FieldValue: Ct, HttpsError: ge, REGION: en } = D;
  It.buyLotteryTickets = Qt({ region: en }, async (e) => {
    let t = D.requireVerified(e), n = e.data || {}, a = D.str(n.lotteryId, { max: 80 }), o = Math.floor(D.amountOf(n.qty, { min: 1, max: 50, label: "Quantity" })), s = [];
    return await K.runTransaction(async (r) => {
      let i = K.doc(`lotteries/${a}`), d = K.doc(`users/${t}`), [c, l] = await Promise.all([r.get(i), r.get(d)]);
      D.assertActive(l.data());
      let u = c.data();
      if (!c.exists || u.status !== "open") throw new ge("failed-precondition", "This lottery is closed.");
      if (u.endsAt && u.endsAt.toMillis() <= Date.now()) throw new ge("failed-precondition", "This lottery has ended.");
      if ((u.sold || 0) + o > u.totalTickets) throw new ge("failed-precondition", "Not enough tickets left.");
      let m = l.data().rg?.excludedUntil;
      if ((m?.toMillis ? m.toMillis() : Number(m) || 0) > Date.now()) throw new ge("failed-precondition", "You are on a self-exclusion break.");
      if (Number(u.maxPerUser) > 0 && (await r.get(K.collection("lotteryTickets").where("lotteryId", "==", a).where("uid", "==", t).count())).data().count + o > Number(u.maxPerUser))
        throw new ge("failed-precondition", `Maximum ${u.maxPerUser} tickets per player.`);
      let f = D.round2(u.price * o), g = D.planDebit(l.data().balances, f, ["main", "winning"]), b = {};
      for (let [T, w] of Object.entries(g)) b[T] = -w;
      D.applyDelta(r, d, b), D.ledger(r, { uid: t, type: "lottery", direction: "out", amount: f, bucket: Object.keys(g)[0], note: u.title, ref: a });
      for (let T = 1; T <= o; T++) {
        let w = (u.sold || 0) + T;
        s.push(w), r.set(K.collection("lotteryTickets").doc(), { lotteryId: a, lotteryTitle: u.title, uid: t, number: w, price: u.price, status: "active", createdAt: Ct.serverTimestamp() });
      }
      r.update(i, { sold: Ct.increment(o) }), D.bumpStats(r, { lotterySales: f });
    }), { ok: !0, numbers: s };
  });
  It.adminDrawLottery = Qt({ region: en, timeoutSeconds: 120 }, async (e) => {
    let t = D.requireRole(e, ["super", "finance"]), n = D.str((e.data || {}).lotteryId, { max: 80 });
    return { ok: !0, winnerTicket: (await K.runTransaction(async (o) => {
      let s = K.doc(`lotteries/${n}`), r = await o.get(s), i = r.data();
      if (!r.exists || !["open", "closed"].includes(i.status)) throw new ge("failed-precondition", "Lottery cannot be drawn.");
      let d = await o.get(K.collection("lotteryTickets").where("lotteryId", "==", n).where("status", "==", "active"));
      if (d.empty) throw new ge("failed-precondition", "No tickets sold.");
      let c = d.docs[Lr.randomInt(0, d.size)], l = c.data(), u = D.round2(i.prize), m = K.doc(`users/${l.uid}`), f = await o.get(m);
      return D.applyDelta(o, m, { winning: u }), D.ledger(o, { uid: l.uid, type: "lottery_win", direction: "in", amount: u, bucket: "winning", note: i.title, ref: n }), D.notify(o, l.uid, "You won the lottery! \u{1F389}", `${i.title}: ${u} added to your winnings.`, "lottery"), o.update(c.ref, { status: "won" }), o.update(s, { status: "drawn", winnerUid: l.uid, winnerName: f.data().username || "", winnerTicket: l.number, drawnAt: Ct.serverTimestamp() }), D.bumpStats(o, { lotteryPayout: u }), D.audit(o, t, "lottery_drawn", { lotteryId: n, winner: l.uid, prize: u }), { winnerTicket: l.number, winnerUid: l.uid };
    })).winnerTicket };
  });
  It.adminCancelLottery = Qt({ region: en, timeoutSeconds: 300 }, async (e) => {
    let t = D.requireRole(e, ["super", "finance"]), n = D.str((e.data || {}).lotteryId, { max: 80 });
    await K.runTransaction(async (o) => {
      let s = await o.get(K.doc(`lotteries/${n}`));
      if (!s.exists || !["open", "closed"].includes(s.data().status)) throw new ge("failed-precondition", "Lottery cannot be cancelled.");
      o.update(s.ref, { status: "cancelled" });
    });
    let a = 0;
    for (; ; ) {
      let o = await K.collection("lotteryTickets").where("lotteryId", "==", n).where("status", "==", "active").limit(100).get();
      if (o.empty) break;
      let s = {};
      o.docs.forEach((r) => {
        (s[r.data().uid] ||= []).push(r);
      });
      for (let [r, i] of Object.entries(s))
        await K.runTransaction(async (d) => {
          let l = (await d.getAll(...i.map((m) => m.ref))).filter((m) => m.data().status === "active");
          if (!l.length) return;
          let u = D.round2(l.reduce((m, f) => m + f.data().price, 0));
          D.applyDelta(d, K.doc(`users/${r}`), { main: u }), D.ledger(d, { uid: r, type: "lottery_refund", direction: "in", amount: u, bucket: "main", note: "Lottery cancelled", ref: n }), D.notify(d, r, "Lottery cancelled", `${u} was refunded to your wallet.`, "lottery"), l.forEach((m) => d.update(m.ref, { status: "refunded" })), a += l.length;
        });
    }
    return D.audit(null, t, "lottery_cancelled", { lotteryId: n, refundedTickets: a }), { ok: !0, refundedTickets: a };
  });
  function ho(e, t) {
    let n = globalThis.crypto && globalThis.crypto.getRandomValues ? globalThis.crypto : fe("node:crypto").webcrypto, a = t - e + 1, o = new Uint32Array(1), s = Math.floor(4294967296 / a) * a, r;
    do
      n.getRandomValues(o), r = o[0];
    while (r >= s);
    return e + r % a;
  }
  function qr(e) {
    let t = e.reduce((a, o) => a + o.weight, 0), n = ho(1, t);
    for (let a = 0; a < e.length; a++)
      if (n -= e[a].weight, n <= 0) return a;
    return e.length - 1;
  }
  var Gr = (e) => (Array.isArray(e) ? e : []).map((t) => ({ amount: Math.round(Number(t && t.amount)), weight: Math.round(Number(t && t.weight)) })).filter((t) => t.amount > 0 && t.amount <= 1e6 && t.weight > 0 && t.weight <= 1e5).slice(0, 12), go = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 7);
  It.claimBonus = Qt({ region: en }, async (e) => {
    let t = D.requireVerified(e), n = D.str((e.data || {}).bonusId, { max: 80 }), a = { once: 1 / 0, daily: 24 * 36e5, weekly: 168 * 36e5, monthly: 0 }, o = 0, s = -1;
    return await K.runTransaction(async (r) => {
      let [i, d, c] = await Promise.all([r.get(K.doc(`bonuses/${n}`)), r.get(K.doc(`users/${t}`)), r.get(K.doc(`bonusClaims/${t}_${n}`))]);
      D.assertActive(d.data());
      let l = i.data();
      if (!i.exists || !l.enabled) throw new ge("failed-precondition", "This bonus is not available.");
      let u = l.type in a ? l.type : "once";
      if (c.exists) {
        if (u === "once") throw new ge("already-exists", "You already claimed this bonus.");
        let f = c.data().lastClaimAt && c.data().lastClaimAt.toMillis ? c.data().lastClaimAt.toMillis() : Number(c.data().lastClaimMs) || 0;
        if (u === "monthly") {
          if (go(f) === go(Date.now())) throw new ge("failed-precondition", "Already claimed this month. Available again next month.");
        } else {
          let g = f + a[u] - Date.now();
          if (g > 0) throw new ge("failed-precondition", `Available again in ${Math.ceil(g / 6e4)} min.`);
        }
      }
      let m = Gr(l.prizes);
      l.kind === "lucky" && m.length ? (s = qr(m), o = m[s].amount) : l.kind === "random" && Number(l.maxAmount) > Number(l.amount) ? o = ho(Math.max(1, Math.round(l.amount)), Math.round(l.maxAmount)) : o = D.round2(l.amount), D.applyDelta(r, d.ref, { main: o }), D.ledger(r, { uid: t, type: "bonus", direction: "in", amount: o, bucket: "main", note: l.title, ref: n }), r.set(c.ref, { uid: t, bonusId: n, lastClaimAt: Ct.serverTimestamp(), lastClaimMs: Date.now(), lastAmount: o, count: Ct.increment(1) }, { merge: !0 }), D.bumpStats(r, { bonusPaid: o });
    }), { ok: !0, amount: o, prizeIndex: s };
  });
});

// src/ads.js
var bo = R((yo) => {
  "use strict";
  var { onCall: xr } = ne(), lt = z(), { db: tn, FieldValue: nn } = lt;
  yo.adEvent = xr({ region: lt.REGION }, async (e) => {
    let t = lt.authUid(e), n = e.data || {}, a = lt.str(n.adId, { max: 80, label: "Ad" }), o = n.type === "click" ? "click" : n.type === "view" ? "view" : "";
    if (!o) throw lt.bad("Invalid event.");
    let s = await tn.doc("settings/content").get();
    if (!(s.exists && Array.isArray(s.data().ads) ? s.data().ads : []).some((i) => i && i.id === a)) throw lt.bad("Unknown ad.");
    return await tn.runTransaction(async (i) => {
      let d = tn.doc(`adSeen/${a}_${t}`), c = await i.get(d), l = c.exists ? c.data() : {}, u = { updatedAt: Date.now() };
      o === "view" ? (u.views = nn.increment(1), l.viewedAt || (u.uniqueViews = nn.increment(1))) : (u.clicks = nn.increment(1), l.clickedAt || (u.uniqueClicks = nn.increment(1))), i.set(tn.doc(`stats/ad_${a}`), u, { merge: !0 }), i.set(d, { uid: t, [o === "view" ? "viewedAt" : "clickedAt"]: Date.now() }, { merge: !0 });
    }), { ok: !0 };
  });
});

// supa/shims/functions-scheduler.js
var Xn = R((uc, Ao) => {
  "use strict";
  Ao.exports = { onSchedule: (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "schedule", n;
  } };
});

// supa/shims/firebase-admin-firestore.js
var vo = R((lc, To) => {
  "use strict";
  var { AggregateField: jr, FieldValue: Fr } = yt();
  To.exports = { AggregateField: jr, FieldValue: Fr };
});

// src/ag/errors.js
var mt = R((mc, ko) => {
  "use strict";
  var an = {
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
  }, So = (e) => an[e] || { msg: "Unknown error", en: "Something went wrong. Please try again.", bn: "\u0995\u09BF\u099B\u09C1 \u098F\u0995\u099F\u09BE \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" }, Hr = (e) => !!(an[e] && an[e].retry), Jn = class extends Error {
    constructor(t, n = "") {
      super(`${t} ${So(t).msg}${n ? ` \u2014 ${n}` : ""}`), this.code = t, this.detail = n;
    }
  };
  ko.exports = { CODES: an, info: So, isRetryable: Hr, AgError: Jn };
});

// src/ag/config.js
var sn = R((pc, _o) => {
  "use strict";
  var { db: Co } = z(), { AgError: Vr } = mt(), Kr = 30 * 1e3, on = null, Zn = 0, Io = {
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
  async function Wr({ fresh: e = !1, requireSecret: t = !0 } = {}) {
    if (!e && on && Date.now() - Zn < Kr) return on;
    let [n, a] = await Promise.all([Co.doc("adminConfig/gameApi").get(), Co.doc("adminPrivate/gameApi").get()]), o = { ...Io, ...n.exists ? n.data() : {}, secretKey: a.exists ? String(a.data().secretKey || "") : "" };
    if (o.terminalType = o.terminalType === "PC" ? "PC" : "PHONE", on = o, Zn = Date.now(), t && (!o.baseUrl || !o.merchantCode || !o.secretKey)) throw new Vr("C20001", "Game API is not configured (base URL, merchant code, secret key).");
    return o;
  }
  function zr() {
    on = null, Zn = 0;
  }
  _o.exports = { loadConfig: Wr, clearConfigCache: zr, DEFAULTS: Io };
});

// src/ag/sign.js
var ta = R((fc, Eo) => {
  "use strict";
  var Qn = fe("crypto"), rn = "HmacSHA256", Yr = {
    merchant: "x-merchant-code",
    timestamp: "x-timestamp",
    nonce: "x-nonce",
    sign: "x-sign",
    signType: "x-content-processing-type"
  };
  function No(e, t, n, a, o) {
    let s = o == null ? "" : Buffer.isBuffer(o) ? o.toString("utf8") : String(o);
    return String(e) + String(t) + String(n) + String(a) + s;
  }
  function ea(e, t, n, a, o, s = rn) {
    if (!e) throw new Error("Secret key missing");
    return Qn.createHmac("sha256", Buffer.from(String(e), "utf8")).update(Buffer.from(No(t, n, a, s, o), "utf8")).digest("hex");
  }
  function $o(e, t) {
    let n = String(e || "").toLowerCase(), a = String(t || "").toLowerCase();
    return !/^[0-9a-f]+$/.test(n) || n.length !== a.length ? !1 : Qn.timingSafeEqual(Buffer.from(n, "utf8"), Buffer.from(a, "utf8"));
  }
  function Xr(e, t, n, a, o, s, r = rn) {
    return $o(ea(e, t, n, a, o, r), s);
  }
  var Ro = () => Qn.randomBytes(16).toString("hex");
  function Jr(e, t, n) {
    let a = Date.now().toString(), o = Ro();
    return {
      "X-MERCHANT-CODE": t,
      "X-TIMESTAMP": a,
      "X-NONCE": o,
      "X-SIGN": ea(e, t, a, o, n),
      "X-CONTENT-PROCESSING-TYPE": rn
    };
  }
  function Zr(e, t) {
    if (!e) return "";
    if (typeof e.get == "function") return e.get(t) || "";
    let n = e[t] ?? e[t.toLowerCase()] ?? e[t.toUpperCase()];
    return Array.isArray(n) ? String(n[0]) : n == null ? "" : String(n);
  }
  Eo.exports = { SIGN_TYPE: rn, HEADERS: Yr, rawString: No, sign: ea, verify: Xr, safeEqualHex: $o, newNonce: Ro, signedHeaders: Jr, header: Zr };
});

// src/ag/client.js
var aa = R((gc, Uo) => {
  "use strict";
  var Qr = fe("crypto"), Le = ta(), Po = mt(), { db: ei, FieldValue: ti } = z(), na = 12e3, ni = [400, 1200, 2500], ai = 30, Do = () => "TRACE_" + Qr.randomBytes(10).toString("hex").toUpperCase(), Ae = class extends Error {
    /** kind: timeout | network | http | badjson | badsign | provider */
    constructor(t, n, a = {}) {
      super(n), this.kind = t, Object.assign(this, a);
    }
  }, Oo = (e) => e instanceof Ae && ["timeout", "network"].includes(e.kind) || e instanceof Ae && e.kind === "http" && e.status >= 500 || e instanceof Ae && e.kind === "provider" && Po.isRetryable(e.code), oi = (e) => new Promise((t) => setTimeout(t, e)), Mo = (e) => e && e.success !== !1 && (e.code === "C10000" || e.code == null && e.success === !0);
  async function si(e, t, n, a) {
    let o = { "Content-Type": "application/json", ...Le.signedHeaders(e.secretKey, e.merchantCode, n) }, s = new AbortController(), r = setTimeout(() => s.abort(), na), i, d;
    try {
      i = await a(e.baseUrl.replace(/\/+$/, "") + t, { method: "POST", headers: o, body: n, signal: s.signal }), d = await i.text();
    } catch (m) {
      throw new Ae(
        m.name === "AbortError" ? "timeout" : "network",
        m.name === "AbortError" ? `Provider timed out after ${na / 1e3}s` : `Could not reach provider: ${m.cause?.code || m.message}`
      );
    } finally {
      clearTimeout(r);
    }
    if (!i.ok) throw new Ae("http", `Provider returned HTTP ${i.status}`, { status: i.status, body: String(d).slice(0, 300) });
    let c = Le.header(i.headers, "X-SIGN"), l = e.verifyResponseSign || "auto";
    if (l !== "off" && (c || l === "strict") && !(c && Le.verify(
      e.secretKey,
      Le.header(i.headers, "X-MERCHANT-CODE") || e.merchantCode,
      Le.header(i.headers, "X-TIMESTAMP"),
      Le.header(i.headers, "X-NONCE"),
      d,
      c,
      Le.header(i.headers, "X-CONTENT-PROCESSING-TYPE") || Le.SIGN_TYPE
    )))
      throw new Ae("badsign", "Provider response signature is invalid");
    let u;
    try {
      u = JSON.parse(d);
    } catch {
      throw new Ae("badjson", "Provider returned a non-JSON response", { body: String(d).slice(0, 300) });
    }
    if (!Mo(u)) throw new Ae("provider", `${u.code || "ERROR"}: ${u.msg || Po.info(u.code).msg}`, { code: u.code || "C10001", providerMsg: u.msg });
    return u;
  }
  async function ri(e, t, n = {}, a = {}) {
    let o = a.fetchImpl || fetch, s = a.retries ?? 2, r = { reqTraceId: Do(), ...n }, i = JSON.stringify(r), d = Date.now(), c = 0, l = null, u = null;
    for (; c <= s; c++)
      try {
        u = await si(e, t, i, o), l = null;
        break;
      } catch (m) {
        if (l = m, !Oo(m) || c === s) break;
        await oi(ni[c] || 2500);
      }
    if (a.log !== !1) {
      let m = {
        endpoint: t,
        reqTraceId: r.reqTraceId,
        attempts: Math.min(c + 1, s + 1),
        ok: !l,
        code: l ? l.code || l.kind : u.code,
        message: l ? l.message : "",
        latencyMs: Date.now() - d,
        request: i.slice(0, 2e3),
        at: ti.serverTimestamp(),
        expireAt: new Date(Date.now() + ai * 864e5)
      };
      ei.collection("agApiLogs").add(m).catch(() => {
      });
    }
    if (l) throw l;
    return u;
  }
  Uo.exports = { call: ri, trace: Do, ClientError: Ae, isSuccess: Mo, transient: Oo, TIMEOUT_MS: na };
});

// src/ag/engine.js
var Yo = R((hc, zo) => {
  "use strict";
  var _t = fe("crypto"), { AgError: M } = mt(), L = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, Nt = (e) => L(Math.max(0, e)).toFixed(2), ii = /^[A-Za-z0-9_\-.]{1,128}$/, qo = 10;
  function X(e, t, n = 128) {
    let a = e[t];
    if (a == null || String(a).trim() === "") throw new M(t === "playerId" ? "G20001" : "C10002", `${t} is required`);
    let o = String(a).trim();
    if (o.length > n) throw new M("C10002", `${t} too long`);
    return o;
  }
  function cn(e, t) {
    let n = e[t];
    if (n == null || n === "") throw new M("C10002", `${t} is required`);
    if (typeof n != "number" && !/^\d+(\.\d+)?$/.test(String(n).trim())) throw new M("C10002", `${t} must be a non-negative decimal`);
    let a = Number(n);
    if (!Number.isFinite(a) || a < 0 || a > 1e12) throw new M("C10002", `${t} out of range`);
    return L(a);
  }
  function Bo(e, t, n) {
    let a = e[t];
    if (a == null || a === "") {
      if (n !== void 0) return n;
      throw new M("C10002", `${t} is required`);
    }
    let o = String(a).trim().toLowerCase();
    if (a === !0 || a === 1 || ["true", "1", "y", "yes"].includes(o)) return !0;
    if (a === !1 || a === 0 || ["false", "0", "n", "no"].includes(o)) return !1;
    throw new M("C10002", `${t} must be boolean (got ${typeof a}: ${JSON.stringify(a).slice(0, 40)})`);
  }
  function Lo(e, t) {
    let n = e[t];
    if (n == null || n === "") throw new M("C10002", `${t} is required`);
    let a = Number(n);
    if (!Number.isFinite(a) || a < 0) throw new M("C10002", `${t} must be a Unix ms timestamp`);
    return a;
  }
  function $t(e) {
    let t = X(e, "playerId");
    if (!ii.test(t)) throw new M("G20006", "playerId has an invalid format");
    return t;
  }
  function Rt(e, t) {
    let n = X(e, "currencyCode", 16);
    if (t.currencyCode && n !== t.currencyCode) throw new M("G20005", `wallet currency is ${t.currencyCode}, got ${n}`);
    return n;
  }
  function et(e) {
    let t = String(e);
    return /^[A-Za-z0-9_\-.:]{1,200}$/.test(t) && !/^\.+$/.test(t) && !t.startsWith("__") ? t : "h_" + _t.createHash("sha256").update(t).digest("hex");
  }
  function Go(e) {
    let t = Object.keys(e || {}).filter((n) => n !== "reqTraceId").sort();
    return _t.createHash("sha256").update(JSON.stringify(t.map((n) => [n, e[n]]))).digest("hex");
  }
  var qe = (e) => L((Number(e?.main) || 0) + (Number(e?.winning) || 0));
  function oa(e, t) {
    if (qe(e) + 1e-9 < t) return null;
    let n = L(t), a = {};
    for (let o of ["main", "winning"]) {
      let s = L(Math.min(Math.max(Number(e?.[o]) || 0, 0), n));
      s > 0 && (a[o] = s, n = L(n - s));
    }
    return n > 0 ? null : a;
  }
  function sa(e, t, n) {
    let { db: a, FieldValue: o } = e, s = {}, r = {}, i = o.serverTimestamp();
    return {
      delta(d, c) {
        s[d] = L((s[d] || 0) + c);
      },
      stat(d, c) {
        r[d] = L((r[d] || 0) + c);
      },
      ledger(d, c, l, u, m, f, g) {
        u > 0 && t.set(a.collection("transactions").doc(), { uid: d, type: c, direction: l, amount: L(u), bucket: m, note: f, ref: g, createdAt: i });
      },
      flush() {
        let d = {};
        for (let [l, u] of Object.entries(s)) u !== 0 && (d[`balances.${l}`] = o.increment(u));
        Object.keys(d).length && t.update(n, d);
        let c = {};
        for (let [l, u] of Object.entries(r)) u !== 0 && (c[l] = o.increment(u));
        Object.keys(c).length && t.set(a.doc(`statsShards/ag_${_t.randomInt(0, qo)}`), c, { merge: !0 });
      },
      after(d) {
        let c = { ...d || {} };
        for (let [l, u] of Object.entries(s)) c[l] = L((Number(c[l]) || 0) + u);
        return c;
      }
    };
  }
  function xo(e) {
    return "MB" + _t.createHash("sha1").update(String(e) + _t.randomBytes(4).toString("hex")).digest("hex").slice(0, 18).toUpperCase();
  }
  function jo(e, t, n) {
    if (e.status !== "active") throw new M("G30001", `account is ${e.status}`);
    let a = e.rg?.excludedUntil;
    if ((a?.toMillis ? a.toMillis() : Number(a) || 0) > n) throw new M("G30001", "player is self-excluded");
    if (t && t.status === "forced") throw new M("G30001", "session was force-logged-out");
  }
  async function ra(e, t, n, a, o) {
    let { db: s, FieldValue: r } = e, i = Go(n);
    return s.runTransaction(async (d) => {
      let c = s.doc(`agTransactions/${t}`), l = await d.get(c);
      if (l.exists) {
        let f = l.data();
        if (f.requestHash !== i) throw new M("G300016", `transactionId already used with a different payload (${t})`);
        return { data: f.response, replay: !0 };
      }
      let { data: u, record: m } = await o(d);
      return d.set(c, { ...a, ...m, requestHash: i, response: u, createdAt: r.serverTimestamp(), at: e.now }), { data: u, replay: !1 };
    });
  }
  async function Fo(e, t) {
    let n = $t(t);
    Rt(t, e.cfg);
    let a = await e.db.doc(`users/${n}`).get();
    if (!a.exists) throw new M("G20006", n);
    return { balance: Nt(qe(a.data().balances)) };
  }
  async function Ho(e, t) {
    let n = $t(t);
    Rt(t, e.cfg);
    let a = await e.db.doc(`users/${n}`).get();
    if (!a.exists) throw new M("G20006", n);
    let o = a.data(), s = String(e.cfg.siteUrl || "").replace(/\/+$/, ""), r = /^https:\/\//.test(o.photoURL || "") ? o.photoURL : e.cfg.defaultAvatarUrl || (s ? `${s}/icons/icon-192.png` : "");
    return { nickName: String(o.username || o.name || "Player").slice(0, 32), avatarUrl: r };
  }
  async function Vo(e, t) {
    let n = $t(t), a = Rt(t, e.cfg), o = X(t, "gameCode"), s = X(t, "roundId"), r = X(t, "betId"), i = X(t, "transactionId"), d = cn(t, "betAmount"), c = X(t, "timestamp", 40), { db: l } = e;
    return ra(e, `bet_${et(i)}`, t, { kind: "bet", transactionId: i, betId: r, roundId: s, gameCode: o, playerId: n, uid: n, currencyCode: a, betAmount: d, providerTime: c }, async (u) => {
      let m = l.doc(`users/${n}`), f = l.doc(`agBets/${et(r)}`), g = l.doc(`agSessions/${n}`), [b, T, w] = await Promise.all([u.get(m), u.get(f), u.get(g)]);
      if (!b.exists) throw new M("G20006", n);
      let C = b.data();
      jo(C, w.exists ? w.data() : null, e.now);
      let v = T.exists ? T.data() : null;
      if (v && v.status === "cancelled") throw new M("C10002", `bet ${r} was already cancelled`);
      if (v && v.uid !== n) throw new M("C10002", `bet ${r} belongs to another player`);
      let p = oa(C.balances, d);
      if (!p) throw new M("G30003", `needs ${d}, has ${qe(C.balances)}`);
      let A = sa(e, u, m);
      for (let [P, H] of Object.entries(p)) A.delta(P, -H);
      A.ledger(n, "game_bet", "out", d, Object.keys(p)[0] || "main", o, r), A.stat("agBetVolume", d), A.stat("agBetCount", 1);
      let y = v?.merchantBetId || xo(r), O = v?.debitPlan || {};
      u.set(f, {
        betId: r,
        merchantBetId: y,
        uid: n,
        playerId: n,
        gameCode: o,
        roundId: s,
        currencyCode: a,
        betAmount: L((v?.betAmount || 0) + d),
        debitPlan: { main: L((O.main || 0) + (p.main || 0)), winning: L((O.winning || 0) + (p.winning || 0)) },
        winAmount: v?.winAmount || 0,
        winReversed: v?.winReversed || 0,
        betRefunded: !1,
        status: v?.status === "settled" ? "settled" : "placed",
        isFree: !1,
        createdAt: v?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: v?.at || e.now
      }, { merge: !0 }), A.flush();
      let $ = { merchantBetId: y, balance: Nt(qe(A.after(C.balances))) };
      return { data: $, record: { merchantBetId: y, balanceAfter: $.balance, debitPlan: p } };
    });
  }
  async function Ko(e, t) {
    let n = $t(t), a = Rt(t, e.cfg), o = X(t, "gameCode"), s = X(t, "roundId"), r = X(t, "betId"), i = X(t, "transactionId"), d = cn(t, "betAmount"), c = cn(t, "winAmount"), l = Bo(t, "isFree", !1), u = Bo(t, "isEnd"), m = Lo(t, "betTime"), f = Lo(t, "settledTime"), g = X(t, "type", 16);
    if (!["win", "bet_win"].includes(g)) throw new M("C10002", "type must be win or bet_win");
    let { db: b } = e;
    return ra(e, `win_${et(i)}`, t, { kind: "win", type: g, transactionId: i, betId: r, roundId: s, gameCode: o, playerId: n, uid: n, currencyCode: a, betAmount: d, winAmount: c, isFree: l, isEnd: u, betTime: m, settledTime: f }, async (T) => {
      let w = b.doc(`users/${n}`), C = b.doc(`agBets/${et(r)}`), v = b.doc(`agSessions/${n}`), [p, A, y] = await Promise.all([T.get(w), T.get(C), T.get(v)]);
      if (!p.exists) throw new M("G20006", n);
      let O = p.data(), $ = A.exists ? A.data() : null;
      if ($ && $.uid !== n) throw new M("C10002", `bet ${r} belongs to another player`);
      if ($ && $.status === "cancelled") throw new M("C10002", `bet ${r} was cancelled`);
      let P = sa(e, T, w), H = {}, pe = g === "bet_win" && !l && d > 0;
      if (pe) {
        if (jo(O, y.exists ? y.data() : null, e.now), H = oa(O.balances, d), !H) throw new M("G30003", `needs ${d}, has ${qe(O.balances)}`);
        for (let [Mt, Ut] of Object.entries(H)) P.delta(Mt, -Ut);
        P.ledger(n, "game_bet", "out", d, Object.keys(H)[0] || "main", o, r), P.stat("agBetVolume", d), P.stat("agBetCount", 1);
      }
      c > 0 && (P.delta("winning", c), P.ledger(n, "game_win", "in", c, "winning", o + (l ? " (free spin)" : ""), r), P.stat("agWinPayout", c)), !$ && g === "win" && P.stat("agOrphanWins", 1);
      let j = $?.merchantBetId || xo(r), ce = $?.debitPlan || {};
      T.set(C, {
        betId: r,
        merchantBetId: j,
        uid: n,
        playerId: n,
        gameCode: o,
        roundId: s,
        currencyCode: a,
        betAmount: L(($?.betAmount || 0) + (pe ? d : 0)),
        declaredBetAmount: d,
        debitPlan: { main: L((ce.main || 0) + (H.main || 0)), winning: L((ce.winning || 0) + (H.winning || 0)) },
        winAmount: L(($?.winAmount || 0) + c),
        winReversed: $?.winReversed || 0,
        betRefunded: $?.betRefunded || !1,
        isFree: l,
        isEnd: u,
        status: u ? "settled" : $?.status || "placed",
        betTime: m,
        settledTime: u ? f : $?.settledTime || null,
        createdAt: $?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: $?.at || e.now
      }, { merge: !0 }), P.flush();
      let je = { merchantBetId: j, balance: Nt(qe(P.after(O.balances))) };
      return { data: je, record: { merchantBetId: j, balanceAfter: je.balance, debitPlan: H } };
    });
  }
  async function Wo(e, t) {
    let n = $t(t), a = Rt(t, e.cfg), o = X(t, "gameCode"), s = X(t, "betId"), r = X(t, "merchantBetId"), i = cn(t, "betAmount"), d = X(t, "cancelType", 8).toUpperCase(), c = X(t, "transactionId");
    if (!["BET", "WIN"].includes(d)) throw new M("C10002", "cancelType must be BET or WIN");
    let { db: l } = e;
    return ra(e, `cancel_${et(c)}`, t, { kind: "cancel", cancelType: d, transactionId: c, betId: s, gameCode: o, playerId: n, uid: n, currencyCode: a, betAmount: i, merchantBetId: r }, async (u) => {
      let m = l.doc(`users/${n}`), f = l.doc(`agBets/${et(s)}`), [g, b] = await Promise.all([u.get(m), u.get(f)]);
      if (!g.exists) throw new M("G20006", n);
      let T = g.data(), w = sa(e, u, m), C = b.exists ? b.data() : null;
      if (C && C.uid !== n) throw new M("C10002", `bet ${s} belongs to another player`);
      let v = 0, p = 0, A = "", y = e.FieldValue.serverTimestamp();
      if (!C)
        u.set(f, {
          betId: s,
          merchantBetId: r,
          uid: n,
          playerId: n,
          gameCode: o,
          currencyCode: a,
          betAmount: 0,
          debitPlan: {},
          winAmount: 0,
          winReversed: 0,
          betRefunded: d === "BET",
          status: d === "BET" ? "cancelled" : "placed",
          cancelledBeforeBet: !0,
          createdAt: y,
          updatedAt: y,
          at: e.now
        }), A = "no matching bet; tombstone stored";
      else if (d === "BET") {
        if (C.betRefunded)
          A = "bet already refunded";
        else {
          let P = C.debitPlan || {};
          for (let H of ["main", "winning"]) P[H] > 0 && w.delta(H, P[H]);
          v = L((P.main || 0) + (P.winning || 0)), w.ledger(n, "game_refund", "in", v, "main", `${o} bet cancelled`, s), w.stat("agBetVolume", -v), w.stat("agCancelCount", 1), Math.abs(v - i) > 1e-3 && (A = `refunded the ${v} actually debited (request said ${i})`);
        }
        u.set(f, { status: "cancelled", betRefunded: !0, cancelledAt: y, updatedAt: y }, { merge: !0 });
      } else {
        let P = L((C.winAmount || 0) - (C.winReversed || 0));
        if (P > 0) {
          let H = T.balances || {}, pe = L(Math.min(Math.max(Number(H.winning) || 0, 0), P)), j = L(Math.min(Math.max(Number(H.main) || 0, 0), L(P - pe))), ce = L(P - pe - j);
          pe + ce > 0 && w.delta("winning", -(pe + ce)), j > 0 && w.delta("main", -j), p = P, w.ledger(n, "game_win_reversal", "out", p, "winning", `${o} win cancelled`, s), w.stat("agWinPayout", -p), w.stat("agCancelCount", 1), ce > 0 && (A = `player balance short by ${ce}; recorded as negative winning balance`, w.stat("agDebt", ce));
        } else A = "nothing to reverse";
        u.set(f, { winReversed: L((C.winReversed || 0) + p), winCancelledAt: y, updatedAt: y }, { merge: !0 });
      }
      w.flush();
      let $ = { merchantBetId: C?.merchantBetId || r, betId: s, balance: Nt(qe(w.after(T.balances))), currencyCode: a };
      return { data: $, record: { refunded: v, reversed: p, note: A, balanceAfter: $.balance } };
    });
  }
  var ci = {
    "/wallet/balance": (e, t) => Fo(e, t),
    "/player/info": (e, t) => Ho(e, t),
    "/wallet/bet": async (e, t) => (await Vo(e, t)).data,
    "/wallet/win": async (e, t) => (await Ko(e, t)).data,
    "/wallet/cancel": async (e, t) => (await Wo(e, t)).data
  };
  zo.exports = { ROUTES: ci, STAT_SHARDS: qo, balance: Fo, playerInfo: Ho, bet: Vo, win: Ko, cancel: Wo, planDebit: oa, safeId: et, requestHash: Go, playable: qe, round2: L, money: Nt };
});

// src/ag/callbacks.js
var Qo = R((wc, Zo) => {
  "use strict";
  var di = fe("crypto"), Re = ta(), ae = mt(), { ROUTES: Xo, requestHash: ui } = Yo(), li = 24 * 36e5, mi = 90;
  function dn(e, t = null, n) {
    return { success: e === "C10000", code: e, msg: n || ae.info(e).msg, data: e === "C10000" ? t : null };
  }
  function Jo(e) {
    let t = String(e || "").split("?")[0].replace(/\/+$/, "");
    return Object.keys(Xo).find((n) => t === n || t.endsWith(n)) || null;
  }
  function pi(e, t) {
    let n = Re.header(e, "x-forwarded-for");
    return (n ? n.split(",")[0] : t || "").trim();
  }
  var ia = vn(), fi = (e, t) => ia.run(() => gi(e, t));
  async function gi(e, t) {
    let n = Date.now(), a = Jo(t.path), o = Buffer.isBuffer(t.rawBody) ? t.rawBody.toString("utf8") : String(t.rawBody ?? ""), s = null, r, i = "";
    try {
      if (t.method !== "POST") throw new ae.AgError("C10003", "POST required");
      if (!a) throw new ae.AgError("C10002", `unknown endpoint ${t.path}`);
      let m = t.headers || {}, f = Re.header(m, "X-MERCHANT-CODE"), g = Re.header(m, "X-TIMESTAMP"), b = Re.header(m, "X-NONCE"), T = Re.header(m, "X-SIGN"), w = Re.header(m, "X-CONTENT-PROCESSING-TYPE");
      if (!f || !g || !b || !T || !w) throw new ae.AgError("C10003", "missing signature headers");
      if (b.length > 64 || T.length > 256) throw new ae.AgError("C10003", "header too long");
      if (!e.cfg.merchantCode || !e.cfg.secretKey) throw new ae.AgError("C20001", "merchant not configured on our side");
      if (f !== e.cfg.merchantCode) throw new ae.AgError("C20001", `unknown merchant ${f}`);
      if (w !== Re.SIGN_TYPE) throw new ae.AgError("C10003", `unsupported signType ${w}`);
      let C = Number(g), v = (Number(e.cfg.timestampToleranceSec) || 300) * 1e3;
      if (!/^\d{10,16}$/.test(g) || !Number.isFinite(C) || Math.abs(e.now - C) > v) throw new ae.AgError("C10003", "timestamp outside allowed window");
      if (!Re.verify(e.cfg.secretKey, f, g, b, o, T, w)) throw new ae.AgError("C10004");
      let p = Array.isArray(e.cfg.callbackIpWhitelist) ? e.cfg.callbackIpWhitelist.filter(Boolean) : [];
      if (p.length && !p.includes(t.ip)) throw new ae.AgError("C10003", `IP ${t.ip} not allowed`);
      try {
        s = JSON.parse(o || "{}");
      } catch {
        throw new ae.AgError("C10002", "body is not valid JSON");
      }
      if (!s || typeof s != "object" || Array.isArray(s)) throw new ae.AgError("C10002", "body must be a JSON object");
      let A = e.db.doc(`agNonces/${di.createHash("sha256").update(f + ":" + b).digest("hex")}`), y = ui(s);
      try {
        await A.create({ route: a, bodyHash: y, at: e.now, expireAt: new Date(e.now + li) });
      } catch ($) {
        if (!($.code === 6 || /ALREADY_EXISTS/i.test(String($.message || $)))) throw $;
        let P = await A.get();
        if (!P.exists || P.data().bodyHash !== y) throw new ae.AgError("C10003", "nonce already used (replay)");
        i = "identical retry (same nonce + payload)";
      }
      let O = await Xo[a](e, s);
      r = dn("C10000", O);
    } catch (m) {
      m instanceof ae.AgError ? (r = dn(m.code), i = m.detail || i) : (r = dn("C10001"), i = String(m && m.stack || m).slice(0, 500));
    }
    ia.mark("done");
    let d = ia.summary();
    d && Date.now() - n > 1500 && (i = (i ? i + " | " : "") + "timing " + d);
    let c = JSON.stringify(r), l = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
    e.cfg.secretKey && e.cfg.merchantCode && Object.assign(l, Re.signedHeaders(e.cfg.secretKey, e.cfg.merchantCode, c));
    let u = {
      route: a || String(t.path || "").slice(0, 100),
      code: r.code,
      ok: r.code === "C10000",
      detail: i,
      playerId: s?.playerId || "",
      transactionId: s?.transactionId || "",
      betId: s?.betId || "",
      reqTraceId: s?.reqTraceId || "",
      ip: t.ip || "",
      latencyMs: Date.now() - n,
      request: o.slice(0, 2e3),
      response: c.slice(0, 1e3),
      at: e.now,
      expireAt: new Date(e.now + mi * 864e5)
    };
    return { status: t.method === "POST" ? 200 : 405, headers: l, body: c, log: u };
  }
  Zo.exports = { handle: fi, wrap: dn, routeOf: Jo, clientIp: pi };
});

// src/ag/platform.js
var ua = R((J) => {
  "use strict";
  var ts = fe("net"), { onCall: Te, onRequest: hi, HttpsError: Ge } = ne(), { onSchedule: ns } = Xn(), { AggregateField: pt } = vo(), S = z(), { db: I, admin: wi, FieldValue: W, REGION: re } = S, ft = mt(), { loadConfig: Ee, clearConfigCache: yi, DEFAULTS: as } = sn(), oe = aa(), es = Qo(), bi = ["slots", "live", "sports", "fishing", "lottery", "cards", "crash"], Ai = (e = "", t = "", n = "") => {
    let a = `${e} ${t} ${n}`.toUpperCase();
    return /LIVE|BACCARAT|ROULETTE/.test(a) ? "live" : /SPORT/.test(a) ? "sports" : /FISH/.test(a) ? "fishing" : /LOTT|KENO|BINGO/.test(a) ? "lottery" : /CARD|POKER|RUMMY|TEEN|ANDAR|TABLE/.test(a) ? "cards" : /CRASH|AVIATOR|ROCKET/.test(a) ? "crash" : "slots";
  }, ca = (e) => String(e).replace(/[\/\s]/g, "_").slice(0, 400), Ti = ["BR_BRL", "GB_GBP", "DK_DKK", "DE_EUR", "ES_EUR", "FI_EUR", "FR_EUR", "ID_IDR", "IT_EUR", "NL_EUR", "NO_NOK", "PL_PLN", "PT_EUR", "TH_THB", "TR_TRY", "VN_VND", "MM_MMK", "SG_SGD", "NG_NGN", "US_USD", "PK_PKR", "CO_COP", "PH_PHP", "MX_MXN", "AR_ARS", "KE_KES", "CL_CLP", "ZA_ZAR", "BD_BDT", "IN_INR", "LK_LKR"], os = ["en", "ar", "az", "bg", "bn", "cs", "da", "de", "el", "en-stkus", "es", "et", "fa", "fi", "fr", "hi", "hu", "hy", "id", "it", "ja", "ko", "lo", "lt", "mn", "my", "ms", "nl", "no", "pl", "pt", "pt-br", "ro", "ru", "sh", "si", "sk", "sq", "sv", "th", "tr", "uk", "ur", "uz", "vi"];
  function da(e, t = "Game service error") {
    if (e instanceof Ge) return e;
    if (e instanceof ft.AgError || e instanceof oe.ClientError && e.kind === "provider") {
      let n = e.code || "C10001", a = ft.info(n);
      return new Ge("failed-precondition", a.en, { agCode: n, bn: a.bn, providerMsg: e.providerMsg || e.detail || "", retry: ft.isRetryable(n) });
    }
    if (e instanceof oe.ClientError) {
      let n = {
        timeout: "The game provider did not respond in time. Please try again.",
        network: "Could not reach the game provider. Please try again.",
        http: `The game provider returned an error (HTTP ${e.status}).`,
        badjson: "The game provider sent an invalid response.",
        badsign: "The game provider response failed the security check."
      }[e.kind] || t;
      return new Ge("unavailable", n, { kind: e.kind, status: e.status || null, retry: ["timeout", "network", "http"].includes(e.kind) });
    }
    return console.error(e), new Ge("internal", t);
  }
  var Ne = (e) => async (t) => {
    try {
      return await e(t);
    } catch (n) {
      throw da(n);
    }
  }, vi = (e) => {
    let n = String(e.rawRequest?.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || String(e.rawRequest?.ip || "").replace(/^::ffff:/, "");
    return ts.isIP(n) ? n : "";
  }, tt = (e, t, n, a) => {
    let o = Number(e);
    if (!Number.isInteger(o) || o < t || o > n) throw S.bad(`${a} must be a whole number ${t}-${n}.`);
    return o;
  }, ln = (e, t) => {
    let n = S.str(e, { max: 40, label: t }), a = Date.parse(n);
    if (!Number.isFinite(a)) throw S.bad(`${t} must be an ISO-8601 date/time.`);
    return { s: new Date(a).toISOString(), ms: a };
  }, un = /^[A-Za-z0-9-]{1,50}$/, Et = /^[A-Za-z0-9_\-.]{1,128}$/;
  J.agCallback = hi({ region: re, timeoutSeconds: 30, memory: "256MiB", minInstances: 0, concurrency: 80, invoker: "public" }, async (e, t) => {
    let n;
    try {
      n = await Ee({ requireSecret: !1 });
    } catch {
      n = { ...as };
    }
    let a = await es.handle({ db: I, FieldValue: W, cfg: n, now: Date.now() }, {
      method: e.method,
      path: e.path || e.url,
      headers: e.headers,
      rawBody: e.rawBody || Buffer.from(""),
      ip: es.clientIp(e.headers, e.ip)
    });
    I.collection("agCallbackLogs").add({ ...a.log, at: W.serverTimestamp(), atMs: a.log.at }).catch((o) => console.error("log", o.message)), a.log.code === "C10001" && console.error("agCallback internal error", a.log.detail), t.status(a.status).set(a.headers).send(a.body);
  });
  J.adminSaveGameApiConfig = Te({ region: re }, Ne(async (e) => {
    let t = S.requireRole(e, ["super"]), n = e.data || {}, a = S.str(n.baseUrl, { max: 200, label: "Base URL", pattern: /^https:\/\/[^\s]+$/ }).replace(/\/+$/, ""), o = S.str(n.currencyCode || "BD_BDT", { max: 20, label: "Currency" });
    if (!Ti.includes(o)) throw S.bad("Unsupported currency code (see PDF \xA72.7).");
    let s = S.str(n.lang || "bn", { max: 10, label: "Language" });
    if (!os.includes(s)) throw S.bad("Unsupported language (see PDF \xA72.8).");
    let r = S.str(n.subMerchantCode || "site", { max: 50, label: "Sub-merchant code", pattern: un }), i = n.siteUrl ? S.str(n.siteUrl, { max: 200, label: "Site URL", pattern: /^https:\/\/[^\s/]+(\/[^\s]*)?$/ }).replace(/\/+$/, "") : "", d = (Array.isArray(n.callbackIpWhitelist) ? n.callbackIpWhitelist : String(n.callbackIpWhitelist || "").split(/[\s,]+/)).map((u) => String(u).trim()).filter(Boolean);
    if (d.some((u) => !ts.isIP(u))) throw S.bad("IP allow-list contains an invalid IP address.");
    let c = {
      baseUrl: a,
      merchantCode: S.str(n.merchantCode, { max: 64, label: "Merchant code" }),
      currencyCode: o,
      lang: s,
      subMerchantCode: r,
      siteUrl: i,
      terminalType: n.terminalType === "PC" ? "PC" : "PHONE",
      env: n.env === "prod" ? "prod" : "staging",
      verifyResponseSign: ["auto", "strict", "off"].includes(n.verifyResponseSign) ? n.verifyResponseSign : "auto",
      timestampToleranceSec: tt(n.timestampToleranceSec ?? 300, 30, 900, "Timestamp tolerance"),
      callbackIpWhitelist: d.slice(0, 50),
      categoryMap: typeof n.categoryMap == "object" && n.categoryMap ? n.categoryMap : {},
      updatedAt: W.serverTimestamp(),
      updatedBy: t
    };
    await I.doc("adminConfig/gameApi").set(c, { merge: !0 });
    let l = typeof n.secretKey == "string" && n.secretKey.trim().length > 0;
    return l && await I.doc("adminPrivate/gameApi").set({ secretKey: n.secretKey.trim(), rotatedAt: W.serverTimestamp() }), await I.doc("adminConfig/gameApiStatus").set({ ok: !1, testedAt: null, message: "Configuration changed \u2014 run the connection test." }), yi(), S.audit(null, t, "game_api_config", { baseUrl: a, merchantCode: c.merchantCode, env: c.env, secretChanged: l }), { ok: !0 };
  }));
  J.adminGetGameApiConfig = Te({ region: re }, Ne(async (e) => {
    S.requireRole(e, ["super"]);
    let [t, n, a, o] = await Promise.all([I.doc("adminConfig/gameApi").get(), I.doc("adminPrivate/gameApi").get(), I.doc("adminConfig/gameApiStatus").get(), I.doc("adminConfig/agMerchant").get()]), s = String((globalThis.__ENV || process.env).SUPABASE_URL || "").replace(/\/+$/, ""), r = { ...as, ...t.exists ? t.data() : {} };
    return delete r.updatedAt, {
      config: r,
      secretSet: n.exists && !!n.data().secretKey,
      status: a.exists ? { ...a.data(), testedAt: a.data().testedAt?.toMillis?.() || null } : null,
      merchant: o.exists ? { ...o.data(), syncedAt: o.data().syncedAt?.toMillis?.() || null } : null,
      callbackUrls: [s ? `${s}/functions/v1/api/agw` : null].filter(Boolean)
    };
  }));
  J.adminTestGameApi = Te({ region: re, timeoutSeconds: 60 }, async (e) => {
    S.requireRole(e, ["super"]);
    let t = Date.now(), n;
    try {
      let a = await Ee({ fresh: !0 }), s = ((await oe.call(a, "/game/v5/providers", {}, { retries: 0 })).data?.providers || []).length;
      n = { ok: !0, latencyMs: Date.now() - t, message: `Connected \u2014 ${s} provider(s) returned.`, providerCount: s };
    } catch (a) {
      let o = da(a);
      n = { ok: !1, latencyMs: Date.now() - t, message: a.message || o.message, agCode: o.details?.agCode || null, kind: a.kind || o.details?.kind || "config", httpStatus: a.status || null };
    }
    return await I.doc("adminConfig/gameApiStatus").set({ ...n, testedAt: W.serverTimestamp() }), n;
  });
  J.adminSyncGames = Te({ region: re, timeoutSeconds: 540, memory: "512MiB" }, Ne(async (e) => {
    let t = S.requireRole(e, ["super", "content"]), n = await Ee({ fresh: !0 }), o = ((await oe.call(n, "/game/v5/providers", {})).data?.providers || []).map((l) => typeof l == "string" ? { name: l, code: l } : l);
    await I.doc("adminConfig/agProviders").set({ providers: o, syncedAt: W.serverTimestamp() });
    let s = (await oe.call(n, "/game/v5/categories", { currencyCode: n.currencyCode, lang: n.lang })).data?.categoryDataList || [], r = 0, i = [], d = /* @__PURE__ */ new Set();
    for (let l of s) {
      let u = l.categoryCode || l.code;
      if (!u) continue;
      let m = (n.categoryMap || {})[u] || Ai(u, l.categoryName), f = 0;
      for (let g = 1; g <= 200; g++) {
        let b = await oe.call(n, "/game/v5/games", { categoryCode: u, currencyCode: n.currencyCode, lang: n.lang, pageIndex: g }), T = b.data?.gameItemList || b.data?.gameltemList || [];
        if (!T.length) break;
        let w = I.batch();
        for (let v of T) {
          let p = v.gameCode;
          if (!p) continue;
          let A = Number.isInteger(Number(v.status)) ? Number(v.status) : 1;
          w.set(I.doc(`games/${ca(p)}`), {
            gameCode: String(p),
            name: v.gameName || v.name || String(p),
            gameType: v.gameType || "",
            status: A,
            imageUrl: v.imageUrl || v.gameIcon || v.iconUrl || "",
            provider: v.providerCode || v.provider || "",
            categoryCode: u,
            categoryName: l.categoryName || u,
            lobbyCategory: m,
            syncedAt: W.serverTimestamp()
          }, { merge: !0 }), d.add(String(p)), r++, f++;
        }
        await w.commit();
        let C = Number(b.data?.totalSize) || 0;
        if (C && f >= C) break;
      }
      i.push({ code: u, name: l.categoryName || u, lobby: m, count: f });
    }
    let c = I.batch();
    return i.forEach((l) => c.set(I.doc(`gameCategories/${ca(l.code)}`), { ...l, syncedAt: W.serverTimestamp() }, { merge: !0 })), await c.commit(), S.audit(null, t, "games_synced", { providers: o.length, categories: i.length, games: r, unique: d.size }), { ok: !0, providers: o.length, categories: i.length, games: d.size };
  }));
  function Si(e, t) {
    let n = String(e.rawRequest?.headers?.origin || "").replace(/\/+$/, ""), a = [t.siteUrl, String((globalThis.__ENV || process.env).SITE_URL || "").replace(/\/+$/, "")].filter(Boolean);
    if (n && (a.includes(n) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(n))) return n;
    if (t.siteUrl) return t.siteUrl;
    throw new Ge("failed-precondition", "Set the Site URL in Admin \u2192 Game API (needed for the game exit page).");
  }
  J.launchGame = Te({ region: re, timeoutSeconds: 30 }, Ne(async (e) => {
    let t = S.requireVerified(e), n = e.data || {}, a = S.str(n.gameCode, { max: 120, label: "Game" }), [o, s, r] = await Promise.all([I.doc(`games/${ca(a)}`).get(), I.doc(`users/${t}`).get(), Ee()]), i = s.data();
    S.assertActive(i);
    let d = i.rg?.excludedUntil;
    if ((d?.toMillis ? d.toMillis() : Number(d) || 0) > Date.now()) throw new Ge("failed-precondition", "You are on a self-exclusion break. Games are unavailable until it ends.");
    if (!o.exists || o.data().enabled === !1) throw new ft.AgError("G20002");
    if (o.data().status === 0) throw new ft.AgError("G20003");
    if (o.data().status === 2) throw new ft.AgError("G20010");
    let c = vi(e);
    if (!c) throw new Ge("failed-precondition", "Could not determine your IP address.");
    let l = n.terminalType === "PC" ? "PC" : n.terminalType === "PHONE" ? "PHONE" : r.terminalType, u = Si(e, r), m = {
      gameCode: o.data().gameCode,
      playerId: t,
      currencyCode: r.currencyCode,
      language: os.includes(n.language) ? n.language : r.lang,
      terminalType: l,
      returnUrl: `${u}/exitGame.html?game=${encodeURIComponent(o.data().gameCode)}`,
      ipAddress: c,
      subMerchantCode: r.subMerchantCode || "site",
      nickName: String(i.username || i.name || "Player").slice(0, 32)
    };
    /^https:\/\//.test(i.photoURL || "") && (m.avatarUrl = i.photoURL);
    let f = await oe.call(r, "/game/v5/game/url", m), g = f.data?.gameUrl || f.data?.url;
    if (!g || !/^https?:\/\//.test(g)) throw new Ge("unavailable", "The game provider did not return a game URL.");
    return await I.doc(`agSessions/${t}`).set({
      uid: t,
      status: "active",
      gameCode: o.data().gameCode,
      gameName: o.data().name || "",
      terminalType: l,
      ip: c,
      expireTime: f.data?.expireTime || null,
      launchedAt: W.serverTimestamp(),
      launchedAtMs: Date.now(),
      closedAt: null,
      forcedAt: null
    }, { merge: !0 }), await I.collection("gameHistory").add({ uid: t, game: o.data().gameCode, provider: "ag", status: "launched", at: W.serverTimestamp() }), { gameUrl: g, gameCode: o.data().gameCode, gameName: o.data().name || "", expireTime: f.data?.expireTime || null };
  }));
  J.agExitGame = Te({ region: re }, Ne(async (e) => {
    let t = S.authUid(e), n = I.doc(`agSessions/${t}`);
    return await I.runTransaction(async (a) => {
      let o = await a.get(n);
      o.exists && o.data().status === "active" && a.update(n, { status: "closed", closedAt: W.serverTimestamp() });
    }), { ok: !0 };
  }));
  async function ss(e, t, n, { revokeTokens: a = !1, reason: o = "" } = {}) {
    let s = "SKIPPED", r = "";
    try {
      let i = await oe.call(e, "/game/v5/player/force/logout", { playerId: t });
      s = i.data?.logoutStatus || "SUCCESS", r = i.data?.message || "";
    } catch (i) {
      s = "FAILED", r = da(i).message;
    }
    return await I.doc(`agSessions/${t}`).set({ uid: t, status: "forced", forcedAt: W.serverTimestamp(), forcedBy: n, forceReason: o, providerLogout: s }, { merge: !0 }), a && (await wi.auth().revokeRefreshTokens(t), await I.doc(`users/${t}`).set({ sessionsRevokedAt: W.serverTimestamp() }, { merge: !0 })), await I.collection("users").doc(t).collection("notifications").add({
      title: "Signed out of games",
      body: o || "Your game session was ended by support.",
      type: "security",
      read: !1,
      createdAt: W.serverTimestamp()
    }), { playerId: t, logoutStatus: s, message: r };
  }
  J.adminForceLogout = Te({ region: re, timeoutSeconds: 300 }, Ne(async (e) => {
    let t = S.requireRole(e, ["super", "support"]), n = e.data || {}, a = await Ee(), o = typeof n.reason == "string" ? n.reason.trim().slice(0, 200) : "", s = [];
    n.all === !0 ? s = (await I.collection("agSessions").where("status", "==", "active").limit(200).get()).docs.map((d) => d.id) : s = [S.str(n.uid, { max: 128, label: "Player", pattern: Et })];
    let r = [];
    for (let i of s) r.push(await ss(a, i, t, { revokeTokens: n.revokeTokens === !0, reason: o }));
    return S.audit(null, t, "ag_force_logout", { count: r.length, all: n.all === !0, revokeTokens: n.revokeTokens === !0, failed: r.filter((i) => i.logoutStatus === "FAILED").length }), { ok: !0, results: r };
  }));
  J.forceLogoutOne = ss;
  J.adminAgRtp = Te({ region: re, timeoutSeconds: 60 }, Ne(async (e) => {
    let t = S.requireRole(e, ["super", "finance"]), n = e.data || {}, a = await Ee(), o = a.currencyCode, s, r = null;
    switch (n.action) {
      case "subMerchant": {
        let i = S.str(n.subMerchantCode || a.subMerchantCode, { max: 50, label: "Sub-merchant", pattern: un }), d = tt(n.rtp, 1, 100, "RTP");
        s = await oe.call(a, "/game/v5/set/sub/merchant/rtp", { subMerchantCode: i, rtp: d, currencyCode: o }), r = { scope: "SUB_MERCHANT", subMerchantCode: i, rtp: d, changed: s.data?.changedRtpValue };
        break;
      }
      case "player": {
        let i = S.str(n.playerId, { max: 128, label: "Player", pattern: Et }), d = tt(n.rtp, 1, 100, "RTP");
        s = await oe.call(a, "/game/v5/set/player/rtp", { currencyCode: o, rtp: d, playerId: i }), r = { scope: "PLAYER", playerId: i, rtp: d, changed: s.data?.changedRtpValue };
        break;
      }
      case "batch": {
        let i = [...new Set((Array.isArray(n.playerIds) ? n.playerIds : []).map((c) => String(c).trim()).filter(Boolean))];
        if (!i.length || i.length > 50) throw S.bad("Provide 1-50 player IDs.");
        if (i.some((c) => !Et.test(c))) throw S.bad("One of the player IDs is invalid.");
        let d = tt(n.rtp, 1, 100, "RTP");
        s = await oe.call(a, "/game/v5/batch/set/player/rtp", { currencyCode: o, rtp: d, playerIds: i }), r = { scope: "BATCH", playerIds: i, rtp: d, accepted: !0 };
        break;
      }
      case "effective": {
        let i = { currencyCode: o };
        n.subMerchantCode && (i.subMerchantCode = S.str(n.subMerchantCode, { max: 50, pattern: un, label: "Sub-merchant" })), n.playerId && (i.playerId = S.str(n.playerId, { max: 128, pattern: Et, label: "Player" })), s = await oe.call(a, "/game/v5/rtp/effective", i);
        break;
      }
      case "history": {
        let i = ln(n.startTime, "Start time"), d = ln(n.endTime, "End time");
        if (i.ms >= d.ms) throw S.bad("Start time must be before end time.");
        if (i.ms < Date.now() - 31 * 864e5) throw S.bad("Only the past month can be queried (PDF \xA75.4.4).");
        let c = { currencyCode: o, startTime: i.s, endTime: d.s, pageSize: tt(n.pageSize ?? 20, 1, 100, "Page size") };
        n.cursor && (c.cursor = S.str(n.cursor, { max: 200, label: "Cursor" })), n.subMerchantCode && (c.subMerchantCode = S.str(n.subMerchantCode, { max: 50, pattern: un, label: "Sub-merchant" })), n.playerId && (c.playerId = S.str(n.playerId, { max: 128, pattern: Et, label: "Player" })), Array.isArray(n.playerIds) && n.playerIds.length && (c.playerIds = n.playerIds.slice(0, 50).map(String)), s = await oe.call(a, "/game/v5/rtp/change/history", c);
        break;
      }
      default:
        throw S.bad("Unknown RTP action.");
    }
    return r && (await I.collection("agRtpChanges").add({ ...r, currencyCode: o, by: t, at: W.serverTimestamp() }), S.audit(null, t, "ag_rtp_change", r)), { ok: !0, data: s.data ?? {} };
  }));
  async function rs(e, { startIso: t, endIso: n, pageNum: a, pageSize: o, sort: s }) {
    let i = (await oe.call(e, "/game/v5/game/record", { pageNum: a, pageSize: o, reqData: { startTime: t, endTime: n, sort: s } })).data?.gameRecordList || [];
    if (i.length) {
      let d = I.batch();
      for (let c of i) {
        if (c.orderNo === void 0 || c.orderNo === null) continue;
        let l = c.playerId || c.playerUniqueId || "", u = Number(c.betAmount) || 0, m = Number(c.winAmount) || 0;
        d.set(I.doc(`agGameRecords/${String(c.orderNo)}`), {
          orderNo: String(c.orderNo),
          playerId: l,
          uid: l,
          betAmount: u,
          winAmount: m,
          ggr: Math.round((u - m) * 100) / 100,
          betTime: c.betTime || "",
          winTime: c.winTime || "",
          betTimeMs: Date.parse(c.betTime) || 0,
          gameCode: c.gameCode || "",
          currencyCode: c.currencyCode || "",
          roundId: c.roundId || "",
          syncedAt: W.serverTimestamp()
        }, { merge: !0 });
      }
      await d.commit();
    }
    return i;
  }
  J.adminAgGameRecords = Te({ region: re, timeoutSeconds: 120 }, Ne(async (e) => {
    S.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, n = await Ee(), a = ln(t.startTime, "Start time"), o = ln(t.endTime, "End time");
    if (a.ms >= o.ms) throw S.bad("Start time must be before end time.");
    let s = await rs(n, { startIso: a.s, endIso: o.s, pageNum: tt(t.pageNum ?? 1, 1, 1e5, "Page"), pageSize: tt(t.pageSize ?? 20, 1, 100, "Page size"), sort: t.sort !== !1 });
    return { ok: !0, records: s, hasMore: s.length >= (Number(t.pageSize) || 20) };
  }));
  async function is(e) {
    let n = (await oe.call(e, "/game/v5/merchant/info", {})).data || {}, a = n.apiType === 0 || n.apiType === "0" || n.apiType === "SINGLE_WALLET" ? "SINGLE_WALLET" : n.apiType === 1 || n.apiType === "1" || n.apiType === "TRANSFER_WALLET" ? "TRANSFER_WALLET" : String(n.apiType ?? ""), o = (n.walletInfos || []).map((i) => ({ billingMode: i.billingMode || "", rtp: Number(i.rtp) || null, currencyCode: i.currencyCode || "", balance: Number(i.balance) || 0 })), s = o.find((i) => i.currencyCode === e.currencyCode), r = {
      merchantName: n.merchantName || "",
      merchantCode: n.merchantCode || e.merchantCode,
      apiType: a,
      apiTypeOk: a === "SINGLE_WALLET",
      singleControlInGlobal: !!n.singleControlInGlobal,
      callbackUrl: n.callbackUrl || "",
      whiteIps: n.whiteIps || "",
      walletInfos: o,
      balance: s ? s.balance : null,
      currencyCode: e.currencyCode,
      status: s ? s.balance > 0 ? "ACTIVE" : "NO_BALANCE" : "NO_WALLET_FOR_CURRENCY",
      syncedAt: W.serverTimestamp()
    };
    return await I.doc("adminConfig/agMerchant").set(r), r;
  }
  J.adminAgMerchantInfo = Te({ region: re, timeoutSeconds: 60 }, Ne(async (e) => (S.requireRole(e, ["super", "finance"]), { ok: !0, merchant: { ...await is(await Ee({ fresh: !0 })), syncedAt: Date.now() } })));
  J.adminAgReport = Te({ region: re, timeoutSeconds: 60 }, Ne(async (e) => {
    S.requireRole(e, ["super", "finance"]);
    let t = e.data || {}, n = Number(t.from) || Date.now() - 864e5, a = Number(t.to) || Date.now();
    if (n >= a || a - n > 400 * 864e5) throw S.bad("Invalid date range.");
    let o = I.collection("agBets").where("at", ">=", n).where("at", "<", a), [s, r, i, d] = await Promise.all([
      o.aggregate({ bets: pt.sum("betAmount"), wins: pt.sum("winAmount"), reversed: pt.sum("winReversed"), n: pt.count() }).get(),
      o.where("status", "==", "cancelled").aggregate({ refunded: pt.sum("betAmount"), n: pt.count() }).get(),
      I.collection("statsShards").get(),
      I.collection("agSessions").where("status", "==", "active").count().get()
    ]), c = s.data(), l = r.data(), u = (c.bets || 0) - (l.refunded || 0), m = (c.wins || 0) - (c.reversed || 0), f = {};
    return i.docs.filter((g) => g.id.startsWith("ag_")).forEach((g) => {
      for (let [b, T] of Object.entries(g.data())) f[b] = Math.round(((f[b] || 0) + (Number(T) || 0)) * 100) / 100;
    }), {
      ok: !0,
      range: { from: n, to: a },
      betCount: c.n || 0,
      cancelledCount: l.n || 0,
      turnover: Math.round(u * 100) / 100,
      payout: Math.round(m * 100) / 100,
      ggr: Math.round((u - m) * 100) / 100,
      rtpActual: u > 0 ? Math.round(m / u * 1e4) / 100 : null,
      activeSessions: d.data().count,
      lifetime: f
    };
  }));
  J.agScheduledSync = ns({ region: re, schedule: "every 30 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    let e;
    try {
      e = await Ee({ fresh: !0 });
    } catch {
      return;
    }
    try {
      await is(e);
    } catch (n) {
      console.error("merchant sync", n.message);
    }
    try {
      let n = /* @__PURE__ */ new Date(), a = new Date(n.getTime() - 40 * 6e4);
      for (let o = 1; o <= 50 && !((await rs(e, { startIso: a.toISOString(), endIso: n.toISOString(), pageNum: o, pageSize: 100, sort: !1 })).length < 100); o++)
        ;
    } catch (n) {
      console.error("records sync", n.message);
    }
    let t = await I.collection("agSessions").where("status", "==", "active").where("launchedAtMs", "<", Date.now() - 12 * 36e5).limit(400).get();
    if (!t.empty) {
      let n = I.batch();
      t.docs.forEach((a) => n.update(a.ref, { status: "expired", closedAt: W.serverTimestamp() })), await n.commit();
    }
  });
  J.agCleanup = ns({ region: re, schedule: "every day 04:10", timeZone: "Asia/Dhaka", timeoutSeconds: 540 }, async () => {
    let e = /* @__PURE__ */ new Date();
    for (let t of ["agNonces", "agCallbackLogs", "agApiLogs"])
      for (let n = 0; n < 40; n++) {
        let a = await I.collection(t).where("expireAt", "<", e).limit(400).get();
        if (a.empty) break;
        let o = I.batch();
        a.docs.forEach((s) => o.delete(s.ref)), await o.commit();
      }
  });
  J.LOBBY = bi;
});

// src/account.js
var cs = R((Pt) => {
  "use strict";
  var { onCall: pn } = ne(), le = z(), { db: nt, admin: la, FieldValue: mn, HttpsError: ki, REGION: fn } = le;
  Pt.setResponsibleGaming = pn({ region: fn }, async (e) => {
    let t = le.authUid(e), n = e.data || {}, a = nt.doc(`users/${t}`), o = {};
    if (await nt.runTransaction(async (s) => {
      let r = await s.get(a);
      le.assertActive(r.data());
      let i = { ...r.data().rg || {} }, d = Date.now();
      if (i.pendingLimitAt && i.pendingLimitAt <= d && (i.dailyDepositLimit = i.pendingLimit, delete i.pendingLimit, delete i.pendingLimitAt), n.dailyDepositLimit !== void 0) {
        let c = Number(n.dailyDepositLimit) || 0;
        if (c < 0 || c > 1e8) throw le.bad("Invalid limit.");
        let l = Number(i.dailyDepositLimit) || 0;
        c > 0 && (l === 0 || c < l) ? (i.dailyDepositLimit = le.round2(c), delete i.pendingLimit, delete i.pendingLimitAt, o.applied = "now") : c !== l && (i.pendingLimit = le.round2(c), i.pendingLimitAt = d + 24 * 36e5, o.applied = "in24h");
      }
      if (n.excludeDays !== void 0) {
        let c = Number(n.excludeDays);
        if (![1, 7, 30, 90, 180, 365].includes(c)) throw le.bad("Choose 1, 7, 30, 90, 180 or 365 days.");
        let l = d + c * 864e5, u = i.excludedUntil?.toMillis ? i.excludedUntil.toMillis() : Number(i.excludedUntil) || 0;
        i.excludedUntil = Math.max(u, l), o.excludedUntil = i.excludedUntil, s.set(nt.doc(`agSessions/${t}`), { uid: t, status: "forced", forcedAt: mn.serverTimestamp(), forceReason: "self-exclusion" }, { merge: !0 });
      }
      s.update(a, { rg: i }), o.rg = i;
    }), o.excludedUntil)
      try {
        let { loadConfig: s } = sn();
        await aa().call(await s(), "/game/v5/player/force/logout", { playerId: t }, { retries: 1 });
      } catch (s) {
        console.warn("self-exclusion provider logout", s.message);
      }
    return { ok: !0, ...o };
  });
  Pt.revokeMySessions = pn({ region: fn }, async (e) => {
    let t = le.authUid(e);
    return await la.auth().revokeRefreshTokens(t), await nt.doc(`users/${t}`).set({ sessionsRevokedAt: mn.serverTimestamp() }, { merge: !0 }), await nt.collection("loginHistory").add({ uid: t, event: "logout_all", at: mn.serverTimestamp() }), { ok: !0 };
  });
  Pt.adminListStaff = pn({ region: fn }, async (e) => (le.requireRole(e, ["super"]), { staff: (await nt.collection("users").where("role", "in", le.STAFF_ROLES).limit(100).get()).docs.map((n) => ({ uid: n.id, name: n.data().name || "", username: n.data().username || "", email: n.data().email || "", role: n.data().role, status: n.data().status })) }));
  Pt.adminSignOutUser = pn({ region: fn, timeoutSeconds: 60 }, async (e) => {
    let t = le.requireRole(e, ["super", "support"]), n = le.str((e.data || {}).uid, { max: 128, label: "User" });
    if (!await la.auth().getUser(n).catch(() => null)) throw new ki("not-found", "User not found.");
    await la.auth().revokeRefreshTokens(n), await nt.doc(`users/${n}`).set({ sessionsRevokedAt: mn.serverTimestamp() }, { merge: !0 });
    try {
      let { loadConfig: o } = sn(), { forceLogoutOne: s } = ua();
      await s(await o(), n, t, { reason: "Signed out by support" });
    } catch (o) {
      console.warn("provider logout", o.message);
    }
    return le.audit(null, t, "user_signed_out", { uid: n }), { ok: !0 };
  });
});

// src/fswrite.js
var gs = R((fs) => {
  "use strict";
  var { onCall: Ci } = ne(), at = z(), { db: ds, HttpsError: ls, REGION: Ii } = at, { merge: us, setPath: _i, plain: Ni } = yt(), he = (e) => typeof e == "number" && Number.isFinite(e), xe = (e) => typeof e == "string", ms = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  }, ve = (e, t) => t.includes(ms(e)), ps = (e) => new ls("permission-denied", e || "You do not have permission."), $i = (e, t) => [.../* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])].filter((a) => JSON.stringify((e || {})[a]) !== JSON.stringify((t || {})[a])), gn = (e, t, n) => $i(e, t).every((a) => n.includes(a)), N = (e, t) => {
    if (!e) throw ps(t);
  };
  function Ri(e, t, n, a, o, s) {
    let r = n.split("/"), i = ms(e) !== null;
    if (r[0] === "users" && r.length === 2) {
      N(a === "update" && t === r[1], "Not allowed."), N(gn(o, s, ["name", "phone", "photoURL", "lastSeenAt"]), "You cannot change that field."), N(xe(s.name) && s.name.length >= 2 && s.name.length <= 60, "Name must be 2-60 characters."), N(xe(s.phone) && /^\+?[0-9]{8,15}$/.test(s.phone), "Invalid phone number."), N(xe(s.photoURL) && s.photoURL.length < 600, "Invalid photo.");
      return;
    }
    if (r[0] === "users" && r[2] === "notifications" && r.length === 4) {
      if (N(t === r[1], "Not allowed."), a === "delete") return;
      N(a === "update" && gn(o, s, ["read"]) && typeof s.read == "boolean", "Not allowed.");
      return;
    }
    if (r[0] === "users" && r[2] === "devices" && r.length === 4) {
      if (N(t === r[1], "Not allowed."), a === "delete") return;
      N(Object.keys(s).every((d) => ["platform", "updatedAt"].includes(d)) && xe(s.platform), "Invalid device.");
      return;
    }
    if (r[0] === "users" && r[2] === "private" && r[3] === "withdrawAccounts" && r.length === 4) {
      if (N(t === r[1], "Not allowed."), a === "delete") return;
      N(Object.keys(s).every((d) => ["list", "updatedAt"].includes(d)) && Array.isArray(s.list) && s.list.length <= 6, "Invalid saved accounts.");
      return;
    }
    if (r[0] === "paymentMethods" && r.length === 2) {
      if (N(ve(e, ["super", "finance"])), a === "delete") return;
      N(xe(s.name) && s.name.length > 0 && s.name.length <= 60 && typeof s.enabled == "boolean", "Invalid payment method."), N(s.type === void 0 || ["deposit", "withdraw", "both"].includes(s.type), "Invalid type."), N(s.minAmount === void 0 || he(s.minAmount) && s.minAmount >= 0, "Invalid minimum.");
      return;
    }
    if (r[0] === "paymentAccounts" && r.length === 2) {
      if (N(ve(e, ["super", "finance"])), a === "delete") return;
      N(xe(s.methodId) && xe(s.accountNumber) && ["active", "standby", "cooldown", "paused", "disabled", "maintenance", "locked", "archived"].includes(s.status) && he(s.dailyLimit) && he(s.monthlyLimit), "Invalid payment account."), N(s.cycleLimit === void 0 || he(s.cycleLimit) && s.cycleLimit >= 0 && s.cycleLimit <= 1e8, "Invalid cycle limit."), N(s.cooldownDays === void 0 || he(s.cooldownDays) && s.cooldownDays >= 0 && s.cooldownDays <= 365, "Invalid cooldown.");
      return;
    }
    if (r[0] === "paymentAccounts" && r[2] === "private" && r.length === 4) {
      N(ve(e, ["super", "finance"]));
      return;
    }
    if ((r[0] === "banners" || r[0] === "legal") && r.length === 2) {
      N(ve(e, ["super", "content"]));
      return;
    }
    if (r[0] === "bonuses" && r.length === 2) {
      if (N(ve(e, ["super", "content", "finance"])), a === "delete") return;
      N(xe(s.title) && he(s.amount) && s.amount > 0 && s.amount <= 1e6 && ["once", "daily", "weekly", "monthly"].includes(s.type) && typeof s.enabled == "boolean", "Invalid bonus."), N(s.kind === void 0 || ["fixed", "random", "lucky"].includes(s.kind), "Invalid bonus kind."), N(s.maxAmount === void 0 || he(s.maxAmount) && s.maxAmount >= s.amount && s.maxAmount <= 1e6, "Maximum must be \u2265 minimum (up to 1,000,000)."), N(s.prizes === void 0 || Array.isArray(s.prizes) && s.prizes.length <= 12 && s.prizes.every((d) => d && he(d.amount) && d.amount > 0 && d.amount <= 1e6 && he(d.weight) && d.weight > 0 && d.weight <= 1e5), "Invalid prizes (max 12)."), N(s.kind !== "lucky" || Array.isArray(s.prizes) && s.prizes.length >= 2, "A lucky draw needs at least 2 prizes.");
      return;
    }
    if (r[0] === "lotteries" && r.length === 2) {
      if (N(ve(e, ["super", "content"])), a === "delete") {
        N(o && o.sold === 0, "Tickets were already sold.");
        return;
      }
      if (!o) {
        N(s.sold === 0 && s.status === "open" && he(s.price) && he(s.prize) && he(s.totalTickets), "Invalid lottery.");
        return;
      }
      N(gn(o, s, ["title", "price", "prize", "endsAt", "totalTickets", "maxPerUser", "imageUrl", "status"]), "You cannot change that field."), N(["open", "closed"].includes(s.status) && ["open", "closed"].includes(o.status) && s.totalTickets >= o.sold, "Invalid lottery.");
      return;
    }
    if (r[0] === "games" && r.length === 2) {
      N(a === "update" && ve(e, ["super", "content"]) && gn(o, s, ["enabled", "featured", "sort", "lobbyCategory", "name", "imageUrl"]), "Not allowed.");
      return;
    }
    if (r[0] === "settings" && r.length === 2) {
      let d = r[1];
      N(d === "support" && ve(e, ["super", "support"]) || d === "content" && ve(e, ["super", "content", "support"]) || d === "site" && ve(e, ["super", "finance"]) || !["support", "content", "site"].includes(d) && ve(e, ["super"]), "Not allowed.");
      return;
    }
    throw ps("Not allowed.");
  }
  fs.fsWrite = Ci({ region: Ii }, async (e) => {
    let t = at.authUid(e), n = (e.data || {}).ops;
    if (!Array.isArray(n) || !n.length || n.length > 400) throw at.bad("Invalid request.");
    return await ds.runTransaction(async (a) => {
      let o = [];
      for (let s of n) {
        let r = at.str(s.path, { max: 300, label: "Path" });
        if (!/^[A-Za-z0-9_\-./]+$/.test(r) || r.includes("..") || r.split("/").length % 2 !== 0) throw at.bad("Invalid path.");
        let i = ds.doc(r), d = await a.get(i), c = d.exists ? d.data() : void 0, l = s.op === "create" ? "set" : s.op;
        if (!["set", "update", "delete"].includes(l)) throw at.bad("Invalid operation.");
        let u;
        if (l === "delete") u = void 0;
        else {
          let m = Ni(s.data || {});
          if (typeof m != "object" || Array.isArray(m)) throw at.bad("Invalid data.");
          if (l === "update") {
            if (!c) throw new ls("not-found", "Document not found.");
            u = JSON.parse(JSON.stringify(c));
            for (let [f, g] of Object.entries(m)) _i(u, f, g);
          } else u = s.merge && c ? us(JSON.parse(JSON.stringify(c)), m) : us({}, m);
        }
        Ri(e, t, r, l === "delete" ? "delete" : c ? "update" : "create", c, u), o.push({ ref: i, type: l, data: s.data, merge: !!s.merge });
      }
      for (let s of o)
        s.type === "delete" ? a.delete(s.ref) : s.type === "update" ? a.update(s.ref, s.data) : a.set(s.ref, s.data, { merge: s.merge });
    }), { ok: !0 };
  });
});

// src/rotation.js
var bs = R((Dt) => {
  "use strict";
  var { onCall: pa } = ne(), { onSchedule: Ei } = Xn(), me = z(), hn = On(), { db: Se, FieldValue: Pi, HttpsError: ma, REGION: wn } = me, yn = hn.n0, hs = async () => {
    let e = await me.siteSettings();
    return Math.max(1, yn((e.deposit || {}).min) || 1);
  }, ws = (e) => e && typeof e.toMillis == "function" ? e.toMillis() : yn(e);
  async function ys(e = Date.now()) {
    let t = await hs(), n = await Se.collection("paymentMethods").get(), a = 0;
    for (let i of n.docs)
      (await Se.runTransaction((c) => hn.rotateTx(c, i.id, { now: e, min: t, reason: "tick" }))).changed.length && a++;
    let o = await me.siteSettings(), s = yn((o.deposit || {}).expireHours), r = 0;
    if (s > 0) {
      let i = await Se.collection("deposits").where("status", "==", "pending").limit(200).get();
      for (let d of i.docs) {
        let c = d.data();
        if (!c.createdAt || ws(c.createdAt) > e - s * 36e5) continue;
        await Se.runTransaction(async (u) => {
          let m = await u.get(d.ref);
          return !m.exists || m.data().status !== "pending" ? !1 : (c.accountId && await hn.rotateTx(u, c.methodId, { now: e, min: t, settle: { accountId: c.accountId, amount: c.amount, outcome: "release" } }), u.update(d.ref, { status: "expired", note: "Expired: not reviewed in time", reviewedAt: Pi.serverTimestamp(), reviewedBy: "system" }), me.notify(u, c.uid, "Deposit expired", "Your deposit request expired. Please contact support if you already paid.", "deposit"), me.bumpStats(u, { pendingDeposits: -1 }), me.audit(u, "system", "deposit_expired", { depositId: d.id, amount: c.amount }), !0);
        }) && r++;
      }
    }
    return { rotated: a, expired: r };
  }
  Dt.paymentRotationTick = Ei({ region: wn, schedule: "every 10 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    await ys();
  });
  Dt.paymentSync = pa({ region: wn }, async (e) => {
    let t = me.authUid(e), n = e.auth.token.admin === !0 && ["super", "finance"].includes(e.auth.token.role), a = Se.doc("system/paymentTick"), o = await a.get(), s = o.exists ? yn(o.data().at) : 0;
    return !(n && (e.data || {}).force) && Date.now() - s < 45e3 ? { ok: !0, skipped: !0 } : (await a.set({ at: Date.now(), by: t }, { merge: !0 }), { ok: !0, ...await ys() });
  });
  var Di = ["activate", "pause", "resume", "reset"];
  Dt.paymentAccountAction = pa({ region: wn }, async (e) => {
    let t = me.requireRole(e, ["super", "finance"]), n = e.data || {}, a = me.str(n.accountId, { max: 120, label: "Account" }), o = n.action;
    if (!Di.includes(o)) throw me.bad("Invalid action.");
    let s = await hs(), i = await Se.doc(`paymentAccounts/${a}`).get();
    if (!i.exists) throw new ma("not-found", "Account not found.");
    let d = i.data().methodId;
    return await Se.runTransaction(async (c) => {
      let u = (await hn.rotateTx(c, d, { now: Date.now(), min: s, force: { [o]: a }, reason: "manual" })).accounts.find((m) => m.id === a);
      if (!u) throw new ma("not-found", "Account not found.");
      me.audit(c, t, `payment_account_${o}`, { accountId: a, number: u.accountNumber || "", methodId: d });
    }).catch((c) => {
      throw c;
    }), { ok: !0 };
  });
  Dt.paymentAccountHistory = pa({ region: wn }, async (e) => {
    me.requireRole(e, ["super", "finance"]);
    let t = me.str((e.data || {}).accountId, { max: 120, label: "Account" }), n = await Se.doc(`paymentAccounts/${t}`).get();
    if (!n.exists) throw new ma("not-found", "Account not found.");
    let [a, o, s] = await Promise.all([
      Se.collection("paymentCycles").where("accountId", "==", t).get(),
      Se.collection("deposits").where("accountId", "==", t).limit(200).get(),
      Se.collection("paymentRotationLogs").where("methodId", "==", n.data().methodId).limit(200).get()
    ]), r = (i) => JSON.parse(JSON.stringify(i));
    return {
      cycles: a.docs.map((i) => r(i.data())).sort((i, d) => d.cycleNo - i.cycleNo),
      deposits: o.docs.map((i) => ({ id: i.id, amount: i.data().amount, status: i.data().status, trxId: i.data().trxId, username: i.data().username, at: ws(i.data().createdAt) })).sort((i, d) => d.at - i.at).slice(0, 100),
      logs: s.docs.map((i) => r(i.data())).filter((i) => i.oldAccountId === t || i.newAccountId === t).sort((i, d) => d.at - i.at).slice(0, 50)
    };
  });
});

// src/payout.js
var Ts = R((we) => {
  "use strict";
  var { onCall: ke } = ne(), k = z(), fa = xn(), Ot = Wt().helpers, { db: x, FieldValue: Z, HttpsError: ee, REGION: Ce } = k, F = fa.n0, ie = (e) => x.doc(`payoutAgents/${e}`), ht = ["super", "finance"], gt = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0;
  async function ga(e) {
    let t = k.requireRole(e, ["payout"]), n = await ie(t).get();
    if (!n.exists || n.data().active === !1) throw new ee("permission-denied", "Your payout access is turned off.");
    return t;
  }
  var Oi = (e, t) => ({
    id: e,
    methodId: t.methodId,
    methodName: t.methodName,
    accountNumber: t.accountNumber,
    holderName: t.holderName || "",
    amount: t.net,
    stage: t.stage,
    createdAt: gt(t.createdAt),
    assignedAt: gt(t.assignedAt),
    reviewNote: t.reviewNote || "",
    paidAt: gt(t.paidAt),
    payTrxId: t.payTrxId || "",
    hasProof: !!t.proofKey,
    status: t.status
  });
  we.payoutMyTasks = ke({ region: Ce }, async (e) => {
    let t = await ga(e), a = (await x.collection("withdrawals").where("assignedTo", "==", t).limit(300).get()).docs.map((r) => Oi(r.id, r.data())), o = (await ie(t).get()).data() || {}, s = fa.startOfDhakaDay().getTime();
    return {
      open: a.filter((r) => r.status === "pending" && r.stage === "assigned").sort((r, i) => r.assignedAt - i.assignedAt),
      review: a.filter((r) => r.status === "pending" && r.stage === "paid_review").sort((r, i) => i.paidAt - r.paidAt),
      done: a.filter((r) => r.status === "approved").sort((r, i) => i.paidAt - r.paidAt).slice(0, 50),
      today: a.filter((r) => r.status === "approved" && r.paidAt >= s).reduce((r, i) => ({ count: r.count + 1, total: k.round2(r.total + F(i.amount)) }), { count: 0, total: 0 }),
      me: { name: o.name || "", methods: o.methods || [], ...bn(o) },
      storage: Ot.configured()
    };
  });
  function bn(e) {
    let t = F(e.floatGiven), n = F(e.floatReturned), a = F(e.paidTotal), o = F(e.reviewTotal);
    return { floatGiven: t, floatReturned: n, paidTotal: a, paidCount: F(e.paidCount), reviewTotal: o, reviewCount: F(e.reviewCount), remaining: k.round2(t - n - a - o), openCount: Math.max(0, F(e.openCount)) };
  }
  we.payoutMarkPaid = ke({ region: Ce }, async (e) => {
    let t = await ga(e), n = e.data || {}, a = k.str(n.withdrawalId, { max: 80 }), o = k.str(n.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), s = typeof n.fromNumber == "string" ? n.fromNumber.replace(/[^0-9+]/g, "").slice(0, 20) : "", r = typeof n.proofKey == "string" ? n.proofKey.trim() : "";
    if (Ot.configured()) {
      if (!r) throw k.bad("Please upload the payment screenshot.");
      if (!Ot.safeKey(r) || !r.startsWith(`payouts/${a}/${t}-`)) throw k.bad("Invalid screenshot.");
      await Ot.verifyImage(r);
    }
    return await x.runTransaction(async (i) => {
      let d = x.doc(`withdrawals/${a}`), c = await i.get(d), l = c.exists ? c.data() : null;
      if (!l || l.assignedTo !== t) throw new ee("permission-denied", "This task is not assigned to you.");
      if (l.status !== "pending" || l.stage !== "assigned") throw new ee("failed-precondition", "This task is not waiting for payment.");
      i.update(d, { stage: "paid_review", paidBy: t, paidAt: Date.now(), payTrxId: o, fromNumber: s, proofKey: r, reviewNote: "" }), i.update(ie(t), { reviewTotal: Z.increment(F(l.net)), reviewCount: Z.increment(1), openCount: Z.increment(-1), lastPaidAt: Date.now() }), k.audit(i, t, "payout_paid", { withdrawalId: a, net: l.net, trx: o });
    }), { ok: !0 };
  });
  we.payoutReturn = ke({ region: Ce }, async (e) => {
    let t = await ga(e), n = e.data || {}, a = k.str(n.withdrawalId, { max: 80 }), o = k.str(n.reason, { min: 3, max: 200, label: "Reason" });
    return await x.runTransaction(async (s) => {
      let r = x.doc(`withdrawals/${a}`), i = await s.get(r), d = i.exists ? i.data() : null;
      if (!d || d.assignedTo !== t) throw new ee("permission-denied", "This task is not assigned to you.");
      if (d.status !== "pending" || d.stage !== "assigned") throw new ee("failed-precondition", "You can only return a task you have not paid yet.");
      s.update(r, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null, returnReason: o, returnedBy: t, returnedAt: Date.now() }), s.update(ie(t), { openCount: Z.increment(-1), returnedCount: Z.increment(1) }), k.audit(s, t, "payout_returned", { withdrawalId: a, reason: o });
    }), { ok: !0 };
  });
  async function As(e, t, n) {
    await x.runTransaction(async (a) => {
      let o = x.doc(`withdrawals/${e}`), [s, r] = await Promise.all([a.get(o), a.get(ie(t))]), i = s.exists ? s.data() : null;
      if (!r.exists || r.data().active === !1) throw new ee("failed-precondition", "That agent is not active.");
      if (!i || i.status !== "pending") throw new ee("failed-precondition", "This request is no longer pending.");
      if (i.stage === "paid_review") throw new ee("failed-precondition", "Already paid \u2014 waiting for review.");
      i.assignedTo !== t && (i.assignedTo && a.update(ie(i.assignedTo), { openCount: Z.increment(-1) }), a.update(o, { stage: "assigned", assignedTo: t, assignedName: r.data().name || "", assignedAt: Date.now(), assignedBy: n }), a.update(ie(t), { openCount: Z.increment(1) }), k.notify(a, t, "New payout task", `Send ${i.net} by ${i.methodName}.`, "payout"));
    });
  }
  we.payoutAssign = ke({ region: Ce }, async (e) => {
    let t = k.requireRole(e, ht), n = e.data || {}, a = Array.isArray(n.withdrawalIds) ? n.withdrawalIds.slice(0, 100).map((r) => k.str(r, { max: 80 })) : [];
    if (!a.length) throw k.bad("Pick at least one request.");
    let o = k.str(n.agentUid, { max: 80, label: "Agent" }), s = { ok: 0, failed: [] };
    for (let r of a)
      try {
        await As(r, o, t), s.ok++;
      } catch (i) {
        s.failed.push({ id: r, error: i.message });
      }
    return k.audit(null, t, "payout_assign", { agentUid: o, count: s.ok }), s;
  });
  we.payoutAutoAssign = ke({ region: Ce }, async (e) => {
    let t = k.requireRole(e, ht), n = e.data || {}, a = n.mode === "method" ? "method" : "equal", o = Array.isArray(n.agentUids) && n.agentUids.length ? new Set(n.agentUids.map(String)) : null, s = (await x.collection("payoutAgents").where("active", "==", !0).get()).docs.map((d) => ({ uid: d.id, methods: d.data().methods || [], load: Math.max(0, F(d.data().openCount)) })).filter((d) => !o || o.has(d.uid));
    if (!s.length) throw new ee("failed-precondition", "No active payout agents.");
    let r = (await x.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.filter((d) => !d.data().assignedTo && d.data().stage !== "paid_review").sort((d, c) => gt(d.data().createdAt) - gt(c.data().createdAt)), i = { ok: 0, skipped: 0, failed: [] };
    for (let d of r) {
      let c = a === "method" ? s.filter((u) => !u.methods.length || u.methods.includes(d.data().methodId)) : s;
      if (!c.length) {
        i.skipped++;
        continue;
      }
      let l = c.reduce((u, m) => m.load < u.load ? m : u, c[0]);
      try {
        await As(d.id, l.uid, t), l.load++, i.ok++;
      } catch (u) {
        i.failed.push({ id: d.id, error: u.message });
      }
    }
    return k.audit(null, t, "payout_auto_assign", { mode: a, count: i.ok }), i;
  });
  we.payoutUnassign = ke({ region: Ce }, async (e) => {
    let t = k.requireRole(e, ht), n = k.str((e.data || {}).withdrawalId, { max: 80 });
    return await x.runTransaction(async (a) => {
      let o = x.doc(`withdrawals/${n}`), s = await a.get(o), r = s.exists ? s.data() : null;
      if (!r || r.status !== "pending" || !r.assignedTo) throw new ee("failed-precondition", "Nothing to unassign.");
      if (r.stage === "paid_review") throw new ee("failed-precondition", "Already paid \u2014 review it instead.");
      a.update(o, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null }), a.update(ie(r.assignedTo), { openCount: Z.increment(-1) }), k.audit(a, t, "payout_unassign", { withdrawalId: n });
    }), { ok: !0 };
  });
  we.payoutReview = ke({ region: Ce }, async (e) => {
    let t = k.requireRole(e, ht), n = e.data || {}, a = k.str(n.withdrawalId, { max: 80 }), o = n.action;
    if (!["approve", "send_back"].includes(o)) throw k.bad("Invalid action.");
    let s = typeof n.note == "string" ? n.note.trim().slice(0, 300) : "";
    if (o === "send_back" && s.length < 3) throw k.bad("Write why it is sent back.");
    return await x.runTransaction(async (r) => {
      let i = x.doc(`withdrawals/${a}`), d = await r.get(i), c = d.exists ? d.data() : null;
      if (!c || c.status !== "pending" || c.stage !== "paid_review") throw new ee("failed-precondition", "This payment is not waiting for review.");
      if (c.paidBy === t) throw new ee("permission-denied", "You cannot approve a payment you made yourself.");
      let l = F(c.net);
      o === "approve" ? (fa.finalize(r, i, c, !0, t, s, { approvedBy: t }), r.update(ie(c.paidBy), { reviewTotal: Z.increment(-l), reviewCount: Z.increment(-1), paidTotal: Z.increment(l), paidCount: Z.increment(1) })) : (r.update(i, { stage: "assigned", reviewNote: s, sentBackAt: Date.now(), sentBackBy: t }), r.update(ie(c.paidBy), { reviewTotal: Z.increment(-l), reviewCount: Z.increment(-1), openCount: Z.increment(1) }), k.notify(r, c.paidBy, "Payout sent back", s, "payout")), k.audit(r, t, o === "approve" ? "payout_approved" : "payout_sent_back", { withdrawalId: a, net: l, agent: c.paidBy });
    }), { ok: !0 };
  });
  we.payoutAgents = ke({ region: Ce }, async (e) => {
    k.requireRole(e, ht);
    let t = await x.collection("payoutAgents").limit(50).get(), n = (await x.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.map((s) => ({ id: s.id, ...s.data() })), a = t.docs.map((s) => {
      let r = s.data(), i = n.filter((d) => d.assignedTo === s.id);
      return {
        uid: s.id,
        name: r.name || "",
        email: r.email || "",
        active: r.active !== !1,
        methods: r.methods || [],
        ...bn(r),
        openCount: i.filter((d) => d.stage === "assigned").length,
        reviewCount: i.filter((d) => d.stage === "paid_review").length,
        lastPaidAt: F(r.lastPaidAt)
      };
    }), o = n.map((s) => ({
      id: s.id,
      username: s.username || "",
      methodId: s.methodId,
      methodName: s.methodName,
      accountNumber: s.accountNumber,
      holderName: s.holderName || "",
      amount: s.amount,
      net: s.net,
      stage: s.stage || "new",
      assignedTo: s.assignedTo || "",
      assignedName: s.assignedName || "",
      createdAt: gt(s.createdAt),
      paidBy: s.paidBy || "",
      paidAt: F(s.paidAt),
      payTrxId: s.payTrxId || "",
      fromNumber: s.fromNumber || "",
      proofKey: s.proofKey || "",
      returnReason: s.returnReason || "",
      reviewNote: s.reviewNote || ""
    })).sort((s, r) => s.createdAt - r.createdAt);
    return { agents: a, queue: o, storage: Ot.configured() };
  });
  we.payoutAgentSave = ke({ region: Ce }, async (e) => {
    let t = k.requireRole(e, ["super"]), n = e.data || {}, a = k.str(n.agentUid, { max: 80 }), o = ie(a);
    if (!(await o.get()).exists) throw new ee("not-found", "Agent not found.");
    let r = {};
    return typeof n.active == "boolean" && (r.active = n.active), Array.isArray(n.methods) && (r.methods = n.methods.slice(0, 20).map((i) => k.str(i, { max: 80 }))), await o.update(r), k.audit(null, t, "payout_agent_save", { uid: a, ...r }), { ok: !0 };
  });
  we.payoutFloat = ke({ region: Ce }, async (e) => {
    let t = k.requireRole(e, ["super"]), n = e.data || {}, a = k.str(n.agentUid, { max: 80 }), o = k.amountOf(n.amount, { max: 1e8 }), s = n.direction === "take" ? "take" : "give", r = typeof n.note == "string" ? n.note.trim().slice(0, 200) : "";
    return await x.runTransaction(async (i) => {
      let d = await i.get(ie(a));
      if (!d.exists) throw new ee("not-found", "Agent not found.");
      if (s === "take" && o > bn(d.data()).remaining + 1e-9) throw k.bad("Cannot take back more than the agent has left.");
      i.update(ie(a), s === "give" ? { floatGiven: Z.increment(o) } : { floatReturned: Z.increment(o) }), i.set(x.collection("payoutFloat").doc(), { agentUid: a, amount: o, direction: s, note: r, by: t, at: Date.now() }), k.audit(i, t, "payout_float", { uid: a, amount: o, dir: s });
    }), { ok: !0 };
  });
  we.payoutReport = ke({ region: Ce }, async (e) => {
    k.requireRole(e, ht);
    let t = e.data || {}, n = k.str(t.agentUid, { max: 80 }), a = F(t.from), o = F(t.to) || Date.now() + 864e5, s = await ie(n).get();
    if (!s.exists) throw new ee("not-found", "Agent not found.");
    let r = (await x.collection("withdrawals").where("paidBy", "==", n).limit(1e3).get()).docs.map((c) => ({ id: c.id, ...c.data() })).filter((c) => F(c.paidAt) >= a && F(c.paidAt) <= o).map((c) => ({ id: c.id, methodName: c.methodName, accountNumber: c.accountNumber, net: c.net, status: c.status, stage: c.stage, payTrxId: c.payTrxId || "", fromNumber: c.fromNumber || "", proofKey: c.proofKey || "", paidAt: F(c.paidAt), approvedBy: c.approvedBy || c.reviewedBy || "" })).sort((c, l) => l.paidAt - c.paidAt), i = (await x.collection("payoutFloat").where("agentUid", "==", n).limit(300).get()).docs.map((c) => c.data()).sort((c, l) => l.at - c.at), d = {};
    for (let c of r.filter((l) => l.status === "approved")) {
      let l = c.accountNumber;
      d[l] = d[l] || { accountNumber: l, methodName: c.methodName, count: 0, total: 0 }, d[l].count++, d[l].total = k.round2(d[l].total + F(c.net));
    }
    return { agent: { uid: n, name: s.data().name || "", ...bn(s.data()) }, rows: r, float: i, byNumber: Object.values(d).sort((c, l) => l.total - c.total) };
  });
});

// src/index.js
var vs = R((wt) => {
  "use strict";
  Object.assign(
    wt,
    Ga(),
    ao(),
    io(),
    fo(),
    wo(),
    bo(),
    ua(),
    cs(),
    gs(),
    bs(),
    Ts(),
    Wt()
  );
  delete wt.ensureUserDoc;
  delete wt.LOBBY;
  delete wt.forceLogoutOne;
  delete wt.helpers;
});

// supa/handler.js
var _s = R((kc, Is) => {
  "use strict";
  var se = xt(), { HttpsError: ks } = ne(), Mi = {
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
  }, Ui = (e) => String(e).toUpperCase().replace(/-/g, "_"), Bi = null, ha = () => Bi ||= vs();
  function Cs(e) {
    return {
      "access-control-allow-origin": se.env.ALLOWED_ORIGIN || "*",
      "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-max-age": "86400",
      vary: "origin",
      ...e
    };
  }
  var Pe = (e, t, n) => ({ status: e, headers: Cs({ "content-type": "application/json", "cache-control": "no-store", ...n || {} }), body: JSON.stringify(t) }), Li = (e) => e instanceof ks || e && e.name === "HttpsError" ? Pe(Mi[e.code] || 500, { error: { status: Ui(e.code), code: e.code, message: e.message, details: e.details === void 0 ? null : e.details } }) : (console.error("unhandled", e && e.stack || e), Pe(500, { error: { status: "INTERNAL", code: "internal", message: "Something went wrong on the server. Please try again.", details: null } })), An = se.tokenCache = /* @__PURE__ */ new Map();
  async function qi(e) {
    if (se.verifyToken) return se.verifyToken(e);
    let t = An.get(e);
    if (t && t.exp > Date.now()) return t.user;
    let n = String(se.env.SUPABASE_URL || "").replace(/\/$/, "") + "/auth/v1/user", a = await se.fetch(n, { headers: { apikey: se.env.SUPABASE_ANON_KEY || se.env.SUPABASE_SERVICE_ROLE_KEY || "", authorization: "Bearer " + e } });
    if (!a.ok) return null;
    let o = await a.json();
    if (!o || !o.id) return null;
    let s = { uid: o.id, email: o.email || "", confirmed: !!o.email_confirmed_at, app: o.app_metadata || {}, lastSignIn: o.last_sign_in_at };
    return An.set(e, { user: s, exp: Date.now() + (Number(se.env.TOKEN_CACHE_MS) >= 0 && se.env.TOKEN_CACHE_MS !== void 0 && se.env.TOKEN_CACHE_MS !== "" ? Number(se.env.TOKEN_CACHE_MS) : 3e3) }), An.size > 500 && An.clear(), s;
  }
  var Gi = (e) => e && {
    uid: e.uid,
    token: { uid: e.uid, email: e.email, email_verified: e.confirmed || !se.requireVerified(), admin: e.app.admin === !0, role: e.app.role || null, auth_time: e.lastSignIn ? Math.floor(Date.parse(e.lastSignIn) / 1e3) : void 0 }
  }, Ss = (e) => e == null ? Buffer.alloc(0) : Buffer.from(e), xi = (e) => {
    let t = {};
    for (let [n, a] of Object.entries(e || {})) t[String(n).toLowerCase()] = a;
    return t;
  };
  async function ji(e) {
    let t = xi(e.headers), n = String(e.method || "GET").toUpperCase();
    if (n === "OPTIONS") return { status: 204, headers: Cs(), body: "" };
    let o = new URL(e.url, "http://x").pathname, s = o.indexOf("/api/");
    s >= 0 ? o = o.slice(s + 4) : o.endsWith("/api") && (o = "/"), o = o.replace(/\/+$/, "") || "/";
    try {
      if (o === "/health") return Pe(200, { ok: !0, time: Date.now() });
      if (o === "/agw" || o.startsWith("/agw/")) {
        let g = ha().agCallback, b = { status: 200, headers: {}, body: "" }, T = { status(w) {
          return b.status = w, T;
        }, set(w) {
          return Object.assign(b.headers, w), T;
        }, send(w) {
          return b.body = w, T;
        } };
        return await g({ method: n, path: o, url: o, headers: t, rawBody: Ss(e.body), ip: t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : "" }, T), { status: b.status, headers: { "cache-control": "no-store", ...b.headers }, body: typeof b.body == "string" ? b.body : JSON.stringify(b.body) };
      }
      if (o.startsWith("/_cron/")) {
        if (!se.env.CRON_SECRET || t["x-cron-secret"] !== se.env.CRON_SECRET) return Pe(401, { error: { code: "unauthenticated", message: "bad secret" } });
        let g = ha()[o.slice(7)];
        return !g || g.__kind !== "schedule" ? Pe(404, { error: { code: "not-found", message: "unknown job" } }) : (await g(), Pe(200, { ok: !0 }));
      }
      if (n !== "POST") return Pe(405, { error: { code: "invalid-argument", message: "POST only" } });
      let r = o.slice(1), i = ha()[r];
      if (!i || i.__kind !== "call") return Pe(404, { error: { status: "NOT_FOUND", code: "not-found", message: "Unknown function." } });
      let d = null, c = /^Bearer\s+(.+)$/i.exec(t.authorization || "");
      if (c) {
        let g = await qi(c[1]).catch(() => null);
        g && (d = Gi(g));
      }
      let l = {}, u = Ss(e.body).toString("utf8");
      if (u)
        try {
          let g = JSON.parse(u);
          l = g && g.data !== void 0 ? g.data : g;
        } catch {
          throw new ks("invalid-argument", "Bad JSON.");
        }
      let m = t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : t["cf-connecting-ip"] || "", f = await i({ data: l, auth: d, rawRequest: { headers: t, ip: m } });
      return Pe(200, { result: f === void 0 ? null : f });
    } catch (r) {
      return Li(r);
    }
  }
  Is.exports = { handle: ji };
});

// supa/entry-deno.mjs
var Ns = Aa(xt(), 1), $s = Aa(_s(), 1);
import Fi from "npm:postgres@3.4.4";
var Rs = {};
for (let e of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET", "REQUIRE_VERIFIED", "ALLOWED_ORIGIN", "SITE_URL", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_REGION"]) Rs[e] = Deno.env.get(e) || "";
var Hi = Deno.env.get("DB_URL") || Deno.env.get("SUPABASE_DB_URL"), Vi = Fi(Hi, { max: 4, prepare: !1, idle_timeout: 20, connect_timeout: 10, onnotice() {
} });
Ns.default.configure({ sql: Vi, env: Rs });
Deno.serve(async (e) => {
  let t = {};
  e.headers.forEach((o, s) => {
    t[s] = o;
  });
  let n = e.method === "GET" || e.method === "HEAD" || e.method === "OPTIONS" ? void 0 : new Uint8Array(await e.arrayBuffer()), a = await (0, $s.handle)({ method: e.method, url: e.url, headers: t, body: n });
  return new Response(a.status === 204 ? null : a.body, { status: a.status, headers: a.headers });
});
