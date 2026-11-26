// @ts-nocheck
import { createRequire as __cr } from "node:module";
import { Buffer as __Buf } from "node:buffer";
import __proc from "node:process";
const require = __cr("file:///src/index.ts");
globalThis.Buffer = globalThis.Buffer || __Buf;
globalThis.process = globalThis.process || __proc;
var rr = Object.create;
var gn = Object.defineProperty;
var sr = Object.getOwnPropertyDescriptor;
var or = Object.getOwnPropertyNames;
var ir = Object.getPrototypeOf, cr = Object.prototype.hasOwnProperty;
var fe = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, {
  get: (t, n) => (typeof require < "u" ? require : t)[n]
}) : e)(function(e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var O = (e, t) => () => {
  try {
    return t || e((t = { exports: {} }).exports, t), t.exports;
  } catch (n) {
    throw t = 0, n;
  }
};
var dr = (e, t, n, a) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let r of or(t))
      !cr.call(e, r) && r !== n && gn(e, r, { get: () => t[r], enumerable: !(a = sr(t, r)) || a.enumerable });
  return e;
};
var wn = (e, t, n) => (n = e != null ? rr(ir(e)) : {}, dr(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  t || !e || !e.__esModule ? gn(n, "default", { value: e, enumerable: !0 }) : n,
  e
));

// supa/pgdb.js
var Ye = O((Zs, Tn) => {
  "use strict";
  var lr = fe("crypto"), ur = {
    increment: (e) => ({ __op: "inc", n: e }),
    serverTimestamp: () => ({ __op: "ts" })
  }, mr = {
    count: () => ({ aggregateType: "count" }),
    sum: (e) => ({ aggregateType: "sum", _field: e })
  }, fr = (e) => Object.defineProperties({ __ts: e }, {
    toMillis: { value: () => e },
    toDate: { value: () => new Date(e) },
    seconds: { value: Math.floor(e / 1e3) },
    nanoseconds: { value: e % 1e3 * 1e6 }
  });
  function ct(e) {
    if (Array.isArray(e)) return e.map(ct);
    if (e && typeof e == "object") {
      if (typeof e.__ts == "number" && Object.keys(e).length === 1) return fr(e.__ts);
      let t = {};
      for (let [n, a] of Object.entries(e)) t[n] = ct(a);
      return t;
    }
    return e;
  }
  function de(e) {
    if (e instanceof Date) return { __ts: e.getTime() };
    if (Array.isArray(e)) return e.map(de);
    if (e && typeof e == "object") {
      if (e.__op) return e;
      if (typeof e.toMillis == "function" && typeof e.__ts == "number") return { __ts: e.__ts };
      let t = {};
      for (let [n, a] of Object.entries(e)) a !== void 0 && (t[n] = de(a));
      return t;
    }
    return e;
  }
  function dt(e, t) {
    if (t && t.__op === "inc") return (Number(e) || 0) + t.n;
    if (t && t.__op === "ts") return { __ts: Date.now() };
    if (Array.isArray(t)) return t.map((n) => dt(void 0, n));
    if (t && typeof t == "object" && typeof t.__ts != "number") {
      let n = {};
      for (let [a, r] of Object.entries(t)) n[a] = dt(void 0, r);
      return n;
    }
    return t;
  }
  function yn(e, t, n) {
    let a = t.split("."), r = e;
    for (let o = 0; o < a.length - 1; o++)
      (typeof r[a[o]] != "object" || r[a[o]] === null) && (r[a[o]] = {}), r = r[a[o]];
    let s = a[a.length - 1];
    r[s] = dt(r[s], n);
  }
  function Ie(e, t) {
    for (let [n, a] of Object.entries(t))
      a && typeof a == "object" && !a.__op && !Array.isArray(a) && typeof a.__ts != "number" && e[n] && typeof e[n] == "object" && !Array.isArray(e[n]) && typeof e[n].__ts != "number" ? Ie(e[n], a) : e[n] = dt(e[n], a);
    return e;
  }
  var Ot = (e) => {
    let t = e.lastIndexOf("/");
    return { collection: e.slice(0, t), id: e.slice(t + 1) };
  }, Le = class {
    constructor(t, n) {
      this.ref = t, this.id = t.id, this._d = n, this.exists = n !== void 0;
    }
    data() {
      return this._d === void 0 ? void 0 : ct(JSON.parse(JSON.stringify(this._d)));
    }
  }, bn = (e) => {
    let t = new Error("ALREADY_EXISTS " + e);
    return t.code = 6, t;
  }, pr = (e) => {
    let t = new Error("NOT_FOUND " + e);
    return t.code = 5, t;
  }, Mt = class {
    /** @param sql a `postgres` (porsager) client */
    constructor(t) {
      this.sql = t;
    }
    doc(t) {
      return new Ge(this, t);
    }
    collection(t) {
      return new lt(this, t);
    }
    batch() {
      let t = [], n = {
        set: (a, r, s = {}) => (t.push({ type: "set", path: a.path, data: r, merge: !!s.merge }), n),
        update: (a, r) => (t.push({ type: "update", path: a.path, data: r }), n),
        delete: (a) => (t.push({ type: "delete", path: a.path }), n),
        commit: async () => {
          await this.sql.begin((a) => this._applyAll(a, t));
        }
      };
      return n;
    }
    async _lockRead(t, n) {
      await t`select pg_advisory_xact_lock(hashtextextended(${n}, 0))`;
      let a = await t`select data from public.docs where path = ${n}`;
      return a.length ? a[0].data : void 0;
    }
    /**
     * Apply a list of buffered ops with a constant number of round trips (the DB may be far from the Edge Function):
     * 1 sorted advisory-lock statement, 1 read of every touched doc, 1 bulk upsert (+1 bulk delete, pipelined).
     * Ops on the same path are folded in order in memory, so semantics equal the old one-op-at-a-time loop.
     */
    async _applyAll(t, n) {
      if (!n.length) return;
      let a = [...new Set(n.map((i) => i.path))].sort();
      await t`select pg_advisory_xact_lock(hashtextextended(s.p, 0)) from (select p from unnest(${a}::text[]) as p order by p) s`;
      let r = await t`select path, data from public.docs where path = any(${a}::text[])`, s = /* @__PURE__ */ new Map();
      for (let i of r) s.set(i.path, i.data);
      for (let i of n) {
        let u = s.get(i.path);
        if (i.type === "delete") {
          s.set(i.path, void 0);
          continue;
        }
        let l;
        if (i.type === "create") {
          if (u !== void 0) throw bn(i.path);
          l = Ie({}, de(i.data));
        } else if (i.type === "set") l = i.merge && u ? Ie(JSON.parse(JSON.stringify(u)), de(i.data)) : Ie({}, de(i.data));
        else if (i.type === "update") {
          if (u === void 0) throw pr(i.path);
          l = JSON.parse(JSON.stringify(u));
          for (let [m, f] of Object.entries(de(i.data))) yn(l, m, f);
        } else throw new Error("bad op " + i.type);
        s.set(i.path, l);
      }
      let o = [], c = [];
      for (let i of a) {
        let u = s.get(i);
        if (u === void 0) {
          r.some((f) => f.path === i) && c.push(i);
          continue;
        }
        let { collection: l, id: m } = Ot(i);
        o.push({ path: i, collection: l, id: m, data: u });
      }
      let d = [];
      o.length && d.push(t`insert into public.docs (path, collection, id, data)
        select t.path, t.collection, t.id, t.data from jsonb_to_recordset(${t.json(o)}::jsonb) as t(path text, collection text, id text, data jsonb)
        on conflict (path) do update set data = excluded.data`), c.length && d.push(t`delete from public.docs where path = any(${c}::text[])`), await Promise.all(d);
    }
    async _one(t) {
      return this.sql.begin((n) => this._applyAll(n, [t]));
    }
    /** Reads first, writes buffered and applied atomically (retried on deadlock / serialization failure like Firestore). */
    async runTransaction(t) {
      for (let n = 0; ; n++)
        try {
          return await this.sql.begin(async (a) => {
            let r = [], s = {
              get: async (c) => c instanceof Ge ? new Le(c, await this._lockRead(a, c.path)) : c._exec(a),
              getAll: async (...c) => Promise.all(c.map(async (d) => new Le(d, await this._lockRead(a, d.path)))),
              set: (c, d, i = {}) => (r.push({ type: "set", path: c.path, data: d, merge: !!i.merge }), s),
              update: (c, d) => (r.push({ type: "update", path: c.path, data: d }), s),
              create: (c, d) => (r.push({ type: "create", path: c.path, data: d }), s),
              delete: (c) => (r.push({ type: "delete", path: c.path }), s)
            }, o = await t(s);
            return await this._applyAll(a, r), o;
          });
        } catch (a) {
          if ((a.code === "40P01" || a.code === "40001") && n < 4) {
            await new Promise((r) => setTimeout(r, 30 * (n + 1) + Math.random() * 40));
            continue;
          }
          throw a;
        }
    }
  }, Ge = class {
    constructor(t, n) {
      this.db = t, this.path = n, this.id = n.split("/").pop();
    }
    async get() {
      let t = await this.db.sql`select data from public.docs where path = ${this.path}`;
      return new Le(this, t.length ? t[0].data : void 0);
    }
    /** Plain overwrite = one atomic upsert statement (1 round trip, no transaction). */
    async set(t, n = {}) {
      if (n.merge) return this.db._one({ type: "set", path: this.path, data: t, merge: !0 });
      let { collection: a, id: r } = Ot(this.path);
      await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${a}, ${r}, ${this.db.sql.json(Ie({}, de(t)))}::jsonb)
                      on conflict (path) do update set data = excluded.data`;
    }
    update(t) {
      return this.db._one({ type: "update", path: this.path, data: t });
    }
    /** create = one `insert … on conflict do nothing` (1 round trip); no row back → ALREADY_EXISTS. */
    async create(t) {
      let { collection: n, id: a } = Ot(this.path);
      if (!(await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${n}, ${a}, ${this.db.sql.json(Ie({}, de(t)))}::jsonb)
                                on conflict (path) do nothing returning path`).length) throw bn(this.path);
    }
    delete() {
      return this.db._one({ type: "delete", path: this.path });
    }
    collection(t) {
      return new lt(this.db, `${this.path}/${t}`);
    }
  }, Dt = class e {
    constructor(t, n, a = [], r = [], s = null, o = null) {
      Object.assign(this, { db: t, path: n, f: a, o: r, lim: s, after: o });
    }
    where(t, n, a) {
      return new e(this.db, this.path, [...this.f, [t, n, de(a)]], this.o, this.lim, this.after);
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
      let a = (await t`select * from public.fs_query(${this.path}::text, ${t.json(this.f)}::jsonb, ${t.json(this.o)}::jsonb, ${this.lim}::int, ${this.after ? this.after.ref.path : null}::text)`).map((r) => new Le(new Ge(this.db, r.path), r.data));
      return { docs: a, empty: !a.length, size: a.length, forEach: (r) => a.forEach(r) };
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
        for (let [a, r] of Object.entries(t)) {
          let s = await this.db.sql`select public.fs_agg(${this.path}::text, ${this.db.sql.json(this.f)}::jsonb, ${r.aggregateType === "sum" ? r._field : null}::text) as a`;
          n[a] = r.aggregateType === "count" ? Number(s[0].a.count) : Number(s[0].a.sum);
        }
        return { data: () => n };
      } };
    }
  }, lt = class extends Dt {
    constructor(t, n) {
      super(t, n);
    }
    doc(t) {
      return new Ge(this.db, `${this.path}/${t || lr.randomBytes(10).toString("hex")}`);
    }
    async add(t) {
      let n = this.doc();
      return await n.set(t), n;
    }
  };
  Tn.exports = { PgDb: Mt, FieldValue: ur, AggregateField: mr, revive: ct, plain: de, merge: Ie, setPath: yn };
});

// supa/runtime.js
var ut = O((Qs, An) => {
  "use strict";
  var le = { sql: null, db: null, env: {}, fetch: (...e) => fetch(...e) };
  le.configure = ({ sql: e, env: t, fetch: n }) => {
    let { PgDb: a } = Ye();
    return le.sql = e, le.db = new a(e), le.env = t || {}, globalThis.__ENV = le.env, n && (le.fetch = n), le;
  };
  le.requireVerified = () => String(le.env.REQUIRE_VERIFIED || "0") === "1";
  An.exports = le;
});

// supa/shims/functions-https.js
var ne = O((eo, Sn) => {
  "use strict";
  var Ut = class extends Error {
    constructor(t, n, a) {
      super(n), this.code = t, this.details = a, this.name = "HttpsError";
    }
  }, hr = (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "call", n;
  }, gr = (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "request", n;
  };
  Sn.exports = { HttpsError: Ut, onCall: hr, onRequest: gr };
});

// supa/shims/functions-v1.js
var kn = O((to, Cn) => {
  "use strict";
  var vn = () => {
    let e = () => {
    };
    return e.__kind = "trigger", e;
  };
  Cn.exports = { region: () => ({ auth: { user: () => ({ onCreate: vn, onDelete: vn }) } }) };
});

// supa/shims/firebase-admin.js
var Pn = O((no, Bt) => {
  "use strict";
  var U = ut(), { FieldValue: $n, AggregateField: wr } = Ye(), En = () => U.db;
  En.FieldValue = $n;
  var yr = new Proxy(En, { get: (e, t) => t === "FieldValue" ? $n : t === "AggregateField" ? wr : U.db[t] && typeof U.db[t] == "function" ? U.db[t].bind(U.db) : e[t] }), In = (e) => e && {
    uid: e.id,
    email: e.email || "",
    emailVerified: !!e.email_confirmed_at || !U.requireVerified(),
    displayName: e.raw_user_meta_data && (e.raw_user_meta_data.displayName || e.raw_user_meta_data.name) || "",
    disabled: !!e.banned_until && new Date(e.banned_until).getTime() > Date.now(),
    customClaims: e.raw_app_meta_data || {}
  }, _n = (e) => {
    let t = new Error(e || "There is no user record");
    return t.code = "auth/user-not-found", t;
  }, br = {
    async getUser(e) {
      let t = await U.sql`select * from auth.users where id = ${e}::uuid`;
      if (!t.length) throw _n();
      return In(t[0]);
    },
    async getUserByEmail(e) {
      let t = await U.sql`select * from auth.users where lower(email) = lower(${e}) limit 1`;
      if (!t.length) throw _n();
      return In(t[0]);
    },
    async updateUser(e, t) {
      t.displayName !== void 0 && await U.sql`update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || ${U.sql.json({ displayName: t.displayName })}::jsonb where id = ${e}::uuid`, t.disabled !== void 0 && (await U.sql`update auth.users set banned_until = case when ${!!t.disabled}::boolean then 'infinity'::timestamptz else null end where id = ${e}::uuid`, U.tokenCache && U.tokenCache.clear());
    },
    async setCustomUserClaims(e, t) {
      await U.sql`update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || ${U.sql.json(t)}::jsonb where id = ${e}::uuid`;
    },
    /** Kills every session of the user: their refresh tokens stop working and the access token is rejected on the next call. */
    async revokeRefreshTokens(e) {
      await U.sql`delete from auth.sessions where user_id = ${e}::uuid`, U.tokenCache && U.tokenCache.clear();
    }
  }, Nn = (e) => e.startsWith("deposits/") ? { bucket: "deposits", name: e.slice(9) } : { bucket: "pub", name: e }, Tr = () => ({
    bucket: () => ({
      file: (e) => ({
        async exists() {
          let t = Nn(e);
          return [(await U.sql`select 1 from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`).length > 0];
        },
        async getMetadata() {
          let t = Nn(e), n = await U.sql`select metadata from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`, a = n[0] && n[0].metadata || {};
          return [{ contentType: a.mimetype || a.contentType || "", size: Number(a.size) || 0 }];
        }
      })
    })
  }), Ar = () => ({ sendEachForMulticast: async () => ({ responses: [] }) }), Rn = { apps: [1], initializeApp() {
  }, firestore: yr, auth: () => br, storage: Tr, messaging: Ar };
  Bt.exports = Rn;
  Bt.exports.default = Rn;
});

// src/util.js
var ae = O((ao, Mn) => {
  "use strict";
  var ze = Pn(), { HttpsError: Te } = ne();
  ze.apps.length || ze.initializeApp();
  var qe = ze.firestore(), je = ze.firestore.FieldValue, Sr = "asia-south1", On = ["main", "winning", "referral", "commission"], vr = ["super", "finance", "support", "content"], be = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, _e = (e) => new Te("invalid-argument", e);
  function Lt(e) {
    if (!e.auth) throw new Te("unauthenticated", "Please sign in.");
    return e.auth.uid;
  }
  function Cr(e) {
    let t = Lt(e);
    if (!e.auth.token.email_verified) throw new Te("failed-precondition", "Please verify your email first.");
    return t;
  }
  function kr(e, t) {
    let n = Lt(e), a = e.auth.token;
    if (a.admin !== !0 || !t.includes(a.role)) throw new Te("permission-denied", "You do not have permission.");
    return n;
  }
  function Ir(e, { min: t = 0.01, max: n = 1e9, label: a = "Amount" } = {}) {
    let r = Number(e);
    if (!Number.isFinite(r)) throw _e(`${a} must be a number.`);
    if (r < t) throw _e(`${a} must be at least ${t}.`);
    if (r > n) throw _e(`${a} must be at most ${n}.`);
    return be(r);
  }
  function _r(e, { min: t = 1, max: n = 200, label: a = "Value", pattern: r = null } = {}) {
    if (typeof e != "string") throw _e(`${a} is required.`);
    let s = e.trim();
    if (s.length < t || s.length > n) throw _e(`${a} must be ${t}-${n} characters.`);
    if (r && !r.test(s)) throw _e(`${a} has an invalid format.`);
    return s;
  }
  function Nr(e) {
    if (!e) throw new Te("not-found", "User profile not found.");
    if (e.status !== "active") throw new Te("permission-denied", "This account is not active.");
  }
  function $r(e, t, n = ["main", "winning"]) {
    let a = be(t);
    if (be(n.reduce((o, c) => o + (Number(e?.[c]) || 0), 0)) < a) throw new Te("failed-precondition", "Insufficient balance.");
    let s = {};
    for (let o of n) {
      let c = Math.min(Number(e?.[o]) || 0, a);
      if (c > 0 && (s[o] = be(c), a = be(a - c)), a <= 0) break;
    }
    return s;
  }
  function Er(e, t, n) {
    let a = {};
    for (let [r, s] of Object.entries(n)) {
      if (!On.includes(r)) throw new Error("bad bucket " + r);
      a[`balances.${r}`] = je.increment(be(s));
    }
    e.update(t, a);
  }
  function Rr(e, { uid: t, type: n, direction: a, amount: r, bucket: s = "main", note: o = "", ref: c = "" }) {
    e.set(qe.collection("transactions").doc(), {
      uid: t,
      type: n,
      direction: a,
      amount: be(r),
      bucket: s,
      note: o,
      ref: c,
      createdAt: je.serverTimestamp()
    });
  }
  function Pr(e, t, n, a, r = "info") {
    e.set(qe.collection("users").doc(t).collection("notifications").doc(), {
      title: n,
      body: a,
      type: r,
      read: !1,
      createdAt: je.serverTimestamp()
    });
  }
  function Or(e, t) {
    let n = {};
    for (let [a, r] of Object.entries(t)) n[a] = je.increment(r);
    e.set(qe.doc("stats/global"), n, { merge: !0 });
  }
  function Mr(e, t, n, a = {}) {
    let r = qe.collection("auditLogs").doc(), s = { actorUid: t, action: n, detail: a, at: je.serverTimestamp() };
    e ? e.set(r, s) : r.set(s);
  }
  async function Dr() {
    let e = await qe.doc("settings/site").get();
    return e.exists ? e.data() : {};
  }
  Mn.exports = {
    admin: ze,
    db: qe,
    FieldValue: je,
    HttpsError: Te,
    REGION: Sr,
    BUCKETS: On,
    STAFF_ROLES: vr,
    round2: be,
    bad: _e,
    authUid: Lt,
    requireVerified: Cr,
    requireRole: kr,
    amountOf: Ir,
    str: _r,
    assertActive: Nr,
    planDebit: $r,
    applyDelta: Er,
    ledger: Rr,
    notify: Pr,
    bumpStats: Or,
    audit: Mr,
    siteSettings: Dr
  };
});

// src/auth.js
var Bn = O((Je) => {
  "use strict";
  var Ur = kn(), { onCall: Un } = ne(), x = ae(), { db: X, admin: Gt, FieldValue: Ne, HttpsError: qt, REGION: jt } = x, Dn = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", Br = () => Array.from({ length: 8 }, () => Dn[fe("crypto").randomInt(0, Dn.length)]).join("");
  async function mt(e, t = "", n = "") {
    let a = X.doc(`users/${e}`);
    if ((await a.get()).exists) return;
    let r = null;
    for (let s = 0; s < 8 && !r; s++) {
      let o = Br();
      try {
        await X.doc(`referralCodes/${o}`).create({ uid: e }), r = o;
      } catch (c) {
        if (c.code !== 6 && !/ALREADY_EXISTS/.test(String(c))) throw c;
      }
    }
    if (!r) throw new qt("internal", "Could not allocate referral code.");
    await X.runTransaction(async (s) => {
      (await s.get(a)).exists || (s.set(a, {
        email: t,
        name: n,
        username: "",
        phone: "",
        photoURL: "",
        role: "user",
        status: "active",
        referralCode: r,
        referredBy: "",
        profileComplete: !1,
        signupRewardsGiven: !1,
        balances: { main: 0, winning: 0, referral: 0, commission: 0 },
        createdAt: Ne.serverTimestamp(),
        lastLoginAt: null,
        lastSeenAt: null
      }), x.bumpStats(s, { totalUsers: 1 }));
    });
  }
  Je.onAuthCreate = Ur.region(jt).auth.user().onCreate((e) => mt(e.uid, e.email || "", e.displayName || ""));
  Je.completeRegistration = Un({ region: jt }, async (e) => {
    let t = x.authUid(e), n = e.data || {}, a = x.str(n.name, { min: 2, max: 60, label: "Name" }), r = x.str(n.username, { min: 3, max: 20, label: "Username", pattern: /^[A-Za-z0-9_]+$/ }).toLowerCase(), s = x.str(n.phone, { min: 8, max: 16, label: "Phone", pattern: /^\+?[0-9]{8,15}$/ }), o = typeof n.referralCode == "string" ? n.referralCode.trim().toUpperCase() : "", c = await Gt.auth().getUser(t);
    await mt(t, c.email || "", a);
    let d = "";
    if (o) {
      let i = await X.doc(`referralCodes/${o}`).get();
      if (!i.exists) throw x.bad("Referral code not found.");
      if (i.data().uid === t) throw x.bad("You cannot use your own referral code.");
      d = i.data().uid;
    }
    return await X.runTransaction(async (i) => {
      let u = X.doc(`users/${t}`);
      if ((await i.get(u)).data().profileComplete) return;
      let m = X.doc(`usernames/${r}`);
      if ((await i.get(m)).exists) throw new qt("already-exists", "Username is already taken.");
      i.set(m, { uid: t }), i.update(u, { name: a, username: r, phone: s, referredBy: d, profileComplete: !0 });
    }), await Gt.auth().updateUser(t, { displayName: a }), { ok: !0 };
  });
  Je.bootstrap = Un({ region: jt }, async (e) => {
    let t = x.authUid(e), n = await Gt.auth().getUser(t);
    await mt(t, n.email || "", n.displayName || "");
    let a = X.doc(`users/${t}`), r = await x.siteSettings(), s = x.round2(Number(r.welcomeBonus) || 0), o = x.round2(Number(r.referral?.signupReward) || 0);
    if ((await X.runTransaction(async (i) => {
      let l = (await i.get(a)).data();
      if (l.status !== "active") return { banned: !0 };
      let m = n.emailVerified && l.profileComplete && !l.signupRewardsGiven, f = null;
      m && l.referredBy && o > 0 && (f = await i.get(X.doc(`users/${l.referredBy}`)));
      let p = { lastLoginAt: Ne.serverTimestamp(), lastSeenAt: Ne.serverTimestamp() };
      if (m && (p.signupRewardsGiven = !0, s > 0 && (p["balances.main"] = Ne.increment(s), x.ledger(i, { uid: t, type: "bonus", direction: "in", amount: s, bucket: "main", note: "Welcome bonus" }), x.notify(i, t, "Welcome!", `${s} welcome bonus has been added to your wallet.`, "bonus")), f && f.exists && f.data().status === "active")) {
        let w = l.referredBy;
        i.update(X.doc(`users/${w}`), { "balances.referral": Ne.increment(o) }), x.ledger(i, { uid: w, type: "referral", direction: "in", amount: o, bucket: "referral", note: `Referral: ${l.username}` }), x.notify(i, w, "New referral", `${l.username} joined with your code. +${o}`, "referral"), i.set(X.doc(`referrals/${t}`), {
          referrerUid: w,
          referredUid: t,
          referredName: l.username,
          rewardAmount: o,
          commissionTotal: 0,
          createdAt: Ne.serverTimestamp()
        }), x.bumpStats(i, { totalReferrals: 1 });
      }
      return i.update(a, p), { banned: !1 };
    })).banned) throw new qt("permission-denied", "This account is banned.");
    let d = (e.rawRequest?.headers?.["x-forwarded-for"] || e.rawRequest?.ip || "").toString().split(",")[0].trim();
    return await X.collection("loginHistory").add({
      uid: t,
      at: Ne.serverTimestamp(),
      ip: d,
      ua: (e.rawRequest?.headers?.["user-agent"] || "").toString().slice(0, 300)
    }), { ok: !0, emailVerified: n.emailVerified };
  });
  Je.ensureUserDoc = mt;
});

// src/wallet.js
var qn = O((Xe) => {
  "use strict";
  var { onCall: ft } = ne(), h = ae(), { db: R, admin: Lr, FieldValue: Ae, HttpsError: Z, REGION: pt } = h, Gn = (e, t) => e && e.enabled === !0 && [t, "both"].includes(e.type || "both"), xt = () => new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10), Ln = () => xt().slice(0, 7), pe = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  Xe.submitDeposit = ft({ region: pt }, async (e) => {
    let t = h.requireVerified(e), n = e.data || {}, a = h.str(n.methodId, { max: 80, label: "Method" }), r = n.accountId ? h.str(n.accountId, { max: 120, label: "Account" }) : "", s = h.amountOf(n.amount), o = h.str(n.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), c = typeof n.senderNumber == "string" ? n.senderNumber.trim().slice(0, 30) : "", d = h.str(n.screenshotPath, { max: 200, label: "Screenshot" });
    if (!d.startsWith(`deposits/${t}/`) || d.includes("..")) throw h.bad("Invalid screenshot path.");
    let i = Lr.storage().bucket().file(d), [u] = await i.exists();
    if (!u) throw new Z("failed-precondition", "Screenshot upload was not found. Please upload again.");
    let [l] = await i.getMetadata();
    if (!String(l.contentType || "").startsWith("image/")) throw h.bad("Screenshot must be an image.");
    let f = (await h.siteSettings()).deposit || {}, p = pe(f.min) || 1, w = pe(f.max) || 1e7;
    if (s < p || s > w) throw h.bad(`Amount must be between ${p} and ${w}.`);
    if ((await R.collection("deposits").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= 5) throw new Z("resource-exhausted", "Too many pending deposits. Please wait for review.");
    let g = new Date(Date.now() + 6 * 36e5);
    g.setUTCHours(0, 0, 0, 0);
    let $ = new Date(g.getTime() - 6 * 36e5), k = (await R.collection("deposits").where("uid", "==", t).where("createdAt", ">=", $).get()).docs.filter((y) => y.data().status !== "rejected").reduce((y, C) => y + pe(C.data().amount), 0), M = (await R.doc(`users/${t}`).get()).data()?.dupTrx || {};
    if (M.blockedUntil && M.blockedUntil > Date.now()) throw new Z("permission-denied", `Deposits are blocked until ${new Date(M.blockedUntil).toISOString().slice(0, 16).replace("T", " ")} UTC because of repeated duplicate transaction IDs.`);
    if ((await R.doc(`trxIndex/${a}_${o}`).get()).exists) {
      let y = M.lastAt && M.lastAt > Date.now() - 864e5 ? (M.count || 0) + 1 : 1, C = { "dupTrx.count": y, "dupTrx.lastAt": Date.now() };
      throw y >= 2 && (C["dupTrx.blockedUntil"] = Date.now() + 864e5), await R.doc(`users/${t}`).update(C), await R.doc("stats/global").set({ duplicateAttempts: Ae.increment(1) }, { merge: !0 }), h.audit(null, t, "duplicate_trx_attempt", { methodId: a, trxId: o, count: y }), new Z("already-exists", y >= 2 ? "This transaction ID was already used. Deposits are blocked for 24 hours." : "This transaction ID was already used. Another attempt will block deposits for 24 hours.");
    }
    let B = R.collection("deposits").doc();
    return await R.runTransaction(async (y) => {
      let C = [y.get(R.doc(`paymentMethods/${a}`)), y.get(R.doc(`users/${t}`)), y.get(R.doc(`trxIndex/${a}_${o}`))];
      r && C.push(y.get(R.doc(`paymentAccounts/${r}`)));
      let [L, ee, me, J] = await Promise.all(C);
      h.assertActive(ee.data());
      let Y = L.data();
      if (!L.exists || !Gn(Y, "deposit")) throw h.bad("This payment method is not available.");
      if (Y.minAmount && s < Y.minAmount) throw h.bad(`Minimum for ${Y.name} is ${Y.minAmount}.`);
      if (Y.maxAmount && s > Y.maxAmount) throw h.bad(`Maximum for ${Y.name} is ${Y.maxAmount}.`);
      let Ue = ee.data().rg || {}, Be = Ue.pendingLimitAt && Ue.pendingLimitAt <= Date.now() ? pe(Ue.pendingLimit) : pe(Ue.dailyDepositLimit);
      if (Be > 0 && k + s > Be) throw new Z("failed-precondition", `Your daily deposit limit is ${Be}. Remaining today: ${Math.max(0, h.round2(Be - k))}.`);
      if (me.exists) throw new Z("already-exists", "This transaction ID has already been submitted.");
      let mn = Y.accountNumber || "", fn = "";
      if (r) {
        let te = J && J.exists ? J.data() : null;
        if (!te || te.status !== "active" || te.methodId !== a) throw new Z("failed-precondition", "This payment account is no longer available. Please choose again.");
        let pn = te.usedTodayKey === xt() ? pe(te.usedToday) : 0, hn = te.usedMonthKey === Ln() ? pe(te.usedMonth) : 0;
        if (pn + s > pe(te.dailyLimit) || hn + s > pe(te.monthlyLimit)) throw new Z("failed-precondition", "This account reached its limit. Please choose again.");
        y.update(J.ref, {
          usedToday: h.round2(pn + s),
          usedTodayKey: xt(),
          usedMonth: h.round2(hn + s),
          usedMonthKey: Ln(),
          totalDeposits: Ae.increment(1),
          totalCollected: Ae.increment(s),
          lastUsedAt: Date.now()
        }), mn = te.accountNumber || "", fn = te.holderName || "";
      }
      y.set(R.doc(`trxIndex/${a}_${o}`), { uid: t, depositId: B.id }), y.set(B, {
        uid: t,
        username: ee.data().username,
        methodId: a,
        methodName: Y.name,
        accountId: r,
        accountNumber: mn,
        holderName: fn,
        amount: s,
        trxId: o,
        senderNumber: c,
        screenshotPath: d,
        status: "pending",
        note: "",
        createdAt: Ae.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), h.notify(y, t, "Deposit submitted", `${s} is waiting for approval.`, "deposit"), h.bumpStats(y, { pendingDeposits: 1 });
    }), { ok: !0, depositId: B.id };
  });
  Xe.reviewDeposit = ft({ region: pt }, async (e) => {
    let t = h.requireRole(e, ["super", "finance"]), n = e.data || {}, a = h.str(n.depositId, { max: 80 }), r = n.action === "approve";
    if (!r && n.action !== "reject") throw h.bad("Invalid action.");
    let s = typeof n.note == "string" ? n.note.trim().slice(0, 300) : "", o = await h.siteSettings(), c = Number(o.referral?.depositCommissionPct) || 0;
    return await R.runTransaction(async (d) => {
      let i = R.doc(`deposits/${a}`), u = await d.get(i);
      if (!u.exists) throw new Z("not-found", "Deposit not found.");
      let l = u.data();
      if (l.status !== "pending") throw new Z("failed-precondition", `Already ${l.status}.`);
      let m = R.doc(`users/${l.uid}`), f = await d.get(m), p = null, w = null;
      r && c > 0 && f.data().referredBy && (p = await d.get(R.doc(`users/${f.data().referredBy}`)), w = await d.get(R.doc(`referrals/${l.uid}`)));
      let T = { status: r ? "approved" : "rejected", note: s, reviewedAt: Ae.serverTimestamp(), reviewedBy: t };
      if (d.update(i, T), r) {
        if (h.applyDelta(d, m, { main: l.amount }), h.ledger(d, { uid: l.uid, type: "deposit", direction: "in", amount: l.amount, bucket: "main", note: l.methodName, ref: a }), h.notify(d, l.uid, "Deposit approved", `${l.amount} has been added to your wallet.`, "deposit"), h.bumpStats(d, { totalDeposits: l.amount, depositCount: 1, pendingDeposits: -1 }), p && p.exists && p.data().status === "active") {
          let g = h.round2(l.amount * c / 100);
          g > 0 && (h.applyDelta(d, p.ref, { commission: g }), h.ledger(d, { uid: p.id, type: "commission", direction: "in", amount: g, bucket: "commission", note: `Deposit by ${f.data().username}`, ref: a }), h.notify(d, p.id, "Referral commission", `+${g} from ${f.data().username}'s deposit.`, "referral"), w && w.exists && d.update(w.ref, { commissionTotal: Ae.increment(g) }), h.bumpStats(d, { commissionPaid: g }));
        }
      } else
        d.delete(R.doc(`trxIndex/${l.methodId}_${l.trxId}`)), h.notify(d, l.uid, "Deposit rejected", s || "Your deposit request was rejected.", "deposit"), h.bumpStats(d, { pendingDeposits: -1 });
      h.audit(d, t, r ? "deposit_approved" : "deposit_rejected", { depositId: a, amount: l.amount, uid: l.uid });
    }), { ok: !0 };
  });
  Xe.requestWithdraw = ft({ region: pt }, async (e) => {
    let t = h.requireVerified(e), n = e.data || {}, a = h.str(n.methodId, { max: 80, label: "Method" }), r = n.bucket ? h.str(n.bucket, { max: 20, label: "Wallet" }) : "auto", s = h.amountOf(n.amount), o = h.str(n.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }), c = typeof n.holderName == "string" ? n.holderName.trim().slice(0, 60) : "", i = (await h.siteSettings()).withdraw || {}, u = i.allowedBuckets || ["winning", "referral", "commission"];
    if (r !== "auto" && !u.includes(r)) throw h.bad("This wallet cannot be withdrawn from.");
    let l = h.round2(s * (Number(i.feePct) || 0) / 100 + (Number(i.feeFlat) || 0));
    if (l >= s) throw h.bad("Amount is too small after fees.");
    if ((await R.collection("withdrawals").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= 3) throw new Z("resource-exhausted", "You have too many pending withdrawals.");
    let f = R.collection("withdrawals").doc();
    return await R.runTransaction(async (p) => {
      let [w, T] = await Promise.all([p.get(R.doc(`paymentMethods/${a}`)), p.get(R.doc(`users/${t}`))]);
      h.assertActive(T.data());
      let g = w.data();
      if (!w.exists || !Gn(g, "withdraw")) throw h.bad("This withdraw method is not available.");
      let $ = Math.max(Number(i.min) || 0, g.withdrawMin || 0), A = Math.min(Number(i.max) || 1 / 0, g.withdrawMax || 1 / 0);
      if (s < $ || s > A) throw h.bad(`Amount must be between ${$} and ${A === 1 / 0 ? "\u221E" : A}.`);
      let k = r === "auto" ? u : [r], E = h.planDebit(T.data().balances, s, k), M = {};
      for (let [B, y] of Object.entries(E)) M[B] = -y;
      h.applyDelta(p, T.ref, M), h.ledger(p, { uid: t, type: "withdraw_hold", direction: "out", amount: s, bucket: Object.keys(E)[0], note: g.name, ref: f.id }), h.notify(p, t, "Withdrawal requested", `${s} is waiting for approval (you receive ${h.round2(s - l)}).`, "withdraw"), p.set(f, {
        uid: t,
        username: T.data().username,
        methodId: a,
        methodName: g.name,
        bucket: Object.keys(E)[0],
        plan: E,
        holderName: c,
        accountNumber: o,
        amount: s,
        fee: l,
        net: h.round2(s - l),
        status: "pending",
        note: "",
        createdAt: Ae.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), h.bumpStats(p, { pendingWithdrawals: 1 });
    }), { ok: !0, withdrawalId: f.id, fee: l, net: h.round2(s - l) };
  });
  Xe.reviewWithdrawal = ft({ region: pt }, async (e) => {
    let t = h.requireRole(e, ["super", "finance"]), n = e.data || {}, a = h.str(n.withdrawalId, { max: 80 }), r = n.action === "approve";
    if (!r && n.action !== "reject") throw h.bad("Invalid action.");
    let s = typeof n.note == "string" ? n.note.trim().slice(0, 300) : "";
    return await R.runTransaction(async (o) => {
      let c = R.doc(`withdrawals/${a}`), d = await o.get(c);
      if (!d.exists) throw new Z("not-found", "Withdrawal not found.");
      let i = d.data();
      if (i.status !== "pending") throw new Z("failed-precondition", `Already ${i.status}.`);
      o.update(c, { status: r ? "approved" : "rejected", note: s, reviewedAt: Ae.serverTimestamp(), reviewedBy: t }), r ? (h.notify(o, i.uid, "Withdrawal approved", `${i.net} is on its way to ${i.accountNumber}.`, "withdraw"), h.ledger(o, { uid: i.uid, type: "withdraw", direction: "out", amount: 0, bucket: i.bucket, note: `Paid ${i.net} (fee ${i.fee})`, ref: a }), h.bumpStats(o, { totalWithdrawals: i.amount, feesCollected: i.fee, withdrawCount: 1, pendingWithdrawals: -1 })) : (h.applyDelta(o, R.doc(`users/${i.uid}`), i.plan && Object.keys(i.plan).length ? i.plan : { [i.bucket]: i.amount }), h.ledger(o, { uid: i.uid, type: "withdraw_refund", direction: "in", amount: i.amount, bucket: i.bucket, note: "Withdrawal rejected", ref: a }), h.notify(o, i.uid, "Withdrawal rejected", s || "Your withdrawal was rejected and the amount was returned.", "withdraw"), h.bumpStats(o, { pendingWithdrawals: -1 })), h.audit(o, t, r ? "withdraw_approved" : "withdraw_rejected", { withdrawalId: a, amount: i.amount, uid: i.uid });
    }), { ok: !0 };
  });
});

// supa/shims/functions-firestore.js
var xn = O((oo, jn) => {
  "use strict";
  jn.exports = { onDocumentCreated: (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "trigger", n;
  } };
});

// src/admin.js
var Hn = O((xe) => {
  "use strict";
  var { onCall: ht } = ne(), { onDocumentCreated: Gr } = xn(), _ = ae(), { db: he, admin: $e, FieldValue: qr, HttpsError: Fn, REGION: Ze } = _;
  xe.adminAdjustBalance = ht({ region: Ze }, async (e) => {
    let t = _.requireRole(e, ["super", "finance"]), n = e.data || {}, a = _.str(n.uid, { max: 128 }), r = _.str(n.bucket, { max: 20 });
    if (!_.BUCKETS.includes(r)) throw _.bad("Invalid wallet.");
    let s = _.amountOf(Math.abs(Number(n.delta)), { min: 0.01, max: 1e7, label: "Amount" }) * (Number(n.delta) < 0 ? -1 : 1), o = _.str(n.reason, { min: 3, max: 200, label: "Reason" });
    return await he.runTransaction(async (c) => {
      let d = he.doc(`users/${a}`), i = await c.get(d);
      if (!i.exists) throw new Fn("not-found", "User not found.");
      if (_.round2((i.data().balances?.[r] || 0) + s) < 0) throw _.bad("Balance cannot go below zero.");
      _.applyDelta(c, d, { [r]: s }), _.ledger(c, { uid: a, type: "admin_adjust", direction: s > 0 ? "in" : "out", amount: Math.abs(s), bucket: r, note: o }), _.notify(c, a, "Balance updated", `${s > 0 ? "+" : ""}${s} (${o})`, "info"), _.audit(c, t, "balance_adjust", { uid: a, bucket: r, delta: s, reason: o });
    }), { ok: !0 };
  });
  xe.setUserStatus = ht({ region: Ze }, async (e) => {
    let t = _.requireRole(e, ["super", "support"]), n = e.data || {}, a = _.str(n.uid, { max: 128 }), r = n.banned === !0, s = typeof n.reason == "string" ? n.reason.trim().slice(0, 200) : "";
    if ((await $e.auth().getUser(a)).customClaims?.admin) throw new Fn("permission-denied", "Staff accounts cannot be banned here.");
    return await he.doc(`users/${a}`).update({ status: r ? "banned" : "active", banReason: r ? s : "" }), await $e.auth().updateUser(a, { disabled: r }), r && await $e.auth().revokeRefreshTokens(a), _.audit(null, t, r ? "user_banned" : "user_unbanned", { uid: a, reason: s }), { ok: !0 };
  });
  xe.setStaffRole = ht({ region: Ze }, async (e) => {
    let t = _.requireRole(e, ["super"]), n = e.data || {}, a = await $e.auth().getUserByEmail(_.str(n.email, { max: 200, label: "Email" })), r = n.role === null ? null : _.str(n.role, { max: 20 });
    if (r && !_.STAFF_ROLES.includes(r)) throw _.bad("Invalid role.");
    if (a.uid === t && r !== "super") throw _.bad("You cannot demote yourself.");
    return await $e.auth().setCustomUserClaims(a.uid, r ? { admin: !0, role: r } : { admin: !1, role: null }), await $e.auth().revokeRefreshTokens(a.uid), await he.doc(`users/${a.uid}`).set({ role: r || "user" }, { merge: !0 }), _.audit(null, t, "staff_role", { uid: a.uid, role: r }), { ok: !0 };
  });
  xe.adminNotify = ht({ region: Ze, timeoutSeconds: 300 }, async (e) => {
    let t = _.requireRole(e, ["super", "support"]), n = e.data || {}, a = _.str(n.title, { max: 80, label: "Title" }), r = _.str(n.body, { max: 400, label: "Message" }), s = (c) => ({ ref: he.collection("users").doc(c).collection("notifications").doc(), data: { title: a, body: r, type: "announcement", read: !1, createdAt: qr.serverTimestamp() } }), o = 0;
    if (n.uid) {
      let c = s(String(n.uid));
      await c.ref.set(c.data), o = 1;
    } else {
      let c = null;
      for (; ; ) {
        let d = he.collection("users").where("status", "==", "active").orderBy("__name__").limit(400);
        c && (d = d.startAfter(c));
        let i = await d.get();
        if (i.empty) break;
        let u = he.batch();
        i.docs.forEach((l) => {
          let m = s(l.id);
          u.set(m.ref, m.data);
        }), await u.commit(), o += i.size, c = i.docs[i.docs.length - 1];
      }
    }
    return _.audit(null, t, "notify", { title: a, recipients: o }), { ok: !0, recipients: o };
  });
  xe.pushOnNotification = Gr({ document: "users/{uid}/notifications/{nid}", region: Ze }, async (e) => {
    let t = e.data?.data();
    if (!t) return;
    let a = (await he.collection("users").doc(e.params.uid).collection("devices").get()).docs.map((o) => o.id);
    if (!a.length) return;
    let r = await $e.messaging().sendEachForMulticast({ tokens: a, notification: { title: t.title, body: t.body } }), s = [];
    r.responses.forEach((o, c) => {
      !o.success && /registration-token-not-registered|invalid-registration-token/.test(o.error?.code || "") && s.push(a[c]);
    }), await Promise.all(s.map((o) => he.doc(`users/${e.params.uid}/devices/${o}`).delete()));
  });
});

// src/math.js
var Yn = O((co, Kn) => {
  "use strict";
  var Vn = fe("crypto"), Ft = {
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
  }, jr = 0.99, Ht = () => Vn.randomInt(0, 2 ** 32) / 2 ** 32;
  function Vt(e) {
    let t = [], n = 1;
    for (let a = 0; a <= e; a++)
      t.push(n / 2 ** e), n = n * (e - a) / (a + 1);
    return t;
  }
  var xr = { low: { base: 1, spread: 4, e: 2 }, medium: { base: 0.4, spread: 30, e: 3 }, high: { base: 0.15, spread: 300, e: 4.5 } };
  function Wn(e, t, n, a = 1e3) {
    let r = xr[t];
    if (!r) throw new Error("bad risk");
    let s = Vt(e), o = s.map((d, i) => r.base + Math.pow(Math.abs(i - e / 2) / (e / 2), r.e) * r.spread), c = o.reduce((d, i, u) => d + i * s[u], 0);
    return o.map((d) => Math.min(a, Math.round(d * n / c * 100) / 100));
  }
  function Fr(e, t, n, a) {
    let r = Wn(e, t, n, a), s = Vt(e);
    return r.reduce((o, c, d) => o + c * s[d], 0);
  }
  function Hr(e) {
    let t = [];
    for (let n = 0; n < e; n++) t.push(Vn.randomInt(0, 2));
    return { path: t, slot: t.reduce((n, a) => n + a, 0) };
  }
  function Vr(e) {
    let t = e.reduce((n, a) => n + a.weight, 0);
    return e.reduce((n, a) => n + a.mult * a.weight, 0) / t;
  }
  function Wr(e) {
    let t = e.reduce((a, r) => a + r.weight, 0), n = Ht() * t;
    for (let a = 0; a < e.length; a++)
      if (n -= e[a].weight, n < 0) return a;
    return e.length - 1;
  }
  function Kr(e, t = 1e3) {
    let n = Ht();
    return Math.min(t, Math.max(1, Math.floor(100 * e / (1 - n)) / 100));
  }
  var Yr = (e, t) => Math.floor(Math.exp(t * e) * 100) / 100, zr = (e, t) => Math.log(e) / t;
  function Jr(e = {}) {
    let t = { ...Ft, ...e };
    for (let n of ["plinko", "wheel", "rocket"]) t[n] = { ...Ft[n], ...e[n] || {} };
    return t;
  }
  Kn.exports = {
    DEFAULTS: Ft,
    MAX_RTP: jr,
    binomProbs: Vt,
    plinkoTable: Wn,
    plinkoRtp: Fr,
    plinkoDrop: Hr,
    wheelRtp: Vr,
    wheelSpin: Wr,
    rocketCrashPoint: Kr,
    rocketMultiplierAt: Yr,
    rocketCrashTimeMs: zr,
    mergeConfig: Jr,
    randFloat: Ht
  };
});

// src/games.js
var Jn = O((Ee) => {
  "use strict";
  var { onCall: Fe } = ne(), P = ae(), re = Yn(), { db: G, FieldValue: Wt, HttpsError: gt, REGION: He } = P;
  async function wt() {
    let e = await G.doc("settings/games").get();
    return re.mergeConfig(e.exists ? e.data() : {});
  }
  function Kt(e, t, n) {
    let a = e[t];
    if (!a.enabled) throw new gt("failed-precondition", "This game is currently disabled.");
    if (e.rtp > re.MAX_RTP) throw new gt("failed-precondition", "Game configuration is invalid.");
    if (n < a.minBet || n > a.maxBet) throw P.bad(`Bet must be between ${a.minBet} and ${a.maxBet}.`);
  }
  function Yt(e, t, n, a, r, s, o) {
    let c = P.planDebit(n.balances, r, ["main", "winning"]), d = {};
    for (let [i, u] of Object.entries(c)) d[i] = -u;
    P.applyDelta(e, t, d), P.ledger(e, { uid: a, type: "bet", direction: "out", amount: r, bucket: Object.keys(c)[0], note: s, ref: o }), P.bumpStats(e, { betVolume: r });
  }
  function zt(e, t, n, a, r, s) {
    a <= 0 || (P.applyDelta(e, t, { winning: a }), P.ledger(e, { uid: n, type: "win", direction: "in", amount: a, bucket: "winning", note: r, ref: s }), P.bumpStats(e, { winPayout: a }));
  }
  Ee.getGameConfig = Fe({ region: He }, async (e) => {
    P.authUid(e);
    let t = await wt(), n = {};
    for (let a of t.plinko.rows) {
      n[a] = {};
      for (let r of ["low", "medium", "high"]) n[a][r] = re.plinkoTable(a, r, t.rtp, t.plinko.maxMultiplier);
    }
    return { rtp: t.rtp, plinko: { ...t.plinko, tables: n }, wheel: t.wheel, rocket: t.rocket };
  });
  Ee.playPlinko = Fe({ region: He }, async (e) => {
    let t = P.requireVerified(e), n = e.data || {}, a = await wt(), r = P.amountOf(n.bet, { label: "Bet" });
    Kt(a, "plinko", r);
    let s = Number(n.rows), o = String(n.risk);
    if (!a.plinko.rows.includes(s) || !["low", "medium", "high"].includes(o)) throw P.bad("Invalid Plinko settings.");
    let c = re.plinkoTable(s, o, a.rtp, a.plinko.maxMultiplier), d = re.plinkoDrop(s), i = c[d.slot], u = P.round2(r * i), l = G.collection("gameHistory").doc();
    return await G.runTransaction(async (m) => {
      let f = G.doc(`users/${t}`), p = await m.get(f);
      P.assertActive(p.data()), Yt(m, f, p.data(), t, r, "plinko", l.id), zt(m, f, t, u, "plinko", l.id), m.set(l, { uid: t, game: "plinko", bet: r, payout: u, multiplier: i, status: "settled", detail: { rows: s, risk: o, path: d.path, slot: d.slot }, at: Wt.serverTimestamp() });
    }), { path: d.path, slot: d.slot, multiplier: i, payout: u, historyId: l.id };
  });
  Ee.playWheel = Fe({ region: He }, async (e) => {
    let t = P.requireVerified(e), n = e.data || {}, a = await wt(), r = P.amountOf(n.bet, { label: "Bet" });
    Kt(a, "wheel", r);
    let s = a.wheel.segments;
    if (!Array.isArray(s) || s.length < 2 || re.wheelRtp(s) > re.MAX_RTP) throw new gt("failed-precondition", "Wheel configuration is invalid.");
    let o = re.wheelSpin(s), c = s[o].mult, d = P.round2(r * c), i = G.collection("gameHistory").doc();
    return await G.runTransaction(async (u) => {
      let l = G.doc(`users/${t}`), m = await u.get(l);
      P.assertActive(m.data()), Yt(u, l, m.data(), t, r, "wheel", i.id), zt(u, l, t, d, "wheel", i.id), u.set(i, { uid: t, game: "wheel", bet: r, payout: d, multiplier: c, status: "settled", detail: { segment: o, label: s[o].label }, at: Wt.serverTimestamp() });
    }), { segment: o, label: s[o].label, multiplier: c, payout: d, historyId: i.id };
  });
  Ee.rocketStart = Fe({ region: He }, async (e) => {
    let t = P.requireVerified(e), n = e.data || {}, a = await wt(), r = P.amountOf(n.bet, { label: "Bet" });
    Kt(a, "rocket", r);
    let s = re.rocketCrashPoint(a.rtp, a.rocket.maxMultiplier), o = G.collection("rocketRounds").doc().id, c = Date.now();
    return await G.runTransaction(async (d) => {
      let i = G.doc(`users/${t}`), u = await d.get(i);
      P.assertActive(u.data()), Yt(d, i, u.data(), t, r, "rocket", o), d.set(G.doc(`rocketRounds/${o}`), { uid: t, bet: r, startedAt: c, status: "running", growth: a.rocket.growth }), d.set(G.doc(`rocketSecrets/${o}`), { crash: s }), d.set(G.doc(`gameHistory/${o}`), { uid: t, game: "rocket", bet: r, payout: 0, multiplier: 0, status: "running", detail: {}, at: Wt.serverTimestamp() });
    }), { roundId: o, startedAt: c, growth: a.rocket.growth };
  });
  async function zn(e, t, n) {
    return G.runTransaction(async (a) => {
      let r = G.doc(`rocketRounds/${t}`), [s, o] = await Promise.all([a.get(r), a.get(G.doc(`rocketSecrets/${t}`))]);
      if (!s.exists || s.data().uid !== e) throw new gt("not-found", "Round not found.");
      let c = s.data(), d = o.data().crash;
      if (c.status !== "running") return { status: c.status, crash: c.status === "running" ? void 0 : d, multiplier: c.cashedAt || null, payout: c.payout || 0 };
      let i = Date.now() - c.startedAt, u = re.rocketCrashTimeMs(d, c.growth), l = G.doc(`gameHistory/${t}`);
      if (i >= u)
        return a.update(r, { status: "crashed", payout: 0 }), a.update(l, { status: "settled", detail: { crash: d } }), { status: "crashed", crash: d, payout: 0 };
      let m = re.rocketMultiplierAt(i, c.growth);
      if (!n) return { status: "running", multiplier: m };
      let f = P.round2(c.bet * m);
      return zt(a, G.doc(`users/${e}`), e, f, "rocket", t), a.update(r, { status: "cashed", payout: f, cashedAt: m }), a.update(l, { status: "settled", payout: f, multiplier: m, detail: { crash: d } }), { status: "cashed", multiplier: m, payout: f, crash: d };
    });
  }
  Ee.rocketPoll = Fe({ region: He }, (e) => zn(P.authUid(e), P.str((e.data || {}).roundId, { max: 80 }), !1));
  Ee.rocketCashout = Fe({ region: He }, (e) => zn(P.requireVerified(e), P.str((e.data || {}).roundId, { max: 80 }), !0));
});

// src/engagement.js
var Xn = O((et) => {
  "use strict";
  var Xr = fe("crypto"), { onCall: yt } = ne(), v = ae(), { db: q, FieldValue: Qe, HttpsError: se, REGION: bt } = v;
  et.buyLotteryTickets = yt({ region: bt }, async (e) => {
    let t = v.requireVerified(e), n = e.data || {}, a = v.str(n.lotteryId, { max: 80 }), r = Math.floor(v.amountOf(n.qty, { min: 1, max: 50, label: "Quantity" })), s = [];
    return await q.runTransaction(async (o) => {
      let c = q.doc(`lotteries/${a}`), d = q.doc(`users/${t}`), [i, u] = await Promise.all([o.get(c), o.get(d)]);
      v.assertActive(u.data());
      let l = i.data();
      if (!i.exists || l.status !== "open") throw new se("failed-precondition", "This lottery is closed.");
      if (l.endsAt && l.endsAt.toMillis() <= Date.now()) throw new se("failed-precondition", "This lottery has ended.");
      if ((l.sold || 0) + r > l.totalTickets) throw new se("failed-precondition", "Not enough tickets left.");
      let m = u.data().rg?.excludedUntil;
      if ((m?.toMillis ? m.toMillis() : Number(m) || 0) > Date.now()) throw new se("failed-precondition", "You are on a self-exclusion break.");
      if (Number(l.maxPerUser) > 0 && (await o.get(q.collection("lotteryTickets").where("lotteryId", "==", a).where("uid", "==", t).count())).data().count + r > Number(l.maxPerUser))
        throw new se("failed-precondition", `Maximum ${l.maxPerUser} tickets per player.`);
      let f = v.round2(l.price * r), p = v.planDebit(u.data().balances, f, ["main", "winning"]), w = {};
      for (let [T, g] of Object.entries(p)) w[T] = -g;
      v.applyDelta(o, d, w), v.ledger(o, { uid: t, type: "lottery", direction: "out", amount: f, bucket: Object.keys(p)[0], note: l.title, ref: a });
      for (let T = 1; T <= r; T++) {
        let g = (l.sold || 0) + T;
        s.push(g), o.set(q.collection("lotteryTickets").doc(), { lotteryId: a, lotteryTitle: l.title, uid: t, number: g, price: l.price, status: "active", createdAt: Qe.serverTimestamp() });
      }
      o.update(c, { sold: Qe.increment(r) }), v.bumpStats(o, { lotterySales: f });
    }), { ok: !0, numbers: s };
  });
  et.adminDrawLottery = yt({ region: bt, timeoutSeconds: 120 }, async (e) => {
    let t = v.requireRole(e, ["super", "finance"]), n = v.str((e.data || {}).lotteryId, { max: 80 });
    return { ok: !0, winnerTicket: (await q.runTransaction(async (r) => {
      let s = q.doc(`lotteries/${n}`), o = await r.get(s), c = o.data();
      if (!o.exists || !["open", "closed"].includes(c.status)) throw new se("failed-precondition", "Lottery cannot be drawn.");
      let d = await r.get(q.collection("lotteryTickets").where("lotteryId", "==", n).where("status", "==", "active"));
      if (d.empty) throw new se("failed-precondition", "No tickets sold.");
      let i = d.docs[Xr.randomInt(0, d.size)], u = i.data(), l = v.round2(c.prize), m = q.doc(`users/${u.uid}`), f = await r.get(m);
      return v.applyDelta(r, m, { winning: l }), v.ledger(r, { uid: u.uid, type: "lottery_win", direction: "in", amount: l, bucket: "winning", note: c.title, ref: n }), v.notify(r, u.uid, "You won the lottery! \u{1F389}", `${c.title}: ${l} added to your winnings.`, "lottery"), r.update(i.ref, { status: "won" }), r.update(s, { status: "drawn", winnerUid: u.uid, winnerName: f.data().username || "", winnerTicket: u.number, drawnAt: Qe.serverTimestamp() }), v.bumpStats(r, { lotteryPayout: l }), v.audit(r, t, "lottery_drawn", { lotteryId: n, winner: u.uid, prize: l }), { winnerTicket: u.number, winnerUid: u.uid };
    })).winnerTicket };
  });
  et.adminCancelLottery = yt({ region: bt, timeoutSeconds: 300 }, async (e) => {
    let t = v.requireRole(e, ["super", "finance"]), n = v.str((e.data || {}).lotteryId, { max: 80 });
    await q.runTransaction(async (r) => {
      let s = await r.get(q.doc(`lotteries/${n}`));
      if (!s.exists || !["open", "closed"].includes(s.data().status)) throw new se("failed-precondition", "Lottery cannot be cancelled.");
      r.update(s.ref, { status: "cancelled" });
    });
    let a = 0;
    for (; ; ) {
      let r = await q.collection("lotteryTickets").where("lotteryId", "==", n).where("status", "==", "active").limit(100).get();
      if (r.empty) break;
      let s = {};
      r.docs.forEach((o) => {
        (s[o.data().uid] ||= []).push(o);
      });
      for (let [o, c] of Object.entries(s))
        await q.runTransaction(async (d) => {
          let u = (await d.getAll(...c.map((m) => m.ref))).filter((m) => m.data().status === "active");
          if (!u.length) return;
          let l = v.round2(u.reduce((m, f) => m + f.data().price, 0));
          v.applyDelta(d, q.doc(`users/${o}`), { main: l }), v.ledger(d, { uid: o, type: "lottery_refund", direction: "in", amount: l, bucket: "main", note: "Lottery cancelled", ref: n }), v.notify(d, o, "Lottery cancelled", `${l} was refunded to your wallet.`, "lottery"), u.forEach((m) => d.update(m.ref, { status: "refunded" })), a += u.length;
        });
    }
    return v.audit(null, t, "lottery_cancelled", { lotteryId: n, refundedTickets: a }), { ok: !0, refundedTickets: a };
  });
  et.claimBonus = yt({ region: bt }, async (e) => {
    let t = v.requireVerified(e), n = v.str((e.data || {}).bonusId, { max: 80 }), a = { once: 1 / 0, daily: 24 * 36e5, weekly: 168 * 36e5 }, r = 0;
    return await q.runTransaction(async (s) => {
      let [o, c, d] = await Promise.all([s.get(q.doc(`bonuses/${n}`)), s.get(q.doc(`users/${t}`)), s.get(q.doc(`bonusClaims/${t}_${n}`))]);
      v.assertActive(c.data());
      let i = o.data();
      if (!o.exists || !i.enabled) throw new se("failed-precondition", "This bonus is not available.");
      let u = i.type in a ? i.type : "once";
      if (d.exists) {
        if (u === "once") throw new se("already-exists", "You already claimed this bonus.");
        let l = d.data().lastClaimAt.toMillis() + a[u] - Date.now();
        if (l > 0) throw new se("failed-precondition", `Available again in ${Math.ceil(l / 6e4)} min.`);
      }
      r = v.round2(i.amount), v.applyDelta(s, c.ref, { main: r }), v.ledger(s, { uid: t, type: "bonus", direction: "in", amount: r, bucket: "main", note: i.title, ref: n }), s.set(d.ref, { uid: t, bonusId: n, lastClaimAt: Qe.serverTimestamp(), count: Qe.increment(1) }, { merge: !0 }), v.bumpStats(s, { bonusPaid: r });
    }), { ok: !0, amount: r };
  });
});

// supa/shims/functions-scheduler.js
var Qn = O((mo, Zn) => {
  "use strict";
  Zn.exports = { onSchedule: (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "schedule", n;
  } };
});

// supa/shims/firebase-admin-firestore.js
var ta = O((fo, ea) => {
  "use strict";
  var { AggregateField: Zr, FieldValue: Qr } = Ye();
  ea.exports = { AggregateField: Zr, FieldValue: Qr };
});

// src/ag/errors.js
var Ve = O((po, aa) => {
  "use strict";
  var Tt = {
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
  }, na = (e) => Tt[e] || { msg: "Unknown error", en: "Something went wrong. Please try again.", bn: "\u0995\u09BF\u099B\u09C1 \u098F\u0995\u099F\u09BE \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" }, es = (e) => !!(Tt[e] && Tt[e].retry), Jt = class extends Error {
    constructor(t, n = "") {
      super(`${t} ${na(t).msg}${n ? ` \u2014 ${n}` : ""}`), this.code = t, this.detail = n;
    }
  };
  aa.exports = { CODES: Tt, info: na, isRetryable: es, AgError: Jt };
});

// src/ag/config.js
var St = O((ho, oa) => {
  "use strict";
  var { db: ra } = ae(), { AgError: ts } = Ve(), ns = 30 * 1e3, At = null, Xt = 0, sa = {
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
  async function as({ fresh: e = !1, requireSecret: t = !0 } = {}) {
    if (!e && At && Date.now() - Xt < ns) return At;
    let [n, a] = await Promise.all([ra.doc("adminConfig/gameApi").get(), ra.doc("adminPrivate/gameApi").get()]), r = { ...sa, ...n.exists ? n.data() : {}, secretKey: a.exists ? String(a.data().secretKey || "") : "" };
    if (r.terminalType = r.terminalType === "PC" ? "PC" : "PHONE", At = r, Xt = Date.now(), t && (!r.baseUrl || !r.merchantCode || !r.secretKey)) throw new ts("C20001", "Game API is not configured (base URL, merchant code, secret key).");
    return r;
  }
  function rs() {
    At = null, Xt = 0;
  }
  oa.exports = { loadConfig: as, clearConfigCache: rs, DEFAULTS: sa };
});

// src/ag/sign.js
var en = O((go, la) => {
  "use strict";
  var Zt = fe("crypto"), vt = "HmacSHA256", ss = {
    merchant: "x-merchant-code",
    timestamp: "x-timestamp",
    nonce: "x-nonce",
    sign: "x-sign",
    signType: "x-content-processing-type"
  };
  function ia(e, t, n, a, r) {
    let s = r == null ? "" : Buffer.isBuffer(r) ? r.toString("utf8") : String(r);
    return String(e) + String(t) + String(n) + String(a) + s;
  }
  function Qt(e, t, n, a, r, s = vt) {
    if (!e) throw new Error("Secret key missing");
    return Zt.createHmac("sha256", Buffer.from(String(e), "utf8")).update(Buffer.from(ia(t, n, a, s, r), "utf8")).digest("hex");
  }
  function ca(e, t) {
    let n = String(e || "").toLowerCase(), a = String(t || "").toLowerCase();
    return !/^[0-9a-f]+$/.test(n) || n.length !== a.length ? !1 : Zt.timingSafeEqual(Buffer.from(n, "utf8"), Buffer.from(a, "utf8"));
  }
  function os(e, t, n, a, r, s, o = vt) {
    return ca(Qt(e, t, n, a, r, o), s);
  }
  var da = () => Zt.randomBytes(16).toString("hex");
  function is(e, t, n) {
    let a = Date.now().toString(), r = da();
    return {
      "X-MERCHANT-CODE": t,
      "X-TIMESTAMP": a,
      "X-NONCE": r,
      "X-SIGN": Qt(e, t, a, r, n),
      "X-CONTENT-PROCESSING-TYPE": vt
    };
  }
  function cs(e, t) {
    if (!e) return "";
    if (typeof e.get == "function") return e.get(t) || "";
    let n = e[t] ?? e[t.toLowerCase()] ?? e[t.toUpperCase()];
    return Array.isArray(n) ? String(n[0]) : n == null ? "" : String(n);
  }
  la.exports = { SIGN_TYPE: vt, HEADERS: ss, rawString: ia, sign: Qt, verify: os, safeEqualHex: ca, newNonce: da, signedHeaders: is, header: cs };
});

// src/ag/client.js
var nn = O((wo, ha) => {
  "use strict";
  var ds = fe("crypto"), Se = en(), ua = Ve(), { db: ls, FieldValue: us } = ae(), tn = 12e3, ms = [400, 1200, 2500], fs = 30, ma = () => "TRACE_" + ds.randomBytes(10).toString("hex").toUpperCase(), oe = class extends Error {
    /** kind: timeout | network | http | badjson | badsign | provider */
    constructor(t, n, a = {}) {
      super(n), this.kind = t, Object.assign(this, a);
    }
  }, fa = (e) => e instanceof oe && ["timeout", "network"].includes(e.kind) || e instanceof oe && e.kind === "http" && e.status >= 500 || e instanceof oe && e.kind === "provider" && ua.isRetryable(e.code), ps = (e) => new Promise((t) => setTimeout(t, e)), pa = (e) => e && e.success !== !1 && (e.code === "C10000" || e.code == null && e.success === !0);
  async function hs(e, t, n, a) {
    let r = { "Content-Type": "application/json", ...Se.signedHeaders(e.secretKey, e.merchantCode, n) }, s = new AbortController(), o = setTimeout(() => s.abort(), tn), c, d;
    try {
      c = await a(e.baseUrl.replace(/\/+$/, "") + t, { method: "POST", headers: r, body: n, signal: s.signal }), d = await c.text();
    } catch (m) {
      throw new oe(
        m.name === "AbortError" ? "timeout" : "network",
        m.name === "AbortError" ? `Provider timed out after ${tn / 1e3}s` : `Could not reach provider: ${m.cause?.code || m.message}`
      );
    } finally {
      clearTimeout(o);
    }
    if (!c.ok) throw new oe("http", `Provider returned HTTP ${c.status}`, { status: c.status, body: String(d).slice(0, 300) });
    let i = Se.header(c.headers, "X-SIGN"), u = e.verifyResponseSign || "auto";
    if (u !== "off" && (i || u === "strict") && !(i && Se.verify(
      e.secretKey,
      Se.header(c.headers, "X-MERCHANT-CODE") || e.merchantCode,
      Se.header(c.headers, "X-TIMESTAMP"),
      Se.header(c.headers, "X-NONCE"),
      d,
      i,
      Se.header(c.headers, "X-CONTENT-PROCESSING-TYPE") || Se.SIGN_TYPE
    )))
      throw new oe("badsign", "Provider response signature is invalid");
    let l;
    try {
      l = JSON.parse(d);
    } catch {
      throw new oe("badjson", "Provider returned a non-JSON response", { body: String(d).slice(0, 300) });
    }
    if (!pa(l)) throw new oe("provider", `${l.code || "ERROR"}: ${l.msg || ua.info(l.code).msg}`, { code: l.code || "C10001", providerMsg: l.msg });
    return l;
  }
  async function gs(e, t, n = {}, a = {}) {
    let r = a.fetchImpl || fetch, s = a.retries ?? 2, o = { reqTraceId: ma(), ...n }, c = JSON.stringify(o), d = Date.now(), i = 0, u = null, l = null;
    for (; i <= s; i++)
      try {
        l = await hs(e, t, c, r), u = null;
        break;
      } catch (m) {
        if (u = m, !fa(m) || i === s) break;
        await ps(ms[i] || 2500);
      }
    if (a.log !== !1) {
      let m = {
        endpoint: t,
        reqTraceId: o.reqTraceId,
        attempts: Math.min(i + 1, s + 1),
        ok: !u,
        code: u ? u.code || u.kind : l.code,
        message: u ? u.message : "",
        latencyMs: Date.now() - d,
        request: c.slice(0, 2e3),
        at: us.serverTimestamp(),
        expireAt: new Date(Date.now() + fs * 864e5)
      };
      ls.collection("agApiLogs").add(m).catch(() => {
      });
    }
    if (u) throw u;
    return l;
  }
  ha.exports = { call: gs, trace: ma, ClientError: oe, isSuccess: pa, transient: fa, TIMEOUT_MS: tn };
});

// src/ag/engine.js
var Na = O((yo, _a) => {
  "use strict";
  var tt = fe("crypto"), { AgError: I } = Ve(), D = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, nt = (e) => D(Math.max(0, e)).toFixed(2), ws = /^[A-Za-z0-9_\-.]{1,128}$/, ya = 10;
  function F(e, t, n = 128) {
    let a = e[t];
    if (a == null || String(a).trim() === "") throw new I(t === "playerId" ? "G20001" : "C10002", `${t} is required`);
    let r = String(a).trim();
    if (r.length > n) throw new I("C10002", `${t} too long`);
    return r;
  }
  function Ct(e, t) {
    let n = e[t];
    if (n == null || n === "") throw new I("C10002", `${t} is required`);
    if (typeof n != "number" && !/^\d+(\.\d+)?$/.test(String(n).trim())) throw new I("C10002", `${t} must be a non-negative decimal`);
    let a = Number(n);
    if (!Number.isFinite(a) || a < 0 || a > 1e12) throw new I("C10002", `${t} out of range`);
    return D(a);
  }
  function ga(e, t, n) {
    let a = e[t];
    if (a == null || a === "") {
      if (n !== void 0) return n;
      throw new I("C10002", `${t} is required`);
    }
    let r = String(a).trim().toLowerCase();
    if (a === !0 || a === 1 || ["true", "1", "y", "yes"].includes(r)) return !0;
    if (a === !1 || a === 0 || ["false", "0", "n", "no"].includes(r)) return !1;
    throw new I("C10002", `${t} must be boolean (got ${typeof a}: ${JSON.stringify(a).slice(0, 40)})`);
  }
  function wa(e, t) {
    let n = e[t];
    if (n == null || n === "") throw new I("C10002", `${t} is required`);
    let a = Number(n);
    if (!Number.isFinite(a) || a < 0) throw new I("C10002", `${t} must be a Unix ms timestamp`);
    return a;
  }
  function at(e) {
    let t = F(e, "playerId");
    if (!ws.test(t)) throw new I("G20006", "playerId has an invalid format");
    return t;
  }
  function rt(e, t) {
    let n = F(e, "currencyCode", 16);
    if (t.currencyCode && n !== t.currencyCode) throw new I("G20005", `wallet currency is ${t.currencyCode}, got ${n}`);
    return n;
  }
  function Re(e) {
    let t = String(e);
    return /^[A-Za-z0-9_\-.:]{1,200}$/.test(t) && !/^\.+$/.test(t) && !t.startsWith("__") ? t : "h_" + tt.createHash("sha256").update(t).digest("hex");
  }
  function ba(e) {
    let t = Object.keys(e || {}).filter((n) => n !== "reqTraceId").sort();
    return tt.createHash("sha256").update(JSON.stringify(t.map((n) => [n, e[n]]))).digest("hex");
  }
  var ve = (e) => D((Number(e?.main) || 0) + (Number(e?.winning) || 0));
  function an(e, t) {
    if (ve(e) + 1e-9 < t) return null;
    let n = D(t), a = {};
    for (let r of ["main", "winning"]) {
      let s = D(Math.min(Math.max(Number(e?.[r]) || 0, 0), n));
      s > 0 && (a[r] = s, n = D(n - s));
    }
    return n > 0 ? null : a;
  }
  function rn(e, t, n) {
    let { db: a, FieldValue: r } = e, s = {}, o = {}, c = r.serverTimestamp();
    return {
      delta(d, i) {
        s[d] = D((s[d] || 0) + i);
      },
      stat(d, i) {
        o[d] = D((o[d] || 0) + i);
      },
      ledger(d, i, u, l, m, f, p) {
        l > 0 && t.set(a.collection("transactions").doc(), { uid: d, type: i, direction: u, amount: D(l), bucket: m, note: f, ref: p, createdAt: c });
      },
      flush() {
        let d = {};
        for (let [u, l] of Object.entries(s)) l !== 0 && (d[`balances.${u}`] = r.increment(l));
        Object.keys(d).length && t.update(n, d);
        let i = {};
        for (let [u, l] of Object.entries(o)) l !== 0 && (i[u] = r.increment(l));
        Object.keys(i).length && t.set(a.doc(`statsShards/ag_${tt.randomInt(0, ya)}`), i, { merge: !0 });
      },
      after(d) {
        let i = { ...d || {} };
        for (let [u, l] of Object.entries(s)) i[u] = D((Number(i[u]) || 0) + l);
        return i;
      }
    };
  }
  function Ta(e) {
    return "MB" + tt.createHash("sha1").update(String(e) + tt.randomBytes(4).toString("hex")).digest("hex").slice(0, 18).toUpperCase();
  }
  function Aa(e, t, n) {
    if (e.status !== "active") throw new I("G30001", `account is ${e.status}`);
    let a = e.rg?.excludedUntil;
    if ((a?.toMillis ? a.toMillis() : Number(a) || 0) > n) throw new I("G30001", "player is self-excluded");
    if (t && t.status === "forced") throw new I("G30001", "session was force-logged-out");
  }
  async function sn(e, t, n, a, r) {
    let { db: s, FieldValue: o } = e, c = ba(n);
    return s.runTransaction(async (d) => {
      let i = s.doc(`agTransactions/${t}`), u = await d.get(i);
      if (u.exists) {
        let f = u.data();
        if (f.requestHash !== c) throw new I("G300016", `transactionId already used with a different payload (${t})`);
        return { data: f.response, replay: !0 };
      }
      let { data: l, record: m } = await r(d);
      return d.set(i, { ...a, ...m, requestHash: c, response: l, createdAt: o.serverTimestamp(), at: e.now }), { data: l, replay: !1 };
    });
  }
  async function Sa(e, t) {
    let n = at(t);
    rt(t, e.cfg);
    let a = await e.db.doc(`users/${n}`).get();
    if (!a.exists) throw new I("G20006", n);
    return { balance: nt(ve(a.data().balances)) };
  }
  async function va(e, t) {
    let n = at(t);
    rt(t, e.cfg);
    let a = await e.db.doc(`users/${n}`).get();
    if (!a.exists) throw new I("G20006", n);
    let r = a.data(), s = String(e.cfg.siteUrl || "").replace(/\/+$/, ""), o = /^https:\/\//.test(r.photoURL || "") ? r.photoURL : e.cfg.defaultAvatarUrl || (s ? `${s}/icons/icon-192.png` : "");
    return { nickName: String(r.username || r.name || "Player").slice(0, 32), avatarUrl: o };
  }
  async function Ca(e, t) {
    let n = at(t), a = rt(t, e.cfg), r = F(t, "gameCode"), s = F(t, "roundId"), o = F(t, "betId"), c = F(t, "transactionId"), d = Ct(t, "betAmount"), i = F(t, "timestamp", 40), { db: u } = e;
    return sn(e, `bet_${Re(c)}`, t, { kind: "bet", transactionId: c, betId: o, roundId: s, gameCode: r, playerId: n, uid: n, currencyCode: a, betAmount: d, providerTime: i }, async (l) => {
      let m = u.doc(`users/${n}`), f = u.doc(`agBets/${Re(o)}`), p = u.doc(`agSessions/${n}`), [w, T, g] = await Promise.all([l.get(m), l.get(f), l.get(p)]);
      if (!w.exists) throw new I("G20006", n);
      let $ = w.data();
      Aa($, g.exists ? g.data() : null, e.now);
      let A = T.exists ? T.data() : null;
      if (A && A.status === "cancelled") throw new I("C10002", `bet ${o} was already cancelled`);
      if (A && A.uid !== n) throw new I("C10002", `bet ${o} belongs to another player`);
      let k = an($.balances, d);
      if (!k) throw new I("G30003", `needs ${d}, has ${ve($.balances)}`);
      let E = rn(e, l, m);
      for (let [C, L] of Object.entries(k)) E.delta(C, -L);
      E.ledger(n, "game_bet", "out", d, Object.keys(k)[0] || "main", r, o), E.stat("agBetVolume", d), E.stat("agBetCount", 1);
      let M = A?.merchantBetId || Ta(o), B = A?.debitPlan || {};
      l.set(f, {
        betId: o,
        merchantBetId: M,
        uid: n,
        playerId: n,
        gameCode: r,
        roundId: s,
        currencyCode: a,
        betAmount: D((A?.betAmount || 0) + d),
        debitPlan: { main: D((B.main || 0) + (k.main || 0)), winning: D((B.winning || 0) + (k.winning || 0)) },
        winAmount: A?.winAmount || 0,
        winReversed: A?.winReversed || 0,
        betRefunded: !1,
        status: A?.status === "settled" ? "settled" : "placed",
        isFree: !1,
        createdAt: A?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: A?.at || e.now
      }, { merge: !0 }), E.flush();
      let y = { merchantBetId: M, balance: nt(ve(E.after($.balances))) };
      return { data: y, record: { merchantBetId: M, balanceAfter: y.balance, debitPlan: k } };
    });
  }
  async function ka(e, t) {
    let n = at(t), a = rt(t, e.cfg), r = F(t, "gameCode"), s = F(t, "roundId"), o = F(t, "betId"), c = F(t, "transactionId"), d = Ct(t, "betAmount"), i = Ct(t, "winAmount"), u = ga(t, "isFree", !1), l = ga(t, "isEnd"), m = wa(t, "betTime"), f = wa(t, "settledTime"), p = F(t, "type", 16);
    if (!["win", "bet_win"].includes(p)) throw new I("C10002", "type must be win or bet_win");
    let { db: w } = e;
    return sn(e, `win_${Re(c)}`, t, { kind: "win", type: p, transactionId: c, betId: o, roundId: s, gameCode: r, playerId: n, uid: n, currencyCode: a, betAmount: d, winAmount: i, isFree: u, isEnd: l, betTime: m, settledTime: f }, async (T) => {
      let g = w.doc(`users/${n}`), $ = w.doc(`agBets/${Re(o)}`), A = w.doc(`agSessions/${n}`), [k, E, M] = await Promise.all([T.get(g), T.get($), T.get(A)]);
      if (!k.exists) throw new I("G20006", n);
      let B = k.data(), y = E.exists ? E.data() : null;
      if (y && y.uid !== n) throw new I("C10002", `bet ${o} belongs to another player`);
      if (y && y.status === "cancelled") throw new I("C10002", `bet ${o} was cancelled`);
      let C = rn(e, T, g), L = {}, ee = p === "bet_win" && !u && d > 0;
      if (ee) {
        if (Aa(B, M.exists ? M.data() : null, e.now), L = an(B.balances, d), !L) throw new I("G30003", `needs ${d}, has ${ve(B.balances)}`);
        for (let [Ue, Be] of Object.entries(L)) C.delta(Ue, -Be);
        C.ledger(n, "game_bet", "out", d, Object.keys(L)[0] || "main", r, o), C.stat("agBetVolume", d), C.stat("agBetCount", 1);
      }
      i > 0 && (C.delta("winning", i), C.ledger(n, "game_win", "in", i, "winning", r + (u ? " (free spin)" : ""), o), C.stat("agWinPayout", i)), !y && p === "win" && C.stat("agOrphanWins", 1);
      let me = y?.merchantBetId || Ta(o), J = y?.debitPlan || {};
      T.set($, {
        betId: o,
        merchantBetId: me,
        uid: n,
        playerId: n,
        gameCode: r,
        roundId: s,
        currencyCode: a,
        betAmount: D((y?.betAmount || 0) + (ee ? d : 0)),
        declaredBetAmount: d,
        debitPlan: { main: D((J.main || 0) + (L.main || 0)), winning: D((J.winning || 0) + (L.winning || 0)) },
        winAmount: D((y?.winAmount || 0) + i),
        winReversed: y?.winReversed || 0,
        betRefunded: y?.betRefunded || !1,
        isFree: u,
        isEnd: l,
        status: l ? "settled" : y?.status || "placed",
        betTime: m,
        settledTime: l ? f : y?.settledTime || null,
        createdAt: y?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: y?.at || e.now
      }, { merge: !0 }), C.flush();
      let Y = { merchantBetId: me, balance: nt(ve(C.after(B.balances))) };
      return { data: Y, record: { merchantBetId: me, balanceAfter: Y.balance, debitPlan: L } };
    });
  }
  async function Ia(e, t) {
    let n = at(t), a = rt(t, e.cfg), r = F(t, "gameCode"), s = F(t, "betId"), o = F(t, "merchantBetId"), c = Ct(t, "betAmount"), d = F(t, "cancelType", 8).toUpperCase(), i = F(t, "transactionId");
    if (!["BET", "WIN"].includes(d)) throw new I("C10002", "cancelType must be BET or WIN");
    let { db: u } = e;
    return sn(e, `cancel_${Re(i)}`, t, { kind: "cancel", cancelType: d, transactionId: i, betId: s, gameCode: r, playerId: n, uid: n, currencyCode: a, betAmount: c, merchantBetId: o }, async (l) => {
      let m = u.doc(`users/${n}`), f = u.doc(`agBets/${Re(s)}`), [p, w] = await Promise.all([l.get(m), l.get(f)]);
      if (!p.exists) throw new I("G20006", n);
      let T = p.data(), g = rn(e, l, m), $ = w.exists ? w.data() : null;
      if ($ && $.uid !== n) throw new I("C10002", `bet ${s} belongs to another player`);
      let A = 0, k = 0, E = "", M = e.FieldValue.serverTimestamp();
      if (!$)
        l.set(f, {
          betId: s,
          merchantBetId: o,
          uid: n,
          playerId: n,
          gameCode: r,
          currencyCode: a,
          betAmount: 0,
          debitPlan: {},
          winAmount: 0,
          winReversed: 0,
          betRefunded: d === "BET",
          status: d === "BET" ? "cancelled" : "placed",
          cancelledBeforeBet: !0,
          createdAt: M,
          updatedAt: M,
          at: e.now
        }), E = "no matching bet; tombstone stored";
      else if (d === "BET") {
        if ($.betRefunded)
          E = "bet already refunded";
        else {
          let C = $.debitPlan || {};
          for (let L of ["main", "winning"]) C[L] > 0 && g.delta(L, C[L]);
          A = D((C.main || 0) + (C.winning || 0)), g.ledger(n, "game_refund", "in", A, "main", `${r} bet cancelled`, s), g.stat("agBetVolume", -A), g.stat("agCancelCount", 1), Math.abs(A - c) > 1e-3 && (E = `refunded the ${A} actually debited (request said ${c})`);
        }
        l.set(f, { status: "cancelled", betRefunded: !0, cancelledAt: M, updatedAt: M }, { merge: !0 });
      } else {
        let C = D(($.winAmount || 0) - ($.winReversed || 0));
        if (C > 0) {
          let L = T.balances || {}, ee = D(Math.min(Math.max(Number(L.winning) || 0, 0), C)), me = D(Math.min(Math.max(Number(L.main) || 0, 0), D(C - ee))), J = D(C - ee - me);
          ee + J > 0 && g.delta("winning", -(ee + J)), me > 0 && g.delta("main", -me), k = C, g.ledger(n, "game_win_reversal", "out", k, "winning", `${r} win cancelled`, s), g.stat("agWinPayout", -k), g.stat("agCancelCount", 1), J > 0 && (E = `player balance short by ${J}; recorded as negative winning balance`, g.stat("agDebt", J));
        } else E = "nothing to reverse";
        l.set(f, { winReversed: D(($.winReversed || 0) + k), winCancelledAt: M, updatedAt: M }, { merge: !0 });
      }
      g.flush();
      let y = { merchantBetId: $?.merchantBetId || o, betId: s, balance: nt(ve(g.after(T.balances))), currencyCode: a };
      return { data: y, record: { refunded: A, reversed: k, note: E, balanceAfter: y.balance } };
    });
  }
  var ys = {
    "/wallet/balance": (e, t) => Sa(e, t),
    "/player/info": (e, t) => va(e, t),
    "/wallet/bet": async (e, t) => (await Ca(e, t)).data,
    "/wallet/win": async (e, t) => (await ka(e, t)).data,
    "/wallet/cancel": async (e, t) => (await Ia(e, t)).data
  };
  _a.exports = { ROUTES: ys, STAT_SHARDS: ya, balance: Sa, playerInfo: va, bet: Ca, win: ka, cancel: Ia, planDebit: an, safeId: Re, requestHash: ba, playable: ve, round2: D, money: nt };
});

// src/ag/callbacks.js
var Pa = O((bo, Ra) => {
  "use strict";
  var bs = fe("crypto"), ge = en(), V = Ve(), { ROUTES: $a, requestHash: Ts } = Na(), As = 24 * 36e5, Ss = 90;
  function kt(e, t = null, n) {
    return { success: e === "C10000", code: e, msg: n || V.info(e).msg, data: e === "C10000" ? t : null };
  }
  function Ea(e) {
    let t = String(e || "").split("?")[0].replace(/\/+$/, "");
    return Object.keys($a).find((n) => t === n || t.endsWith(n)) || null;
  }
  function vs(e, t) {
    let n = ge.header(e, "x-forwarded-for");
    return (n ? n.split(",")[0] : t || "").trim();
  }
  async function Cs(e, t) {
    let n = Date.now(), a = Ea(t.path), r = Buffer.isBuffer(t.rawBody) ? t.rawBody.toString("utf8") : String(t.rawBody ?? ""), s = null, o, c = "";
    try {
      if (t.method !== "POST") throw new V.AgError("C10003", "POST required");
      if (!a) throw new V.AgError("C10002", `unknown endpoint ${t.path}`);
      let l = t.headers || {}, m = ge.header(l, "X-MERCHANT-CODE"), f = ge.header(l, "X-TIMESTAMP"), p = ge.header(l, "X-NONCE"), w = ge.header(l, "X-SIGN"), T = ge.header(l, "X-CONTENT-PROCESSING-TYPE");
      if (!m || !f || !p || !w || !T) throw new V.AgError("C10003", "missing signature headers");
      if (p.length > 64 || w.length > 256) throw new V.AgError("C10003", "header too long");
      if (!e.cfg.merchantCode || !e.cfg.secretKey) throw new V.AgError("C20001", "merchant not configured on our side");
      if (m !== e.cfg.merchantCode) throw new V.AgError("C20001", `unknown merchant ${m}`);
      if (T !== ge.SIGN_TYPE) throw new V.AgError("C10003", `unsupported signType ${T}`);
      let g = Number(f), $ = (Number(e.cfg.timestampToleranceSec) || 300) * 1e3;
      if (!/^\d{10,16}$/.test(f) || !Number.isFinite(g) || Math.abs(e.now - g) > $) throw new V.AgError("C10003", "timestamp outside allowed window");
      if (!ge.verify(e.cfg.secretKey, m, f, p, r, w, T)) throw new V.AgError("C10004");
      let A = Array.isArray(e.cfg.callbackIpWhitelist) ? e.cfg.callbackIpWhitelist.filter(Boolean) : [];
      if (A.length && !A.includes(t.ip)) throw new V.AgError("C10003", `IP ${t.ip} not allowed`);
      try {
        s = JSON.parse(r || "{}");
      } catch {
        throw new V.AgError("C10002", "body is not valid JSON");
      }
      if (!s || typeof s != "object" || Array.isArray(s)) throw new V.AgError("C10002", "body must be a JSON object");
      let k = e.db.doc(`agNonces/${bs.createHash("sha256").update(m + ":" + p).digest("hex")}`), E = Ts(s);
      try {
        await k.create({ route: a, bodyHash: E, at: e.now, expireAt: new Date(e.now + As) });
      } catch (B) {
        if (!(B.code === 6 || /ALREADY_EXISTS/i.test(String(B.message || B)))) throw B;
        let y = await k.get();
        if (!y.exists || y.data().bodyHash !== E) throw new V.AgError("C10003", "nonce already used (replay)");
        c = "identical retry (same nonce + payload)";
      }
      let M = await $a[a](e, s);
      o = kt("C10000", M);
    } catch (l) {
      l instanceof V.AgError ? (o = kt(l.code), c = l.detail || c) : (o = kt("C10001"), c = String(l && l.stack || l).slice(0, 500));
    }
    let d = JSON.stringify(o), i = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
    e.cfg.secretKey && e.cfg.merchantCode && Object.assign(i, ge.signedHeaders(e.cfg.secretKey, e.cfg.merchantCode, d));
    let u = {
      route: a || String(t.path || "").slice(0, 100),
      code: o.code,
      ok: o.code === "C10000",
      detail: c,
      playerId: s?.playerId || "",
      transactionId: s?.transactionId || "",
      betId: s?.betId || "",
      reqTraceId: s?.reqTraceId || "",
      ip: t.ip || "",
      latencyMs: Date.now() - n,
      request: r.slice(0, 2e3),
      response: d.slice(0, 1e3),
      at: e.now,
      expireAt: new Date(e.now + Ss * 864e5)
    };
    return { status: t.method === "POST" ? 200 : 405, headers: i, body: d, log: u };
  }
  Ra.exports = { handle: Cs, wrap: kt, routeOf: Ea, clientIp: vs };
});

// src/ag/platform.js
var dn = O((H) => {
  "use strict";
  var Ma = fe("net"), { onCall: ie, onRequest: ks, HttpsError: Ce } = ne(), { onSchedule: Da } = Qn(), { AggregateField: We } = ta(), b = ae(), { db: S, admin: Is, FieldValue: j, REGION: z } = b, Ke = Ve(), { loadConfig: we, clearConfigCache: _s, DEFAULTS: Ua } = St(), W = nn(), Oa = Pa(), Ns = ["slots", "live", "sports", "fishing", "lottery", "cards", "crash"], $s = (e = "", t = "", n = "") => {
    let a = `${e} ${t} ${n}`.toUpperCase();
    return /LIVE|BACCARAT|ROULETTE/.test(a) ? "live" : /SPORT/.test(a) ? "sports" : /FISH/.test(a) ? "fishing" : /LOTT|KENO|BINGO/.test(a) ? "lottery" : /CARD|POKER|RUMMY|TEEN|ANDAR|TABLE/.test(a) ? "cards" : /CRASH|AVIATOR|ROCKET/.test(a) ? "crash" : "slots";
  }, on = (e) => String(e).replace(/[\/\s]/g, "_").slice(0, 400), Es = ["BR_BRL", "GB_GBP", "DK_DKK", "DE_EUR", "ES_EUR", "FI_EUR", "FR_EUR", "ID_IDR", "IT_EUR", "NL_EUR", "NO_NOK", "PL_PLN", "PT_EUR", "TH_THB", "TR_TRY", "VN_VND", "MM_MMK", "SG_SGD", "NG_NGN", "US_USD", "PK_PKR", "CO_COP", "PH_PHP", "MX_MXN", "AR_ARS", "KE_KES", "CL_CLP", "ZA_ZAR", "BD_BDT", "IN_INR", "LK_LKR"], Ba = ["en", "ar", "az", "bg", "bn", "cs", "da", "de", "el", "en-stkus", "es", "et", "fa", "fi", "fr", "hi", "hu", "hy", "id", "it", "ja", "ko", "lo", "lt", "mn", "my", "ms", "nl", "no", "pl", "pt", "pt-br", "ro", "ru", "sh", "si", "sk", "sq", "sv", "th", "tr", "uk", "ur", "uz", "vi"];
  function cn(e, t = "Game service error") {
    if (e instanceof Ce) return e;
    if (e instanceof Ke.AgError || e instanceof W.ClientError && e.kind === "provider") {
      let n = e.code || "C10001", a = Ke.info(n);
      return new Ce("failed-precondition", a.en, { agCode: n, bn: a.bn, providerMsg: e.providerMsg || e.detail || "", retry: Ke.isRetryable(n) });
    }
    if (e instanceof W.ClientError) {
      let n = {
        timeout: "The game provider did not respond in time. Please try again.",
        network: "Could not reach the game provider. Please try again.",
        http: `The game provider returned an error (HTTP ${e.status}).`,
        badjson: "The game provider sent an invalid response.",
        badsign: "The game provider response failed the security check."
      }[e.kind] || t;
      return new Ce("unavailable", n, { kind: e.kind, status: e.status || null, retry: ["timeout", "network", "http"].includes(e.kind) });
    }
    return console.error(e), new Ce("internal", t);
  }
  var ue = (e) => async (t) => {
    try {
      return await e(t);
    } catch (n) {
      throw cn(n);
    }
  }, Rs = (e) => {
    let n = String(e.rawRequest?.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || String(e.rawRequest?.ip || "").replace(/^::ffff:/, "");
    return Ma.isIP(n) ? n : "";
  }, Pe = (e, t, n, a) => {
    let r = Number(e);
    if (!Number.isInteger(r) || r < t || r > n) throw b.bad(`${a} must be a whole number ${t}-${n}.`);
    return r;
  }, _t = (e, t) => {
    let n = b.str(e, { max: 40, label: t }), a = Date.parse(n);
    if (!Number.isFinite(a)) throw b.bad(`${t} must be an ISO-8601 date/time.`);
    return { s: new Date(a).toISOString(), ms: a };
  }, It = /^[A-Za-z0-9-]{1,50}$/, st = /^[A-Za-z0-9_\-.]{1,128}$/;
  H.agCallback = ks({ region: z, timeoutSeconds: 30, memory: "256MiB", minInstances: 0, concurrency: 80, invoker: "public" }, async (e, t) => {
    let n;
    try {
      n = await we({ requireSecret: !1 });
    } catch {
      n = { ...Ua };
    }
    let a = await Oa.handle({ db: S, FieldValue: j, cfg: n, now: Date.now() }, {
      method: e.method,
      path: e.path || e.url,
      headers: e.headers,
      rawBody: e.rawBody || Buffer.from(""),
      ip: Oa.clientIp(e.headers, e.ip)
    });
    S.collection("agCallbackLogs").add({ ...a.log, at: j.serverTimestamp(), atMs: a.log.at }).catch((r) => console.error("log", r.message)), a.log.code === "C10001" && console.error("agCallback internal error", a.log.detail), t.status(a.status).set(a.headers).send(a.body);
  });
  H.adminSaveGameApiConfig = ie({ region: z }, ue(async (e) => {
    let t = b.requireRole(e, ["super"]), n = e.data || {}, a = b.str(n.baseUrl, { max: 200, label: "Base URL", pattern: /^https:\/\/[^\s]+$/ }).replace(/\/+$/, ""), r = b.str(n.currencyCode || "BD_BDT", { max: 20, label: "Currency" });
    if (!Es.includes(r)) throw b.bad("Unsupported currency code (see PDF \xA72.7).");
    let s = b.str(n.lang || "bn", { max: 10, label: "Language" });
    if (!Ba.includes(s)) throw b.bad("Unsupported language (see PDF \xA72.8).");
    let o = b.str(n.subMerchantCode || "site", { max: 50, label: "Sub-merchant code", pattern: It }), c = n.siteUrl ? b.str(n.siteUrl, { max: 200, label: "Site URL", pattern: /^https:\/\/[^\s/]+(\/[^\s]*)?$/ }).replace(/\/+$/, "") : "", d = (Array.isArray(n.callbackIpWhitelist) ? n.callbackIpWhitelist : String(n.callbackIpWhitelist || "").split(/[\s,]+/)).map((l) => String(l).trim()).filter(Boolean);
    if (d.some((l) => !Ma.isIP(l))) throw b.bad("IP allow-list contains an invalid IP address.");
    let i = {
      baseUrl: a,
      merchantCode: b.str(n.merchantCode, { max: 64, label: "Merchant code" }),
      currencyCode: r,
      lang: s,
      subMerchantCode: o,
      siteUrl: c,
      terminalType: n.terminalType === "PC" ? "PC" : "PHONE",
      env: n.env === "prod" ? "prod" : "staging",
      verifyResponseSign: ["auto", "strict", "off"].includes(n.verifyResponseSign) ? n.verifyResponseSign : "auto",
      timestampToleranceSec: Pe(n.timestampToleranceSec ?? 300, 30, 900, "Timestamp tolerance"),
      callbackIpWhitelist: d.slice(0, 50),
      categoryMap: typeof n.categoryMap == "object" && n.categoryMap ? n.categoryMap : {},
      updatedAt: j.serverTimestamp(),
      updatedBy: t
    };
    await S.doc("adminConfig/gameApi").set(i, { merge: !0 });
    let u = typeof n.secretKey == "string" && n.secretKey.trim().length > 0;
    return u && await S.doc("adminPrivate/gameApi").set({ secretKey: n.secretKey.trim(), rotatedAt: j.serverTimestamp() }), await S.doc("adminConfig/gameApiStatus").set({ ok: !1, testedAt: null, message: "Configuration changed \u2014 run the connection test." }), _s(), b.audit(null, t, "game_api_config", { baseUrl: a, merchantCode: i.merchantCode, env: i.env, secretChanged: u }), { ok: !0 };
  }));
  H.adminGetGameApiConfig = ie({ region: z }, ue(async (e) => {
    b.requireRole(e, ["super"]);
    let [t, n, a, r] = await Promise.all([S.doc("adminConfig/gameApi").get(), S.doc("adminPrivate/gameApi").get(), S.doc("adminConfig/gameApiStatus").get(), S.doc("adminConfig/agMerchant").get()]), s = String((globalThis.__ENV || process.env).SUPABASE_URL || "").replace(/\/+$/, ""), o = { ...Ua, ...t.exists ? t.data() : {} };
    return delete o.updatedAt, {
      config: o,
      secretSet: n.exists && !!n.data().secretKey,
      status: a.exists ? { ...a.data(), testedAt: a.data().testedAt?.toMillis?.() || null } : null,
      merchant: r.exists ? { ...r.data(), syncedAt: r.data().syncedAt?.toMillis?.() || null } : null,
      callbackUrls: [s ? `${s}/functions/v1/api/agw` : null].filter(Boolean)
    };
  }));
  H.adminTestGameApi = ie({ region: z, timeoutSeconds: 60 }, async (e) => {
    b.requireRole(e, ["super"]);
    let t = Date.now(), n;
    try {
      let a = await we({ fresh: !0 }), s = ((await W.call(a, "/game/v5/providers", {}, { retries: 0 })).data?.providers || []).length;
      n = { ok: !0, latencyMs: Date.now() - t, message: `Connected \u2014 ${s} provider(s) returned.`, providerCount: s };
    } catch (a) {
      let r = cn(a);
      n = { ok: !1, latencyMs: Date.now() - t, message: a.message || r.message, agCode: r.details?.agCode || null, kind: a.kind || r.details?.kind || "config", httpStatus: a.status || null };
    }
    return await S.doc("adminConfig/gameApiStatus").set({ ...n, testedAt: j.serverTimestamp() }), n;
  });
  H.adminSyncGames = ie({ region: z, timeoutSeconds: 540, memory: "512MiB" }, ue(async (e) => {
    let t = b.requireRole(e, ["super", "content"]), n = await we({ fresh: !0 }), r = ((await W.call(n, "/game/v5/providers", {})).data?.providers || []).map((u) => typeof u == "string" ? { name: u, code: u } : u);
    await S.doc("adminConfig/agProviders").set({ providers: r, syncedAt: j.serverTimestamp() });
    let s = (await W.call(n, "/game/v5/categories", { currencyCode: n.currencyCode, lang: n.lang })).data?.categoryDataList || [], o = 0, c = [], d = /* @__PURE__ */ new Set();
    for (let u of s) {
      let l = u.categoryCode || u.code;
      if (!l) continue;
      let m = (n.categoryMap || {})[l] || $s(l, u.categoryName), f = 0;
      for (let p = 1; p <= 200; p++) {
        let w = await W.call(n, "/game/v5/games", { categoryCode: l, currencyCode: n.currencyCode, lang: n.lang, pageIndex: p }), T = w.data?.gameItemList || w.data?.gameltemList || [];
        if (!T.length) break;
        let g = S.batch();
        for (let A of T) {
          let k = A.gameCode;
          if (!k) continue;
          let E = Number.isInteger(Number(A.status)) ? Number(A.status) : 1;
          g.set(S.doc(`games/${on(k)}`), {
            gameCode: String(k),
            name: A.gameName || A.name || String(k),
            gameType: A.gameType || "",
            status: E,
            imageUrl: A.imageUrl || A.gameIcon || A.iconUrl || "",
            provider: A.providerCode || A.provider || "",
            categoryCode: l,
            categoryName: u.categoryName || l,
            lobbyCategory: m,
            syncedAt: j.serverTimestamp()
          }, { merge: !0 }), d.add(String(k)), o++, f++;
        }
        await g.commit();
        let $ = Number(w.data?.totalSize) || 0;
        if ($ && f >= $) break;
      }
      c.push({ code: l, name: u.categoryName || l, lobby: m, count: f });
    }
    let i = S.batch();
    return c.forEach((u) => i.set(S.doc(`gameCategories/${on(u.code)}`), { ...u, syncedAt: j.serverTimestamp() }, { merge: !0 })), await i.commit(), b.audit(null, t, "games_synced", { providers: r.length, categories: c.length, games: o, unique: d.size }), { ok: !0, providers: r.length, categories: c.length, games: d.size };
  }));
  function Ps(e, t) {
    let n = String(e.rawRequest?.headers?.origin || "").replace(/\/+$/, ""), a = [t.siteUrl, String((globalThis.__ENV || process.env).SITE_URL || "").replace(/\/+$/, "")].filter(Boolean);
    if (n && (a.includes(n) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(n))) return n;
    if (t.siteUrl) return t.siteUrl;
    throw new Ce("failed-precondition", "Set the Site URL in Admin \u2192 Game API (needed for the game exit page).");
  }
  H.launchGame = ie({ region: z, timeoutSeconds: 30 }, ue(async (e) => {
    let t = b.requireVerified(e), n = e.data || {}, a = b.str(n.gameCode, { max: 120, label: "Game" }), [r, s, o] = await Promise.all([S.doc(`games/${on(a)}`).get(), S.doc(`users/${t}`).get(), we()]), c = s.data();
    b.assertActive(c);
    let d = c.rg?.excludedUntil;
    if ((d?.toMillis ? d.toMillis() : Number(d) || 0) > Date.now()) throw new Ce("failed-precondition", "You are on a self-exclusion break. Games are unavailable until it ends.");
    if (!r.exists || r.data().enabled === !1) throw new Ke.AgError("G20002");
    if (r.data().status === 0) throw new Ke.AgError("G20003");
    if (r.data().status === 2) throw new Ke.AgError("G20010");
    let i = Rs(e);
    if (!i) throw new Ce("failed-precondition", "Could not determine your IP address.");
    let u = n.terminalType === "PC" ? "PC" : n.terminalType === "PHONE" ? "PHONE" : o.terminalType, l = Ps(e, o), m = {
      gameCode: r.data().gameCode,
      playerId: t,
      currencyCode: o.currencyCode,
      language: Ba.includes(n.language) ? n.language : o.lang,
      terminalType: u,
      returnUrl: `${l}/exitGame.html?game=${encodeURIComponent(r.data().gameCode)}`,
      ipAddress: i,
      subMerchantCode: o.subMerchantCode || "site",
      nickName: String(c.username || c.name || "Player").slice(0, 32)
    };
    /^https:\/\//.test(c.photoURL || "") && (m.avatarUrl = c.photoURL);
    let f = await W.call(o, "/game/v5/game/url", m), p = f.data?.gameUrl || f.data?.url;
    if (!p || !/^https?:\/\//.test(p)) throw new Ce("unavailable", "The game provider did not return a game URL.");
    return await S.doc(`agSessions/${t}`).set({
      uid: t,
      status: "active",
      gameCode: r.data().gameCode,
      gameName: r.data().name || "",
      terminalType: u,
      ip: i,
      expireTime: f.data?.expireTime || null,
      launchedAt: j.serverTimestamp(),
      launchedAtMs: Date.now(),
      closedAt: null,
      forcedAt: null
    }, { merge: !0 }), await S.collection("gameHistory").add({ uid: t, game: r.data().gameCode, provider: "ag", status: "launched", at: j.serverTimestamp() }), { gameUrl: p, gameCode: r.data().gameCode, gameName: r.data().name || "", expireTime: f.data?.expireTime || null };
  }));
  H.agExitGame = ie({ region: z }, ue(async (e) => {
    let t = b.authUid(e), n = S.doc(`agSessions/${t}`);
    return await S.runTransaction(async (a) => {
      let r = await a.get(n);
      r.exists && r.data().status === "active" && a.update(n, { status: "closed", closedAt: j.serverTimestamp() });
    }), { ok: !0 };
  }));
  async function La(e, t, n, { revokeTokens: a = !1, reason: r = "" } = {}) {
    let s = "SKIPPED", o = "";
    try {
      let c = await W.call(e, "/game/v5/player/force/logout", { playerId: t });
      s = c.data?.logoutStatus || "SUCCESS", o = c.data?.message || "";
    } catch (c) {
      s = "FAILED", o = cn(c).message;
    }
    return await S.doc(`agSessions/${t}`).set({ uid: t, status: "forced", forcedAt: j.serverTimestamp(), forcedBy: n, forceReason: r, providerLogout: s }, { merge: !0 }), a && (await Is.auth().revokeRefreshTokens(t), await S.doc(`users/${t}`).set({ sessionsRevokedAt: j.serverTimestamp() }, { merge: !0 })), await S.collection("users").doc(t).collection("notifications").add({
      title: "Signed out of games",
      body: r || "Your game session was ended by support.",
      type: "security",
      read: !1,
      createdAt: j.serverTimestamp()
    }), { playerId: t, logoutStatus: s, message: o };
  }
  H.adminForceLogout = ie({ region: z, timeoutSeconds: 300 }, ue(async (e) => {
    let t = b.requireRole(e, ["super", "support"]), n = e.data || {}, a = await we(), r = typeof n.reason == "string" ? n.reason.trim().slice(0, 200) : "", s = [];
    n.all === !0 ? s = (await S.collection("agSessions").where("status", "==", "active").limit(200).get()).docs.map((d) => d.id) : s = [b.str(n.uid, { max: 128, label: "Player", pattern: st })];
    let o = [];
    for (let c of s) o.push(await La(a, c, t, { revokeTokens: n.revokeTokens === !0, reason: r }));
    return b.audit(null, t, "ag_force_logout", { count: o.length, all: n.all === !0, revokeTokens: n.revokeTokens === !0, failed: o.filter((c) => c.logoutStatus === "FAILED").length }), { ok: !0, results: o };
  }));
  H.forceLogoutOne = La;
  H.adminAgRtp = ie({ region: z, timeoutSeconds: 60 }, ue(async (e) => {
    let t = b.requireRole(e, ["super", "finance"]), n = e.data || {}, a = await we(), r = a.currencyCode, s, o = null;
    switch (n.action) {
      case "subMerchant": {
        let c = b.str(n.subMerchantCode || a.subMerchantCode, { max: 50, label: "Sub-merchant", pattern: It }), d = Pe(n.rtp, 1, 100, "RTP");
        s = await W.call(a, "/game/v5/set/sub/merchant/rtp", { subMerchantCode: c, rtp: d, currencyCode: r }), o = { scope: "SUB_MERCHANT", subMerchantCode: c, rtp: d, changed: s.data?.changedRtpValue };
        break;
      }
      case "player": {
        let c = b.str(n.playerId, { max: 128, label: "Player", pattern: st }), d = Pe(n.rtp, 1, 100, "RTP");
        s = await W.call(a, "/game/v5/set/player/rtp", { currencyCode: r, rtp: d, playerId: c }), o = { scope: "PLAYER", playerId: c, rtp: d, changed: s.data?.changedRtpValue };
        break;
      }
      case "batch": {
        let c = [...new Set((Array.isArray(n.playerIds) ? n.playerIds : []).map((i) => String(i).trim()).filter(Boolean))];
        if (!c.length || c.length > 50) throw b.bad("Provide 1-50 player IDs.");
        if (c.some((i) => !st.test(i))) throw b.bad("One of the player IDs is invalid.");
        let d = Pe(n.rtp, 1, 100, "RTP");
        s = await W.call(a, "/game/v5/batch/set/player/rtp", { currencyCode: r, rtp: d, playerIds: c }), o = { scope: "BATCH", playerIds: c, rtp: d, accepted: !0 };
        break;
      }
      case "effective": {
        let c = { currencyCode: r };
        n.subMerchantCode && (c.subMerchantCode = b.str(n.subMerchantCode, { max: 50, pattern: It, label: "Sub-merchant" })), n.playerId && (c.playerId = b.str(n.playerId, { max: 128, pattern: st, label: "Player" })), s = await W.call(a, "/game/v5/rtp/effective", c);
        break;
      }
      case "history": {
        let c = _t(n.startTime, "Start time"), d = _t(n.endTime, "End time");
        if (c.ms >= d.ms) throw b.bad("Start time must be before end time.");
        if (c.ms < Date.now() - 31 * 864e5) throw b.bad("Only the past month can be queried (PDF \xA75.4.4).");
        let i = { currencyCode: r, startTime: c.s, endTime: d.s, pageSize: Pe(n.pageSize ?? 20, 1, 100, "Page size") };
        n.cursor && (i.cursor = b.str(n.cursor, { max: 200, label: "Cursor" })), n.subMerchantCode && (i.subMerchantCode = b.str(n.subMerchantCode, { max: 50, pattern: It, label: "Sub-merchant" })), n.playerId && (i.playerId = b.str(n.playerId, { max: 128, pattern: st, label: "Player" })), Array.isArray(n.playerIds) && n.playerIds.length && (i.playerIds = n.playerIds.slice(0, 50).map(String)), s = await W.call(a, "/game/v5/rtp/change/history", i);
        break;
      }
      default:
        throw b.bad("Unknown RTP action.");
    }
    return o && (await S.collection("agRtpChanges").add({ ...o, currencyCode: r, by: t, at: j.serverTimestamp() }), b.audit(null, t, "ag_rtp_change", o)), { ok: !0, data: s.data ?? {} };
  }));
  async function Ga(e, { startIso: t, endIso: n, pageNum: a, pageSize: r, sort: s }) {
    let c = (await W.call(e, "/game/v5/game/record", { pageNum: a, pageSize: r, reqData: { startTime: t, endTime: n, sort: s } })).data?.gameRecordList || [];
    if (c.length) {
      let d = S.batch();
      for (let i of c) {
        if (i.orderNo === void 0 || i.orderNo === null) continue;
        let u = i.playerId || i.playerUniqueId || "", l = Number(i.betAmount) || 0, m = Number(i.winAmount) || 0;
        d.set(S.doc(`agGameRecords/${String(i.orderNo)}`), {
          orderNo: String(i.orderNo),
          playerId: u,
          uid: u,
          betAmount: l,
          winAmount: m,
          ggr: Math.round((l - m) * 100) / 100,
          betTime: i.betTime || "",
          winTime: i.winTime || "",
          betTimeMs: Date.parse(i.betTime) || 0,
          gameCode: i.gameCode || "",
          currencyCode: i.currencyCode || "",
          roundId: i.roundId || "",
          syncedAt: j.serverTimestamp()
        }, { merge: !0 });
      }
      await d.commit();
    }
    return c;
  }
  H.adminAgGameRecords = ie({ region: z, timeoutSeconds: 120 }, ue(async (e) => {
    b.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, n = await we(), a = _t(t.startTime, "Start time"), r = _t(t.endTime, "End time");
    if (a.ms >= r.ms) throw b.bad("Start time must be before end time.");
    let s = await Ga(n, { startIso: a.s, endIso: r.s, pageNum: Pe(t.pageNum ?? 1, 1, 1e5, "Page"), pageSize: Pe(t.pageSize ?? 20, 1, 100, "Page size"), sort: t.sort !== !1 });
    return { ok: !0, records: s, hasMore: s.length >= (Number(t.pageSize) || 20) };
  }));
  async function qa(e) {
    let n = (await W.call(e, "/game/v5/merchant/info", {})).data || {}, a = n.apiType === 0 || n.apiType === "0" || n.apiType === "SINGLE_WALLET" ? "SINGLE_WALLET" : n.apiType === 1 || n.apiType === "1" || n.apiType === "TRANSFER_WALLET" ? "TRANSFER_WALLET" : String(n.apiType ?? ""), r = (n.walletInfos || []).map((c) => ({ billingMode: c.billingMode || "", rtp: Number(c.rtp) || null, currencyCode: c.currencyCode || "", balance: Number(c.balance) || 0 })), s = r.find((c) => c.currencyCode === e.currencyCode), o = {
      merchantName: n.merchantName || "",
      merchantCode: n.merchantCode || e.merchantCode,
      apiType: a,
      apiTypeOk: a === "SINGLE_WALLET",
      singleControlInGlobal: !!n.singleControlInGlobal,
      callbackUrl: n.callbackUrl || "",
      whiteIps: n.whiteIps || "",
      walletInfos: r,
      balance: s ? s.balance : null,
      currencyCode: e.currencyCode,
      status: s ? s.balance > 0 ? "ACTIVE" : "NO_BALANCE" : "NO_WALLET_FOR_CURRENCY",
      syncedAt: j.serverTimestamp()
    };
    return await S.doc("adminConfig/agMerchant").set(o), o;
  }
  H.adminAgMerchantInfo = ie({ region: z, timeoutSeconds: 60 }, ue(async (e) => (b.requireRole(e, ["super", "finance"]), { ok: !0, merchant: { ...await qa(await we({ fresh: !0 })), syncedAt: Date.now() } })));
  H.adminAgReport = ie({ region: z, timeoutSeconds: 60 }, ue(async (e) => {
    b.requireRole(e, ["super", "finance"]);
    let t = e.data || {}, n = Number(t.from) || Date.now() - 864e5, a = Number(t.to) || Date.now();
    if (n >= a || a - n > 400 * 864e5) throw b.bad("Invalid date range.");
    let r = S.collection("agBets").where("at", ">=", n).where("at", "<", a), [s, o, c, d] = await Promise.all([
      r.aggregate({ bets: We.sum("betAmount"), wins: We.sum("winAmount"), reversed: We.sum("winReversed"), n: We.count() }).get(),
      r.where("status", "==", "cancelled").aggregate({ refunded: We.sum("betAmount"), n: We.count() }).get(),
      S.collection("statsShards").get(),
      S.collection("agSessions").where("status", "==", "active").count().get()
    ]), i = s.data(), u = o.data(), l = (i.bets || 0) - (u.refunded || 0), m = (i.wins || 0) - (i.reversed || 0), f = {};
    return c.docs.filter((p) => p.id.startsWith("ag_")).forEach((p) => {
      for (let [w, T] of Object.entries(p.data())) f[w] = Math.round(((f[w] || 0) + (Number(T) || 0)) * 100) / 100;
    }), {
      ok: !0,
      range: { from: n, to: a },
      betCount: i.n || 0,
      cancelledCount: u.n || 0,
      turnover: Math.round(l * 100) / 100,
      payout: Math.round(m * 100) / 100,
      ggr: Math.round((l - m) * 100) / 100,
      rtpActual: l > 0 ? Math.round(m / l * 1e4) / 100 : null,
      activeSessions: d.data().count,
      lifetime: f
    };
  }));
  H.agScheduledSync = Da({ region: z, schedule: "every 30 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    let e;
    try {
      e = await we({ fresh: !0 });
    } catch {
      return;
    }
    try {
      await qa(e);
    } catch (n) {
      console.error("merchant sync", n.message);
    }
    try {
      let n = /* @__PURE__ */ new Date(), a = new Date(n.getTime() - 40 * 6e4);
      for (let r = 1; r <= 50 && !((await Ga(e, { startIso: a.toISOString(), endIso: n.toISOString(), pageNum: r, pageSize: 100, sort: !1 })).length < 100); r++)
        ;
    } catch (n) {
      console.error("records sync", n.message);
    }
    let t = await S.collection("agSessions").where("status", "==", "active").where("launchedAtMs", "<", Date.now() - 12 * 36e5).limit(400).get();
    if (!t.empty) {
      let n = S.batch();
      t.docs.forEach((a) => n.update(a.ref, { status: "expired", closedAt: j.serverTimestamp() })), await n.commit();
    }
  });
  H.agCleanup = Da({ region: z, schedule: "every day 04:10", timeZone: "Asia/Dhaka", timeoutSeconds: 540 }, async () => {
    let e = /* @__PURE__ */ new Date();
    for (let t of ["agNonces", "agCallbackLogs", "agApiLogs"])
      for (let n = 0; n < 40; n++) {
        let a = await S.collection(t).where("expireAt", "<", e).limit(400).get();
        if (a.empty) break;
        let r = S.batch();
        a.docs.forEach((s) => r.delete(s.ref)), await r.commit();
      }
  });
  H.LOBBY = Ns;
});

// src/account.js
var ja = O((ot) => {
  "use strict";
  var { onCall: $t } = ne(), Q = ae(), { db: Oe, admin: ln, FieldValue: Nt, HttpsError: Os, REGION: Et } = Q;
  ot.setResponsibleGaming = $t({ region: Et }, async (e) => {
    let t = Q.authUid(e), n = e.data || {}, a = Oe.doc(`users/${t}`), r = {};
    if (await Oe.runTransaction(async (s) => {
      let o = await s.get(a);
      Q.assertActive(o.data());
      let c = { ...o.data().rg || {} }, d = Date.now();
      if (c.pendingLimitAt && c.pendingLimitAt <= d && (c.dailyDepositLimit = c.pendingLimit, delete c.pendingLimit, delete c.pendingLimitAt), n.dailyDepositLimit !== void 0) {
        let i = Number(n.dailyDepositLimit) || 0;
        if (i < 0 || i > 1e8) throw Q.bad("Invalid limit.");
        let u = Number(c.dailyDepositLimit) || 0;
        i > 0 && (u === 0 || i < u) ? (c.dailyDepositLimit = Q.round2(i), delete c.pendingLimit, delete c.pendingLimitAt, r.applied = "now") : i !== u && (c.pendingLimit = Q.round2(i), c.pendingLimitAt = d + 24 * 36e5, r.applied = "in24h");
      }
      if (n.excludeDays !== void 0) {
        let i = Number(n.excludeDays);
        if (![1, 7, 30, 90, 180, 365].includes(i)) throw Q.bad("Choose 1, 7, 30, 90, 180 or 365 days.");
        let u = d + i * 864e5, l = c.excludedUntil?.toMillis ? c.excludedUntil.toMillis() : Number(c.excludedUntil) || 0;
        c.excludedUntil = Math.max(l, u), r.excludedUntil = c.excludedUntil, s.set(Oe.doc(`agSessions/${t}`), { uid: t, status: "forced", forcedAt: Nt.serverTimestamp(), forceReason: "self-exclusion" }, { merge: !0 });
      }
      s.update(a, { rg: c }), r.rg = c;
    }), r.excludedUntil)
      try {
        let { loadConfig: s } = St();
        await nn().call(await s(), "/game/v5/player/force/logout", { playerId: t }, { retries: 1 });
      } catch (s) {
        console.warn("self-exclusion provider logout", s.message);
      }
    return { ok: !0, ...r };
  });
  ot.revokeMySessions = $t({ region: Et }, async (e) => {
    let t = Q.authUid(e);
    return await ln.auth().revokeRefreshTokens(t), await Oe.doc(`users/${t}`).set({ sessionsRevokedAt: Nt.serverTimestamp() }, { merge: !0 }), await Oe.collection("loginHistory").add({ uid: t, event: "logout_all", at: Nt.serverTimestamp() }), { ok: !0 };
  });
  ot.adminListStaff = $t({ region: Et }, async (e) => (Q.requireRole(e, ["super"]), { staff: (await Oe.collection("users").where("role", "in", Q.STAFF_ROLES).limit(100).get()).docs.map((n) => ({ uid: n.id, name: n.data().name || "", username: n.data().username || "", email: n.data().email || "", role: n.data().role, status: n.data().status })) }));
  ot.adminSignOutUser = $t({ region: Et, timeoutSeconds: 60 }, async (e) => {
    let t = Q.requireRole(e, ["super", "support"]), n = Q.str((e.data || {}).uid, { max: 128, label: "User" });
    if (!await ln.auth().getUser(n).catch(() => null)) throw new Os("not-found", "User not found.");
    await ln.auth().revokeRefreshTokens(n), await Oe.doc(`users/${n}`).set({ sessionsRevokedAt: Nt.serverTimestamp() }, { merge: !0 });
    try {
      let { loadConfig: r } = St(), { forceLogoutOne: s } = dn();
      await s(await r(), n, t, { reason: "Signed out by support" });
    } catch (r) {
      console.warn("provider logout", r.message);
    }
    return Q.audit(null, t, "user_signed_out", { uid: n }), { ok: !0 };
  });
});

// src/fswrite.js
var Ya = O((Ka) => {
  "use strict";
  var { onCall: Ms } = ne(), De = ae(), { db: xa, HttpsError: Ha, REGION: Ds } = De, { merge: Fa, setPath: Us, plain: Bs } = Ye(), Me = (e) => typeof e == "number" && Number.isFinite(e), ke = (e) => typeof e == "string", Va = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  }, ce = (e, t) => t.includes(Va(e)), Wa = (e) => new Ha("permission-denied", e || "You do not have permission."), Ls = (e, t) => [.../* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])].filter((a) => JSON.stringify((e || {})[a]) !== JSON.stringify((t || {})[a])), Rt = (e, t, n) => Ls(e, t).every((a) => n.includes(a)), N = (e, t) => {
    if (!e) throw Wa(t);
  };
  function Gs(e, t, n, a, r, s) {
    let o = n.split("/"), c = Va(e) !== null;
    if (o[0] === "users" && o.length === 2) {
      N(a === "update" && t === o[1], "Not allowed."), N(Rt(r, s, ["name", "phone", "photoURL", "lastSeenAt"]), "You cannot change that field."), N(ke(s.name) && s.name.length >= 2 && s.name.length <= 60, "Name must be 2-60 characters."), N(ke(s.phone) && /^\+?[0-9]{8,15}$/.test(s.phone), "Invalid phone number."), N(ke(s.photoURL) && s.photoURL.length < 600, "Invalid photo.");
      return;
    }
    if (o[0] === "users" && o[2] === "notifications" && o.length === 4) {
      if (N(t === o[1], "Not allowed."), a === "delete") return;
      N(a === "update" && Rt(r, s, ["read"]) && typeof s.read == "boolean", "Not allowed.");
      return;
    }
    if (o[0] === "users" && o[2] === "devices" && o.length === 4) {
      if (N(t === o[1], "Not allowed."), a === "delete") return;
      N(Object.keys(s).every((d) => ["platform", "updatedAt"].includes(d)) && ke(s.platform), "Invalid device.");
      return;
    }
    if (o[0] === "users" && o[2] === "private" && o[3] === "withdrawAccounts" && o.length === 4) {
      if (N(t === o[1], "Not allowed."), a === "delete") return;
      N(Object.keys(s).every((d) => ["list", "updatedAt"].includes(d)) && Array.isArray(s.list) && s.list.length <= 6, "Invalid saved accounts.");
      return;
    }
    if (o[0] === "paymentMethods" && o.length === 2) {
      if (N(ce(e, ["super", "finance"])), a === "delete") return;
      N(ke(s.name) && s.name.length > 0 && s.name.length <= 60 && typeof s.enabled == "boolean", "Invalid payment method."), N(s.type === void 0 || ["deposit", "withdraw", "both"].includes(s.type), "Invalid type."), N(s.minAmount === void 0 || Me(s.minAmount) && s.minAmount >= 0, "Invalid minimum.");
      return;
    }
    if (o[0] === "paymentAccounts" && o.length === 2) {
      if (N(ce(e, ["super", "finance"])), a === "delete") return;
      N(ke(s.methodId) && ke(s.accountNumber) && ["active", "disabled", "maintenance", "locked", "archived"].includes(s.status) && Me(s.dailyLimit) && Me(s.monthlyLimit), "Invalid payment account.");
      return;
    }
    if (o[0] === "paymentAccounts" && o[2] === "private" && o.length === 4) {
      N(ce(e, ["super", "finance"]));
      return;
    }
    if ((o[0] === "banners" || o[0] === "legal") && o.length === 2) {
      N(ce(e, ["super", "content"]));
      return;
    }
    if (o[0] === "bonuses" && o.length === 2) {
      if (N(ce(e, ["super", "content", "finance"])), a === "delete") return;
      N(ke(s.title) && Me(s.amount) && s.amount > 0 && s.amount <= 1e6 && ["once", "daily", "weekly"].includes(s.type) && typeof s.enabled == "boolean", "Invalid bonus.");
      return;
    }
    if (o[0] === "lotteries" && o.length === 2) {
      if (N(ce(e, ["super", "content"])), a === "delete") {
        N(r && r.sold === 0, "Tickets were already sold.");
        return;
      }
      if (!r) {
        N(s.sold === 0 && s.status === "open" && Me(s.price) && Me(s.prize) && Me(s.totalTickets), "Invalid lottery.");
        return;
      }
      N(Rt(r, s, ["title", "price", "prize", "endsAt", "totalTickets", "maxPerUser", "imageUrl", "status"]), "You cannot change that field."), N(["open", "closed"].includes(s.status) && ["open", "closed"].includes(r.status) && s.totalTickets >= r.sold, "Invalid lottery.");
      return;
    }
    if (o[0] === "games" && o.length === 2) {
      N(a === "update" && ce(e, ["super", "content"]) && Rt(r, s, ["enabled", "featured", "sort", "lobbyCategory", "name", "imageUrl"]), "Not allowed.");
      return;
    }
    if (o[0] === "settings" && o.length === 2) {
      let d = o[1];
      N(d === "support" && ce(e, ["super", "support"]) || d === "content" && ce(e, ["super", "content", "support"]) || d === "site" && ce(e, ["super", "finance"]) || !["support", "content", "site"].includes(d) && ce(e, ["super"]), "Not allowed.");
      return;
    }
    throw Wa("Not allowed.");
  }
  Ka.fsWrite = Ms({ region: Ds }, async (e) => {
    let t = De.authUid(e), n = (e.data || {}).ops;
    if (!Array.isArray(n) || !n.length || n.length > 400) throw De.bad("Invalid request.");
    return await xa.runTransaction(async (a) => {
      let r = [];
      for (let s of n) {
        let o = De.str(s.path, { max: 300, label: "Path" });
        if (!/^[A-Za-z0-9_\-./]+$/.test(o) || o.includes("..") || o.split("/").length % 2 !== 0) throw De.bad("Invalid path.");
        let c = xa.doc(o), d = await a.get(c), i = d.exists ? d.data() : void 0, u = s.op === "create" ? "set" : s.op;
        if (!["set", "update", "delete"].includes(u)) throw De.bad("Invalid operation.");
        let l;
        if (u === "delete") l = void 0;
        else {
          let m = Bs(s.data || {});
          if (typeof m != "object" || Array.isArray(m)) throw De.bad("Invalid data.");
          if (u === "update") {
            if (!i) throw new Ha("not-found", "Document not found.");
            l = JSON.parse(JSON.stringify(i));
            for (let [f, p] of Object.entries(m)) Us(l, f, p);
          } else l = s.merge && i ? Fa(JSON.parse(JSON.stringify(i)), m) : Fa({}, m);
        }
        Gs(e, t, o, u === "delete" ? "delete" : i ? "update" : "create", i, l), r.push({ ref: c, type: u, data: s.data, merge: !!s.merge });
      }
      for (let s of r)
        s.type === "delete" ? a.delete(s.ref) : s.type === "update" ? a.update(s.ref, s.data) : a.set(s.ref, s.data, { merge: s.merge });
    }), { ok: !0 };
  });
});

// src/index.js
var za = O((it) => {
  "use strict";
  Object.assign(
    it,
    Bn(),
    qn(),
    Hn(),
    Jn(),
    Xn(),
    dn(),
    ja(),
    Ya()
  );
  delete it.ensureUserDoc;
  delete it.LOBBY;
  delete it.forceLogoutOne;
});

// supa/handler.js
var er = O((Co, Qa) => {
  "use strict";
  var K = ut(), { HttpsError: Xa } = ne(), qs = {
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
  }, js = (e) => String(e).toUpperCase().replace(/-/g, "_"), xs = null, un = () => xs ||= za();
  function Za(e) {
    return {
      "access-control-allow-origin": K.env.ALLOWED_ORIGIN || "*",
      "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-max-age": "86400",
      vary: "origin",
      ...e
    };
  }
  var ye = (e, t, n) => ({ status: e, headers: Za({ "content-type": "application/json", "cache-control": "no-store", ...n || {} }), body: JSON.stringify(t) }), Fs = (e) => e instanceof Xa || e && e.name === "HttpsError" ? ye(qs[e.code] || 500, { error: { status: js(e.code), code: e.code, message: e.message, details: e.details === void 0 ? null : e.details } }) : (console.error("unhandled", e && e.stack || e), ye(500, { error: { status: "INTERNAL", code: "internal", message: "Something went wrong on the server. Please try again.", details: null } })), Pt = K.tokenCache = /* @__PURE__ */ new Map();
  async function Hs(e) {
    if (K.verifyToken) return K.verifyToken(e);
    let t = Pt.get(e);
    if (t && t.exp > Date.now()) return t.user;
    let n = String(K.env.SUPABASE_URL || "").replace(/\/$/, "") + "/auth/v1/user", a = await K.fetch(n, { headers: { apikey: K.env.SUPABASE_ANON_KEY || K.env.SUPABASE_SERVICE_ROLE_KEY || "", authorization: "Bearer " + e } });
    if (!a.ok) return null;
    let r = await a.json();
    if (!r || !r.id) return null;
    let s = { uid: r.id, email: r.email || "", confirmed: !!r.email_confirmed_at, app: r.app_metadata || {}, lastSignIn: r.last_sign_in_at };
    return Pt.set(e, { user: s, exp: Date.now() + (Number(K.env.TOKEN_CACHE_MS) >= 0 && K.env.TOKEN_CACHE_MS !== void 0 && K.env.TOKEN_CACHE_MS !== "" ? Number(K.env.TOKEN_CACHE_MS) : 3e3) }), Pt.size > 500 && Pt.clear(), s;
  }
  var Vs = (e) => e && {
    uid: e.uid,
    token: { uid: e.uid, email: e.email, email_verified: e.confirmed || !K.requireVerified(), admin: e.app.admin === !0, role: e.app.role || null, auth_time: e.lastSignIn ? Math.floor(Date.parse(e.lastSignIn) / 1e3) : void 0 }
  }, Ja = (e) => e == null ? Buffer.alloc(0) : Buffer.from(e), Ws = (e) => {
    let t = {};
    for (let [n, a] of Object.entries(e || {})) t[String(n).toLowerCase()] = a;
    return t;
  };
  async function Ks(e) {
    let t = Ws(e.headers), n = String(e.method || "GET").toUpperCase();
    if (n === "OPTIONS") return { status: 204, headers: Za(), body: "" };
    let r = new URL(e.url, "http://x").pathname, s = r.indexOf("/api/");
    s >= 0 ? r = r.slice(s + 4) : r.endsWith("/api") && (r = "/"), r = r.replace(/\/+$/, "") || "/";
    try {
      if (r === "/health") return ye(200, { ok: !0, time: Date.now() });
      if (r === "/agw" || r.startsWith("/agw/")) {
        let p = un().agCallback, w = { status: 200, headers: {}, body: "" }, T = { status(g) {
          return w.status = g, T;
        }, set(g) {
          return Object.assign(w.headers, g), T;
        }, send(g) {
          return w.body = g, T;
        } };
        return await p({ method: n, path: r, url: r, headers: t, rawBody: Ja(e.body), ip: t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : "" }, T), { status: w.status, headers: { "cache-control": "no-store", ...w.headers }, body: typeof w.body == "string" ? w.body : JSON.stringify(w.body) };
      }
      if (r.startsWith("/_cron/")) {
        if (!K.env.CRON_SECRET || t["x-cron-secret"] !== K.env.CRON_SECRET) return ye(401, { error: { code: "unauthenticated", message: "bad secret" } });
        let p = un()[r.slice(7)];
        return !p || p.__kind !== "schedule" ? ye(404, { error: { code: "not-found", message: "unknown job" } }) : (await p(), ye(200, { ok: !0 }));
      }
      if (n !== "POST") return ye(405, { error: { code: "invalid-argument", message: "POST only" } });
      let o = r.slice(1), c = un()[o];
      if (!c || c.__kind !== "call") return ye(404, { error: { status: "NOT_FOUND", code: "not-found", message: "Unknown function." } });
      let d = null, i = /^Bearer\s+(.+)$/i.exec(t.authorization || "");
      if (i) {
        let p = await Hs(i[1]).catch(() => null);
        p && (d = Vs(p));
      }
      let u = {}, l = Ja(e.body).toString("utf8");
      if (l)
        try {
          let p = JSON.parse(l);
          u = p && p.data !== void 0 ? p.data : p;
        } catch {
          throw new Xa("invalid-argument", "Bad JSON.");
        }
      let m = t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : t["cf-connecting-ip"] || "", f = await c({ data: u, auth: d, rawRequest: { headers: t, ip: m } });
      return ye(200, { result: f === void 0 ? null : f });
    } catch (o) {
      return Fs(o);
    }
  }
  Qa.exports = { handle: Ks };
});

// supa/entry-deno.mjs
var tr = wn(ut(), 1), nr = wn(er(), 1);
import Ys from "npm:postgres@3.4.4";
var ar = {};
for (let e of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET", "REQUIRE_VERIFIED", "ALLOWED_ORIGIN"]) ar[e] = Deno.env.get(e) || "";
var zs = Deno.env.get("DB_URL") || Deno.env.get("SUPABASE_DB_URL"), Js = Ys(zs, { max: 4, prepare: !1, idle_timeout: 20, connect_timeout: 10, onnotice() {
} });
tr.default.configure({ sql: Js, env: ar });
Deno.serve(async (e) => {
  let t = {};
  e.headers.forEach((r, s) => {
    t[s] = r;
  });
  let n = e.method === "GET" || e.method === "HEAD" || e.method === "OPTIONS" ? void 0 : new Uint8Array(await e.arrayBuffer()), a = await (0, nr.handle)({ method: e.method, url: e.url, headers: t, body: n });
  return new Response(a.status === 204 ? null : a.body, { status: a.status, headers: a.headers });
});
