// @ts-nocheck
import { createRequire as __cr } from "node:module";
import { Buffer as __Buf } from "node:buffer";
import __proc from "node:process";
const require = __cr("file:///src/index.ts");
globalThis.Buffer = globalThis.Buffer || __Buf;
globalThis.process = globalThis.process || __proc;
var si = Object.create;
var fs = Object.defineProperty;
var oi = Object.getOwnPropertyDescriptor;
var ri = Object.getOwnPropertyNames;
var ii = Object.getPrototypeOf, ci = Object.prototype.hasOwnProperty;
var ge = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, {
  get: (t, a) => (typeof require < "u" ? require : t)[a]
}) : e)(function(e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var D = (e, t) => () => {
  try {
    return t || e((t = { exports: {} }).exports, t), t.exports;
  } catch (a) {
    throw t = 0, a;
  }
};
var di = (e, t, a, n) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let s of ri(t))
      !ci.call(e, s) && s !== a && fs(e, s, { get: () => t[s], enumerable: !(n = oi(t, s)) || n.enumerable });
  return e;
};
var hs = (e, t, a) => (a = e != null ? si(ii(e)) : {}, di(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  t || !e || !e.__esModule ? fs(a, "default", { value: e, enumerable: !0 }) : a,
  e
));

// src/trace.js
var cn = D((wa) => {
  "use strict";
  var { AsyncLocalStorage: ui } = ge("async_hooks"), rn = new ui();
  wa.run = (e) => rn.run({ t0: Date.now(), marks: [] }, e);
  wa.mark = (e) => {
    let t = rn.getStore();
    t && t.marks.length < 40 && t.marks.push(`${e}@${Date.now() - t.t0}`);
  };
  wa.summary = () => {
    let e = rn.getStore();
    return e ? e.marks.join(" ") : "";
  };
});

// supa/pgdb.js
var Ft = D((zd, ys) => {
  "use strict";
  var li = ge("crypto"), { mark: ot } = cn(), mi = {
    increment: (e) => ({ __op: "inc", n: e }),
    serverTimestamp: () => ({ __op: "ts" })
  }, pi = {
    count: () => ({ aggregateType: "count" }),
    sum: (e) => ({ aggregateType: "sum", _field: e })
  }, fi = (e) => Object.defineProperties({ __ts: e }, {
    toMillis: { value: () => e },
    toDate: { value: () => new Date(e) },
    seconds: { value: Math.floor(e / 1e3) },
    nanoseconds: { value: e % 1e3 * 1e6 }
  });
  function ya(e) {
    if (Array.isArray(e)) return e.map(ya);
    if (e && typeof e == "object") {
      if (typeof e.__ts == "number" && Object.keys(e).length === 1) return fi(e.__ts);
      let t = {};
      for (let [a, n] of Object.entries(e)) t[a] = ya(n);
      return t;
    }
    return e;
  }
  function Le(e) {
    if (e instanceof Date) return { __ts: e.getTime() };
    if (Array.isArray(e)) return e.map(Le);
    if (e && typeof e == "object") {
      if (e.__op) return e;
      if (typeof e.toMillis == "function" && typeof e.__ts == "number") return { __ts: e.__ts };
      let t = {};
      for (let [a, n] of Object.entries(e)) n !== void 0 && (t[a] = Le(n));
      return t;
    }
    return e;
  }
  function ba(e, t) {
    if (t && t.__op === "inc") return (Number(e) || 0) + t.n;
    if (t && t.__op === "ts") return { __ts: Date.now() };
    if (Array.isArray(t)) return t.map((a) => ba(void 0, a));
    if (t && typeof t == "object" && typeof t.__ts != "number") {
      let a = {};
      for (let [n, s] of Object.entries(t)) a[n] = ba(void 0, s);
      return a;
    }
    return t;
  }
  function gs(e, t, a) {
    let n = t.split("."), s = e;
    for (let r = 0; r < n.length - 1; r++)
      (typeof s[n[r]] != "object" || s[n[r]] === null) && (s[n[r]] = {}), s = s[n[r]];
    let o = n[n.length - 1];
    s[o] = ba(s[o], a);
  }
  function rt(e, t) {
    for (let [a, n] of Object.entries(t))
      n && typeof n == "object" && !n.__op && !Array.isArray(n) && typeof n.__ts != "number" && e[a] && typeof e[a] == "object" && !Array.isArray(e[a]) && typeof e[a].__ts != "number" ? rt(e[a], n) : e[a] = ba(e[a], n);
    return e;
  }
  var dn = (e) => {
    let t = e.lastIndexOf("/");
    return { collection: e.slice(0, t), id: e.slice(t + 1) };
  }, _t = class {
    constructor(t, a) {
      this.ref = t, this.id = t.id, this._d = a, this.exists = a !== void 0;
    }
    data() {
      return this._d === void 0 ? void 0 : ya(JSON.parse(JSON.stringify(this._d)));
    }
  }, ws = (e) => {
    let t = new Error("ALREADY_EXISTS " + e);
    return t.code = 6, t;
  }, hi = (e) => {
    let t = new Error("NOT_FOUND " + e);
    return t.code = 5, t;
  }, un = class {
    /** @param sql a `postgres` (porsager) client */
    constructor(t) {
      this.sql = t;
    }
    doc(t) {
      return new Ct(this, t);
    }
    collection(t) {
      return new Aa(this, t);
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
      return ot("get"), n.length ? n[0].data : void 0;
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
      ot("lock+read");
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
          if (l !== void 0) throw ws(d.path);
          u = rt({}, Le(d.data));
        } else if (d.type === "set") u = d.merge && l ? rt(JSON.parse(JSON.stringify(l)), Le(d.data)) : rt({}, Le(d.data));
        else if (d.type === "update") {
          if (l === void 0) throw hi(d.path);
          u = JSON.parse(JSON.stringify(l));
          for (let [m, p] of Object.entries(Le(d.data))) gs(u, m, p);
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
        let { collection: u, id: m } = dn(d);
        r.push({ path: d, collection: u, id: m, data: l });
      }
      let c = [];
      r.length && c.push(t`insert into public.docs (path, collection, id, data)
        select t.path, t.collection, t.id, t.data from jsonb_to_recordset(${t.json(r)}::jsonb) as t(path text, collection text, id text, data jsonb)
        on conflict (path) do update set data = excluded.data`), i.length && c.push(t`delete from public.docs where path = any(${i}::text[])`), await Promise.all(c), ot("write");
    }
    async _one(t) {
      return this.sql.begin((a) => this._applyAll(a, [t]));
    }
    /** Reads first, writes buffered and applied atomically (retried on deadlock / serialization failure like Firestore). */
    async runTransaction(t) {
      for (let a = 0; ; a++)
        try {
          return await this.sql.begin(async (n) => {
            ot("txopen");
            let s = [], o = {
              get: async (i) => i instanceof Ct ? new _t(i, await this._lockRead(n, i.path)) : typeof i._exec == "function" ? i._exec(n) : i.get(),
              getAll: async (...i) => Promise.all(i.map(async (c) => new _t(c, await this._lockRead(n, c.path)))),
              set: (i, c, d = {}) => (s.push({ type: "set", path: i.path, data: c, merge: !!d.merge }), o),
              update: (i, c) => (s.push({ type: "update", path: i.path, data: c }), o),
              create: (i, c) => (s.push({ type: "create", path: i.path, data: c }), o),
              delete: (i) => (s.push({ type: "delete", path: i.path }), o)
            }, r = await t(o);
            return ot("fn"), await this._applyAll(n, s), ot("applied"), r;
          });
        } catch (n) {
          if ((n.code === "40P01" || n.code === "40001") && a < 4) {
            await new Promise((s) => setTimeout(s, 30 * (a + 1) + Math.random() * 40));
            continue;
          }
          throw n;
        }
    }
  }, Ct = class {
    constructor(t, a) {
      this.db = t, this.path = a, this.id = a.split("/").pop();
    }
    async get() {
      let t = await this.db.sql`select data from public.docs where path = ${this.path}`;
      return new _t(this, t.length ? t[0].data : void 0);
    }
    /** Plain overwrite = one atomic upsert statement (1 round trip, no transaction). */
    async set(t, a = {}) {
      if (a.merge) return this.db._one({ type: "set", path: this.path, data: t, merge: !0 });
      let { collection: n, id: s } = dn(this.path);
      await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${n}, ${s}, ${this.db.sql.json(rt({}, Le(t)))}::jsonb)
                      on conflict (path) do update set data = excluded.data`;
    }
    update(t) {
      return this.db._one({ type: "update", path: this.path, data: t });
    }
    /** create = one `insert … on conflict do nothing` (1 round trip); no row back → ALREADY_EXISTS. */
    async create(t) {
      let { collection: a, id: n } = dn(this.path), s = await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${a}, ${n}, ${this.db.sql.json(rt({}, Le(t)))}::jsonb)
                                on conflict (path) do nothing returning path`;
      if (ot("create"), !s.length) throw ws(this.path);
    }
    delete() {
      return this.db._one({ type: "delete", path: this.path });
    }
    collection(t) {
      return new Aa(this.db, `${this.path}/${t}`);
    }
  }, ln = class e {
    constructor(t, a, n = [], s = [], o = null, r = null) {
      Object.assign(this, { db: t, path: a, f: n, o: s, lim: o, after: r });
    }
    where(t, a, n) {
      return new e(this.db, this.path, [...this.f, [t, a, Le(n)]], this.o, this.lim, this.after);
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
      let n = (await t`select * from public.fs_query(${this.path}::text, ${t.json(this.f)}::jsonb, ${t.json(this.o)}::jsonb, ${this.lim}::int, ${this.after ? this.after.ref.path : null}::text)`).map((s) => new _t(new Ct(this.db, s.path), s.data));
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
  }, Aa = class extends ln {
    constructor(t, a) {
      super(t, a);
    }
    doc(t) {
      return new Ct(this.db, `${this.path}/${t || li.randomBytes(10).toString("hex")}`);
    }
    async add(t) {
      let a = this.doc();
      return await a.set(t), a;
    }
  };
  ys.exports = { PgDb: un, FieldValue: mi, AggregateField: pi, revive: ya, plain: Le, merge: rt, setPath: gs };
});

// supa/runtime.js
var It = D((Wd, bs) => {
  "use strict";
  var qe = { sql: null, db: null, env: {}, fetch: (...e) => fetch(...e) };
  qe.configure = ({ sql: e, env: t, fetch: a }) => {
    let { PgDb: n } = Ft();
    return qe.sql = e, qe.db = new n(e), qe.env = t || {}, globalThis.__ENV = qe.env, a && (qe.fetch = a), qe;
  };
  qe.requireVerified = () => String(qe.env.REQUIRE_VERIFIED || "0") === "1";
  bs.exports = qe;
});

// supa/shims/functions-https.js
var X = D((Vd, As) => {
  "use strict";
  var mn = class extends Error {
    constructor(t, a, n) {
      super(a), this.code = t, this.details = n, this.name = "HttpsError";
    }
  }, gi = (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "call", a;
  }, wi = (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "request", a;
  };
  As.exports = { HttpsError: mn, onCall: gi, onRequest: wi };
});

// supa/shims/functions-v1.js
var vs = D((Yd, ks) => {
  "use strict";
  var Ts = () => {
    let e = () => {
    };
    return e.__kind = "trigger", e;
  };
  ks.exports = { region: () => ({ auth: { user: () => ({ onCreate: Ts, onDelete: Ts }) } }) };
});

// supa/shims/firebase-admin.js
var Es = D((Jd, pn) => {
  "use strict";
  var W = It(), { FieldValue: Is, AggregateField: yi } = Ft(), $s = () => W.db;
  $s.FieldValue = Is;
  var bi = new Proxy($s, { get: (e, t) => t === "FieldValue" ? Is : t === "AggregateField" ? yi : W.db[t] && typeof W.db[t] == "function" ? W.db[t].bind(W.db) : e[t] }), Ss = (e) => e && {
    uid: e.id,
    email: e.email || "",
    emailVerified: !!e.email_confirmed_at || !W.requireVerified(),
    displayName: e.raw_user_meta_data && (e.raw_user_meta_data.displayName || e.raw_user_meta_data.name) || "",
    disabled: !!e.banned_until && new Date(e.banned_until).getTime() > Date.now(),
    customClaims: e.raw_app_meta_data || {}
  }, _s = (e) => {
    let t = new Error(e || "There is no user record");
    return t.code = "auth/user-not-found", t;
  }, Ai = {
    async getUser(e) {
      let t = await W.sql`select * from auth.users where id = ${e}::uuid`;
      if (!t.length) throw _s();
      return Ss(t[0]);
    },
    async getUserByEmail(e) {
      let t = await W.sql`select * from auth.users where lower(email) = lower(${e}) limit 1`;
      if (!t.length) throw _s();
      return Ss(t[0]);
    },
    async updateUser(e, t) {
      t.displayName !== void 0 && await W.sql`update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || ${W.sql.json({ displayName: t.displayName })}::jsonb where id = ${e}::uuid`, t.disabled !== void 0 && (await W.sql`update auth.users set banned_until = case when ${!!t.disabled}::boolean then 'infinity'::timestamptz else null end where id = ${e}::uuid`, W.tokenCache && W.tokenCache.clear());
    },
    async setCustomUserClaims(e, t) {
      await W.sql`update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || ${W.sql.json(t)}::jsonb where id = ${e}::uuid`;
    },
    /** Kills every session of the user: their refresh tokens stop working and the access token is rejected on the next call. */
    async revokeRefreshTokens(e) {
      await W.sql`delete from auth.sessions where user_id = ${e}::uuid`, W.tokenCache && W.tokenCache.clear();
    }
  }, Cs = (e) => e.startsWith("deposits/") ? { bucket: "deposits", name: e.slice(9) } : { bucket: "pub", name: e }, Ti = () => ({
    bucket: () => ({
      file: (e) => ({
        async exists() {
          let t = Cs(e);
          return [(await W.sql`select 1 from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`).length > 0];
        },
        async getMetadata() {
          let t = Cs(e), a = await W.sql`select metadata from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`, n = a[0] && a[0].metadata || {};
          return [{ contentType: n.mimetype || n.contentType || "", size: Number(n.size) || 0 }];
        }
      })
    })
  }), ki = () => ({ sendEachForMulticast: async () => ({ responses: [] }) }), Ns = { apps: [1], initializeApp() {
  }, firestore: bi, auth: () => Ai, storage: Ti, messaging: ki };
  pn.exports = Ns;
  pn.exports.default = Ns;
});

// src/util.js
var H = D((Xd, Ds) => {
  "use strict";
  var Ht = Es(), { HttpsError: Xe } = X();
  Ht.apps.length || Ht.initializeApp();
  var $t = Ht.firestore(), Nt = Ht.firestore.FieldValue, vi = "asia-south1", Rs = ["main", "winning", "referral", "commission"], Si = ["super", "finance", "support", "content", "payout"], Je = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, it = (e) => new Xe("invalid-argument", e);
  function fn(e) {
    if (!e.auth) throw new Xe("unauthenticated", "Please sign in.");
    return e.auth.uid;
  }
  function _i(e) {
    let t = fn(e);
    if (!e.auth.token.email_verified) throw new Xe("failed-precondition", "Please verify your email first.");
    return t;
  }
  function Ci(e, t) {
    let a = fn(e), n = e.auth.token;
    if (n.admin !== !0 || !t.includes(n.role)) throw new Xe("permission-denied", "You do not have permission.");
    return a;
  }
  function Ii(e, { min: t = 0.01, max: a = 1e9, label: n = "Amount" } = {}) {
    let s = Number(e);
    if (!Number.isFinite(s)) throw it(`${n} must be a number.`);
    if (s < t) throw it(`${n} must be at least ${t}.`);
    if (s > a) throw it(`${n} must be at most ${a}.`);
    return Je(s);
  }
  function $i(e, { min: t = 1, max: a = 200, label: n = "Value", pattern: s = null } = {}) {
    if (typeof e != "string") throw it(`${n} is required.`);
    let o = e.trim();
    if (o.length < t || o.length > a) throw it(`${n} must be ${t}-${a} characters.`);
    if (s && !s.test(o)) throw it(`${n} has an invalid format.`);
    return o;
  }
  function Ni(e) {
    if (!e) throw new Xe("not-found", "User profile not found.");
    if (e.status !== "active") throw new Xe("permission-denied", "This account is not active.");
  }
  function Ei(e, t, a = ["main", "winning"]) {
    let n = Je(t);
    if (Je(a.reduce((r, i) => r + (Number(e?.[i]) || 0), 0)) < n) throw new Xe("failed-precondition", "Insufficient balance.");
    let o = {};
    for (let r of a) {
      let i = Math.min(Number(e?.[r]) || 0, n);
      if (i > 0 && (o[r] = Je(i), n = Je(n - i)), n <= 0) break;
    }
    return o;
  }
  function Ri(e, t, a) {
    let n = {};
    for (let [s, o] of Object.entries(a)) {
      if (!Rs.includes(s)) throw new Error("bad bucket " + s);
      n[`balances.${s}`] = Nt.increment(Je(o));
    }
    e.update(t, n);
  }
  function Di(e, { uid: t, type: a, direction: n, amount: s, bucket: o = "main", note: r = "", ref: i = "" }) {
    e.set($t.collection("transactions").doc(), {
      uid: t,
      type: a,
      direction: n,
      amount: Je(s),
      bucket: o,
      note: r,
      ref: i,
      createdAt: Nt.serverTimestamp()
    });
  }
  function Mi(e, t, a, n, s = "info") {
    e.set($t.collection("users").doc(t).collection("notifications").doc(), {
      title: a,
      body: n,
      type: s,
      read: !1,
      createdAt: Nt.serverTimestamp()
    });
  }
  function Pi(e, t) {
    let a = {};
    for (let [n, s] of Object.entries(t)) a[n] = Nt.increment(s);
    e.set($t.doc("stats/global"), a, { merge: !0 });
  }
  function Oi(e, t, a, n = {}) {
    let s = $t.collection("auditLogs").doc(), o = { actorUid: t, action: a, detail: n, at: Nt.serverTimestamp() };
    e ? e.set(s, o) : s.set(o);
  }
  async function Ui() {
    let e = await $t.doc("settings/site").get();
    return e.exists ? e.data() : {};
  }
  Ds.exports = {
    admin: Ht,
    db: $t,
    FieldValue: Nt,
    HttpsError: Xe,
    REGION: vi,
    BUCKETS: Rs,
    STAFF_ROLES: Si,
    round2: Je,
    bad: it,
    authUid: fn,
    requireVerified: _i,
    requireRole: Ci,
    amountOf: Ii,
    str: $i,
    assertActive: Ni,
    planDebit: Ei,
    applyDelta: Ri,
    ledger: Di,
    notify: Mi,
    bumpStats: Pi,
    audit: Oi,
    siteSettings: Ui
  };
});

// src/auth.js
var Os = D((Kt) => {
  "use strict";
  var Bi = vs(), { onCall: Ps } = X(), oe = H(), { db: ke, admin: hn, FieldValue: ct, HttpsError: gn, REGION: wn } = oe, Ms = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", Li = () => Array.from({ length: 8 }, () => Ms[ge("crypto").randomInt(0, Ms.length)]).join("");
  async function Ta(e, t = "", a = "") {
    let n = ke.doc(`users/${e}`);
    if ((await n.get()).exists) return;
    let s = null;
    for (let o = 0; o < 8 && !s; o++) {
      let r = Li();
      try {
        await ke.doc(`referralCodes/${r}`).create({ uid: e }), s = r;
      } catch (i) {
        if (i.code !== 6 && !/ALREADY_EXISTS/.test(String(i))) throw i;
      }
    }
    if (!s) throw new gn("internal", "Could not allocate referral code.");
    await ke.runTransaction(async (o) => {
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
        createdAt: ct.serverTimestamp(),
        lastLoginAt: null,
        lastSeenAt: null
      }), oe.bumpStats(o, { totalUsers: 1 }));
    });
  }
  Kt.onAuthCreate = Bi.region(wn).auth.user().onCreate((e) => Ta(e.uid, e.email || "", e.displayName || ""));
  Kt.completeRegistration = Ps({ region: wn }, async (e) => {
    let t = oe.authUid(e), a = e.data || {}, n = oe.str(a.name, { min: 2, max: 60, label: "Name" }), s = oe.str(a.username, { min: 3, max: 20, label: "Username", pattern: /^[A-Za-z0-9_]+$/ }).toLowerCase(), o = oe.str(a.phone, { min: 8, max: 16, label: "Phone", pattern: /^\+?[0-9]{8,15}$/ }), r = typeof a.referralCode == "string" ? a.referralCode.trim().toUpperCase() : "", i = await hn.auth().getUser(t);
    await Ta(t, i.email || "", n);
    let c = "";
    if (r) {
      let d = await ke.doc(`referralCodes/${r}`).get();
      if (!d.exists) throw oe.bad("Referral code not found.");
      if (d.data().uid === t) throw oe.bad("You cannot use your own referral code.");
      c = d.data().uid;
    }
    return await ke.runTransaction(async (d) => {
      let l = ke.doc(`users/${t}`);
      if ((await d.get(l)).data().profileComplete) return;
      let m = ke.doc(`usernames/${s}`);
      if ((await d.get(m)).exists) throw new gn("already-exists", "Username is already taken.");
      d.set(m, { uid: t }), d.update(l, { name: n, username: s, phone: o, referredBy: c, profileComplete: !0 });
    }), await hn.auth().updateUser(t, { displayName: n }), { ok: !0 };
  });
  Kt.bootstrap = Ps({ region: wn }, async (e) => {
    let t = oe.authUid(e), a = await hn.auth().getUser(t);
    await Ta(t, a.email || "", a.displayName || "");
    let n = ke.doc(`users/${t}`), s = await oe.siteSettings(), o = oe.round2(Number(s.welcomeBonus) || 0), r = oe.round2(Number(s.referral?.signupReward) || 0);
    if ((await ke.runTransaction(async (d) => {
      let u = (await d.get(n)).data();
      if (u.status !== "active") return { banned: !0 };
      let m = a.emailVerified && u.profileComplete && !u.signupRewardsGiven, p = null;
      m && u.referredBy && r > 0 && (p = await d.get(ke.doc(`users/${u.referredBy}`)));
      let f = { lastLoginAt: ct.serverTimestamp(), lastSeenAt: ct.serverTimestamp() };
      if (m && (f.signupRewardsGiven = !0, o > 0 && (f["balances.main"] = ct.increment(o), oe.ledger(d, { uid: t, type: "bonus", direction: "in", amount: o, bucket: "main", note: "Welcome bonus" }), oe.notify(d, t, "Welcome!", `${o} welcome bonus has been added to your wallet.`, "bonus")), p && p.exists && p.data().status === "active")) {
        let w = u.referredBy;
        d.update(ke.doc(`users/${w}`), { "balances.referral": ct.increment(r) }), oe.ledger(d, { uid: w, type: "referral", direction: "in", amount: r, bucket: "referral", note: `Referral: ${u.username}` }), oe.notify(d, w, "New referral", `${u.username} joined with your code. +${r}`, "referral"), d.set(ke.doc(`referrals/${t}`), {
          referrerUid: w,
          referredUid: t,
          referredName: u.username,
          rewardAmount: r,
          commissionTotal: 0,
          createdAt: ct.serverTimestamp()
        }), oe.bumpStats(d, { totalReferrals: 1 });
      }
      return d.update(n, f), { banned: !1 };
    })).banned) throw new gn("permission-denied", "This account is banned.");
    let c = (e.rawRequest?.headers?.["x-forwarded-for"] || e.rawRequest?.ip || "").toString().split(",")[0].trim();
    return await ke.collection("loginHistory").add({
      uid: t,
      at: ct.serverTimestamp(),
      ip: c,
      ua: (e.rawRequest?.headers?.["user-agent"] || "").toString().slice(0, 300)
    }), { ok: !0, emailVerified: a.emailVerified };
  });
  Kt.ensureUserDoc = Ta;
});

// src/payrot.js
var An = D((Qd, xs) => {
  "use strict";
  var dt = H(), { db: zt } = dt, Bs = 864e5, qi = 25e3, Ls = 30, O = (e) => Number.isFinite(Number(e)) ? Number(e) : 0, yn = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 10), ut = (e) => O(e.cycleLimit) > 0, ka = (e) => O(e.cycleReceived), bn = (e) => O(e.cycleReserved), qs = (e) => ut(e) ? Math.max(0, dt.round2(O(e.cycleLimit) - ka(e) - bn(e))) : 1 / 0, Us = (e, t) => O(e.priority) - O(t.priority) || O(e.lastActivatedAt) - O(t.lastActivatedAt) || O(e.createdAt) - O(t.createdAt) || String(e.id).localeCompare(String(t.id));
  function xi(e, t = {}) {
    return {
      accountId: e.id,
      methodId: e.methodId,
      cycleNo: O(e.cycleNo) || 1,
      receivedAmount: ka(e),
      limit: O(e.cycleLimit),
      activatedAt: O(e.lastActivatedAt),
      limitReachedAt: O(e.limitReachedAt),
      cooldownStartedAt: O(e.cooldownStartedAt),
      cooldownEndsAt: O(e.cooldownUntil),
      ...t
    };
  }
  async function Gi(e, t, a = {}) {
    let n = a.now || Date.now(), s = Math.max(1, O(a.min) || 1), o = await e.get(zt.doc(`paymentMethods/${t}`)), r = await e.get(zt.collection("paymentAccounts").where("methodId", "==", t)), i = o.exists ? o.data() : null, c = !i || i.autoRotation !== !1, l = (r.docs.length ? await e.getAll(...r.docs.map((h) => h.ref)) : []).filter((h) => h.exists).map((h) => ({ id: h.id, ref: h.ref, ...h.data() })), u = /* @__PURE__ */ new Map(), m = [], p = (h) => l.find((T) => T.id === h), f = (h, T) => {
      Object.assign(h, T), u.set(h.id, { ...u.get(h.id) || {}, ...T });
    }, w = (h, T) => {
      e.set(zt.doc(`paymentCycles/${h.id}_${O(h.cycleNo) || 1}`), xi(h, { endReason: T, closedAt: n }), { merge: !0 });
    }, y = a.settle;
    if (y) {
      let h = p(y.accountId);
      if (h) {
        let T = {};
        ut(h) && (T.cycleReserved = Math.max(0, dt.round2(bn(h) - y.amount)), y.outcome === "approve" && (T.cycleReceived = dt.round2(ka(h) + y.amount))), y.outcome === "release" && (h.usedTodayKey === yn(n) && (T.usedToday = Math.max(0, dt.round2(O(h.usedToday) - y.amount))), h.usedMonthKey === yn(n).slice(0, 7) && (T.usedMonth = Math.max(0, dt.round2(O(h.usedMonth) - y.amount))), T.totalCollected = Math.max(0, dt.round2(O(h.totalCollected) - y.amount)), T.totalDeposits = Math.max(0, O(h.totalDeposits) - 1)), f(h, T);
      }
    }
    let g = a.force || {};
    if (g.reset) {
      let h = p(g.reset);
      h && (w(h, "manual_reset"), f(h, { cycleReceived: 0, cycleNo: (O(h.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0, ...h.status === "cooldown" ? { status: "standby" } : {} }));
    }
    if (g.pause) {
      let h = p(g.pause);
      h && f(h, { status: "paused" });
    }
    if (g.resume) {
      let h = p(g.resume);
      h && h.status === "paused" && f(h, { status: "standby" });
    }
    if (g.activate) {
      let h = p(g.activate);
      if (h) {
        for (let T of l) T.id !== h.id && T.status === "active" && ut(T) && c && f(T, { status: "standby" });
        f(h, { status: "active", lastActivatedAt: n, cooldownStartedAt: 0, cooldownUntil: 0, limitReachedAt: 0 }), m.push({ old: "", next: h.id, reason: "manual" });
      }
    }
    for (let h of l)
      ut(h) && h.status === "cooldown" && O(h.cooldownUntil) && O(h.cooldownUntil) <= n && (e.set(zt.doc(`paymentCycles/${h.id}_${O(h.cycleNo) || 1}`), { completedAt: n, endReason: "cooldown_ended" }, { merge: !0 }), f(h, { status: "standby", cycleReceived: 0, cycleNo: (O(h.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0 }));
    let _ = "", k = "";
    if (c) {
      for (let A of l)
        if (ut(A) && A.status === "active" && (_ = _ || A.id, O(A.cycleLimit) - ka(A) < s && bn(A) <= 0)) {
          let E = O(A.cooldownDays) > 0 ? O(A.cooldownDays) : Ls;
          f(A, { status: "cooldown", limitReachedAt: n, cooldownStartedAt: n, cooldownUntil: n + E * Bs }), w(A, "limit_reached"), k = k || A.id;
        }
      let h = l.filter(ut), T = h.filter((A) => A.status === "active").sort((A, E) => O(E.lastActivatedAt) - O(A.lastActivatedAt) || Us(A, E));
      for (let A of T.slice(1)) f(A, { status: "standby" });
      if (!T.length) {
        let A = h.filter((E) => E.status === "standby" && qs(E) >= s).sort(Us)[0];
        A ? (f(A, { status: "active", lastActivatedAt: n }), m.push({ old: k || _, next: A.id, reason: k ? "limit_reached" : a.reason || "no_active" })) : k && m.push({ old: k, next: "", reason: "limit_reached_no_standby" });
      }
    }
    for (let [h, T] of u) e.update(p(h).ref, { ...T, updatedAt: n });
    for (let h of m)
      !h.next && !h.old || e.set(zt.collection("paymentRotationLogs").doc(), { methodId: t, oldAccountId: h.old || "", newAccountId: h.next || "", reason: h.reason, at: n });
    return { changed: [...u.keys()], activated: (m.find((h) => h.next) || {}).next || null, accounts: l };
  }
  xs.exports = { rotateTx: Gi, cycleOn: ut, room: qs, n0: O, dayKey: yn, DAY: Bs, DEFAULT_LIMIT: qi, DEFAULT_COOLDOWN_DAYS: Ls };
});

// src/storage.js
var Yt = D((_a, Vs) => {
  "use strict";
  var { onCall: vn } = X(), ve = H(), { HttpsError: lt, REGION: Sn } = ve, ji = () => globalThis.__ENV || process.env, Gs = () => {
    let e = ji(), a = { endpoint: String(e.S3_ENDPOINT || "").replace(/\/+$/, ""), bucket: String(e.S3_BUCKET || ""), key: String(e.S3_ACCESS_KEY_ID || ""), secret: String(e.S3_SECRET_ACCESS_KEY || ""), region: String(e.S3_REGION || "auto") };
    return a.ok = !!(a.endpoint && /^https:\/\//.test(a.endpoint) && a.bucket && a.key && a.secret), a;
  }, _n = () => Gs().ok, Tn = new TextEncoder(), js = (e) => [...new Uint8Array(e)].map((t) => t.toString(16).padStart(2, "0")).join(""), kn = () => globalThis.crypto && globalThis.crypto.subtle || ge("node:crypto").webcrypto.subtle, Fi = async (e) => js(await kn().digest("SHA-256", Tn.encode(e))), Wt = async (e, t) => {
    let a = await kn().importKey("raw", typeof e == "string" ? Tn.encode(e) : e, { name: "HMAC", hash: "SHA-256" }, !1, ["sign"]);
    return kn().sign("HMAC", a, Tn.encode(t));
  }, va = (e) => encodeURIComponent(e).replace(/[!'()*]/g, (t) => "%" + t.charCodeAt(0).toString(16).toUpperCase());
  async function Vt(e, t, { expires: a = 300, contentType: n = "", now: s = Date.now() } = {}) {
    let o = Gs();
    if (!o.ok) throw new lt("failed-precondition", "File storage is not set up yet.");
    let r = new URL(o.endpoint), i = r.host, d = `${r.pathname.replace(/\/+$/, "")}/${va(o.bucket)}/${t.split("/").map(va).join("/")}`, l = new Date(s).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), u = l.slice(0, 8), m = `${u}/${o.region}/s3/aws4_request`, p = n ? "content-type;host" : "host", f = { "X-Amz-Algorithm": "AWS4-HMAC-SHA256", "X-Amz-Credential": `${o.key}/${m}`, "X-Amz-Date": l, "X-Amz-Expires": String(a), "X-Amz-SignedHeaders": p }, w = Object.keys(f).sort().map((T) => `${va(T)}=${va(f[T])}`).join("&"), y = (n ? `content-type:${n}
` : "") + `host:${i}
`, g = [e, d, w, y, p, "UNSIGNED-PAYLOAD"].join(`
`), _ = ["AWS4-HMAC-SHA256", l, m, await Fi(g)].join(`
`), k = await Wt("AWS4" + o.secret, u);
    k = await Wt(k, o.region), k = await Wt(k, "s3"), k = await Wt(k, "aws4_request");
    let h = js(await Wt(k, _));
    return `${r.protocol}//${i}${d}?${w}&X-Amz-Signature=${h}`;
  }
  var Fs = (...e) => (ve.storageFetch || globalThis.fetch)(...e);
  async function Hs(e) {
    let t = await Fs(await Vt("HEAD", e, { expires: 60 }), { method: "HEAD" });
    if (t.status === 404) return { exists: !1 };
    if (!t.ok) throw new lt("unavailable", "File storage did not answer. Please try again.");
    let a = (n) => (t.headers && t.headers.get ? t.headers.get(n) : "") || "";
    return { exists: !0, contentType: a("content-type"), size: Number(a("content-length")) || 0 };
  }
  async function Ks(e) {
    try {
      await Fs(await Vt("DELETE", e, { expires: 60 }), { method: "DELETE" });
    } catch {
    }
  }
  var Cn = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }, Sa = 3 * 1024 * 1024, zs = (e) => typeof e == "string" && e.length <= 220 && /^[A-Za-z0-9_\-/.]+$/.test(e) && !e.includes("..") && !e.startsWith("/");
  async function Hi(e) {
    let t = await Hs(e);
    if (!t.exists) throw new lt("failed-precondition", "The screenshot upload was not found. Please upload again.");
    if (!Cn[String(t.contentType).split(";")[0]] || t.size > Sa)
      throw await Ks(e), ve.bad("Screenshot must be a JPG/PNG/WEBP image under 3 MB.");
    return t;
  }
  var Ws = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  };
  async function Ki(e, t) {
    let a = ve.authUid(e), n = Ws(e), s = t.split("/");
    if (s[0] === "deposits") return s[1] === a || ["super", "finance", "support"].includes(n);
    if (s[0] === "payouts") {
      if (["super", "finance"].includes(n)) return !0;
      if (n === "payout") {
        let o = await ve.db.doc(`withdrawals/${s[1]}`).get();
        return o.exists && o.data().assignedTo === a;
      }
      return !1;
    }
    return s[0] === "staff" ? !!n && n !== "payout" : !1;
  }
  _a.storageStatus = vn({ region: Sn }, async (e) => (ve.authUid(e), { configured: _n(), maxBytes: Sa, types: Object.keys(Cn) }));
  _a.storageUploadUrl = vn({ region: Sn }, async (e) => {
    let t = ve.authUid(e), a = e.data || {}, n = Ws(e);
    if (!_n()) throw new lt("failed-precondition", "File storage is not set up yet.");
    let s = String(a.contentType || ""), o = Cn[s];
    if (!o) throw ve.bad("Only JPG, PNG or WEBP images.");
    let r = Number(a.size) || 0;
    if (r <= 0 || r > Sa) throw ve.bad("Image must be under 3 MB.");
    let i = Math.random().toString(36).slice(2, 10), c = Date.now(), d;
    if (a.kind === "deposit") d = `deposits/${t}/${c}-${i}.${o}`;
    else if (a.kind === "payout") {
      let l = ve.str(a.withdrawalId, { max: 80, label: "Withdrawal" }), u = await ve.db.doc(`withdrawals/${l}`).get();
      if (!u.exists || u.data().assignedTo !== t || u.data().status !== "pending") throw new lt("permission-denied", "This task is not assigned to you.");
      d = `payouts/${l}/${t}-${c}-${i}.${o}`;
    } else if (a.kind === "staff") {
      if (!n || n === "payout") throw new lt("permission-denied", "Staff only.");
      d = `staff/${t}/${c}-${i}.${o}`;
    } else throw ve.bad("Unknown upload type.");
    return { url: await Vt("PUT", d, { expires: 300, contentType: s }), key: d, contentType: s, expiresIn: 300 };
  });
  _a.storageViewUrl = vn({ region: Sn }, async (e) => {
    let t = e.data && e.data.key;
    if (!zs(t)) throw ve.bad("Invalid file.");
    if (!await Ki(e, t)) throw new lt("permission-denied", "You cannot view this file.");
    return { url: await Vt("GET", t, { expires: 300 }), expiresIn: 300 };
  });
  Vs.exports.helpers = { presign: Vt, headObject: Hs, deleteObject: Ks, verifyImage: Hi, configured: _n, safeKey: zs, MAX_BYTES: Sa };
});

// src/wdcore.js
var In = D((eu, Ys) => {
  "use strict";
  var Ze = H(), { db: zi, FieldValue: Wi } = Ze, Qe = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  function Vi(e = Date.now()) {
    let t = new Date(e + 216e5);
    return t.setUTCHours(0, 0, 0, 0), new Date(t.getTime() - 6 * 36e5);
  }
  function Yi(e) {
    let t = e && e.withdraw || {};
    return {
      enabled: t.enabled !== !1,
      min: Qe(t.min),
      max: Qe(t.max),
      feePct: Qe(t.feePct),
      feeFlat: Qe(t.feeFlat),
      allowedBuckets: Array.isArray(t.allowedBuckets) && t.allowedBuckets.length ? t.allowedBuckets : ["winning", "referral", "commission"],
      dailyLimit: Qe(t.dailyLimit),
      dailyCount: Qe(t.dailyCount),
      maxPending: Qe(t.maxPending) || 3,
      processingText: typeof t.processingText == "string" ? t.processingText : "",
      notice: typeof t.notice == "string" ? t.notice : ""
    };
  }
  function Ji(e, t, a, n, s, o, r = {}) {
    e.update(t, { status: n ? "approved" : "rejected", stage: n ? "done" : "rejected", note: o, reviewedAt: Wi.serverTimestamp(), reviewedBy: s, ...r }), n ? (Ze.notify(e, a.uid, "Withdrawal approved", `${a.net} has been sent to ${a.accountNumber}.`, "withdraw"), Ze.ledger(e, { uid: a.uid, type: "withdraw", direction: "out", amount: 0, bucket: a.bucket, note: `Paid ${a.net} (fee ${a.fee})`, ref: t.id }), Ze.bumpStats(e, { totalWithdrawals: a.amount, feesCollected: a.fee, withdrawCount: 1, pendingWithdrawals: -1 })) : (Ze.applyDelta(e, zi.doc(`users/${a.uid}`), a.plan && Object.keys(a.plan).length ? a.plan : { [a.bucket]: a.amount }), Ze.ledger(e, { uid: a.uid, type: "withdraw_refund", direction: "in", amount: a.amount, bucket: a.bucket, note: "Withdrawal rejected", ref: t.id }), Ze.notify(e, a.uid, "Withdrawal rejected", o || "Your withdrawal was rejected and the amount was returned.", "withdraw"), Ze.bumpStats(e, { pendingWithdrawals: -1 }));
  }
  Ys.exports = { n0: Qe, startOfDhakaDay: Vi, withdrawSettings: Yi, finalize: Ji };
});

// src/wallet.js
var Zs = D((et) => {
  "use strict";
  var { onCall: mt } = X(), b = H(), { db: P, admin: Xi, FieldValue: Ke, HttpsError: G, REGION: pt } = b, Ca = An(), Xs = (e, t) => e && e.enabled === !0 && [t, "both"].includes(e.type || "both"), $n = () => new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10), Js = () => $n().slice(0, 7), ue = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  et.submitDeposit = mt({ region: pt }, async (e) => {
    let t = b.requireVerified(e), a = e.data || {}, n = b.str(a.methodId, { max: 80, label: "Method" }), s = a.accountId ? b.str(a.accountId, { max: 120, label: "Account" }) : "", o = b.amountOf(a.amount), r = b.str(a.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), i = typeof a.senderNumber == "string" ? a.senderNumber.trim().slice(0, 30) : "", c = typeof a.screenshotPath == "string" ? a.screenshotPath.trim().slice(0, 200) : "";
    if (c) {
      if (!c.startsWith(`deposits/${t}/`) || c.includes("..")) throw b.bad("Invalid screenshot path.");
      let A = Yt().helpers;
      if (A.configured() && a.store === "s3") await A.verifyImage(c);
      else {
        let E = Xi.storage().bucket().file(c), [R] = await E.exists();
        if (!R) throw new G("failed-precondition", "Screenshot upload was not found. Please upload again.");
        let [I] = await E.getMetadata();
        if (!String(I.contentType || "").startsWith("image/")) throw b.bad("Screenshot must be an image.");
      }
    }
    let d = c && a.store === "s3" ? "s3" : "", u = (await b.siteSettings()).deposit || {}, m = ue(u.min) || 1, p = ue(u.max) || 1e7;
    if (o < m || o > p) throw b.bad(`Amount must be between ${m} and ${p}.`);
    if ((await P.collection("deposits").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= 5) throw new G("resource-exhausted", "Too many pending deposits. Please wait for review.");
    let w = new Date(Date.now() + 6 * 36e5);
    w.setUTCHours(0, 0, 0, 0);
    let y = new Date(w.getTime() - 6 * 36e5), _ = (await P.collection("deposits").where("uid", "==", t).where("createdAt", ">=", y).get()).docs.filter((A) => A.data().status !== "rejected").reduce((A, E) => A + ue(E.data().amount), 0), h = (await P.doc(`users/${t}`).get()).data()?.dupTrx || {};
    if (h.blockedUntil && h.blockedUntil > Date.now()) throw new G("permission-denied", `Deposits are blocked until ${new Date(h.blockedUntil).toISOString().slice(0, 16).replace("T", " ")} UTC because of repeated duplicate transaction IDs.`);
    if ((await P.doc(`trxIndex/${n}_${r}`).get()).exists) {
      let A = h.lastAt && h.lastAt > Date.now() - 864e5 ? (h.count || 0) + 1 : 1, E = { "dupTrx.count": A, "dupTrx.lastAt": Date.now() };
      throw A >= 2 && (E["dupTrx.blockedUntil"] = Date.now() + 864e5), await P.doc(`users/${t}`).update(E), await P.doc("stats/global").set({ duplicateAttempts: Ke.increment(1) }, { merge: !0 }), b.audit(null, t, "duplicate_trx_attempt", { methodId: n, trxId: r, count: A }), new G("already-exists", A >= 2 ? "This transaction ID was already used. Deposits are blocked for 24 hours." : "This transaction ID was already used. Another attempt will block deposits for 24 hours.");
    }
    let T = P.collection("deposits").doc();
    return await P.runTransaction(async (A) => {
      let E = [A.get(P.doc(`paymentMethods/${n}`)), A.get(P.doc(`users/${t}`)), A.get(P.doc(`trxIndex/${n}_${r}`))];
      s && E.push(A.get(P.doc(`paymentAccounts/${s}`)));
      let [R, I, z, ae] = await Promise.all(E);
      b.assertActive(I.data());
      let F = R.data();
      if (!R.exists || !Xs(F, "deposit")) throw b.bad("This payment method is not available.");
      if (F.minAmount && o < F.minAmount) throw b.bad(`Minimum for ${F.name} is ${F.minAmount}.`);
      if (F.maxAmount && o > F.maxAmount) throw b.bad(`Maximum for ${F.name} is ${F.maxAmount}.`);
      let ne = I.data().rg || {}, He = ne.pendingLimitAt && ne.pendingLimitAt <= Date.now() ? ue(ne.pendingLimit) : ue(ne.dailyDepositLimit);
      if (He > 0 && _ + o > He) throw new G("failed-precondition", `Your daily deposit limit is ${He}. Remaining today: ${Math.max(0, b.round2(He - _))}.`);
      if (z.exists) throw new G("already-exists", "This transaction ID has already been submitted.");
      let ha = F.accountNumber || "", ga = "", on = "", ls = "";
      if (s) {
        let se = ae && ae.exists ? ae.data() : null;
        if (!se || se.status !== "active" || se.methodId !== n) throw new G("failed-precondition", "This payment account is no longer available. Please choose again.");
        let ms = se.usedTodayKey === $n() ? ue(se.usedToday) : 0, ps = se.usedMonthKey === Js() ? ue(se.usedMonth) : 0;
        if (ms + o > ue(se.dailyLimit) || ps + o > ue(se.monthlyLimit)) throw new G("failed-precondition", "This account reached its limit. Please choose again.");
        let ni = Ca.cycleOn(se) ? { cycleReserved: b.round2(ue(se.cycleReserved) + o) } : {};
        if (Ca.cycleOn(se) && o > Ca.room(se)) throw new G("failed-precondition", "This payment number has reached its limit. Please try again shortly.");
        A.update(ae.ref, {
          usedToday: b.round2(ms + o),
          usedTodayKey: $n(),
          usedMonth: b.round2(ps + o),
          usedMonthKey: Js(),
          totalDeposits: Ke.increment(1),
          totalCollected: Ke.increment(o),
          lastUsedAt: Date.now(),
          ...ni
        }), ha = se.accountNumber || "", ga = se.holderName || "", on = se.bankName || "", ls = se.branch || "";
      }
      A.set(P.doc(`trxIndex/${n}_${r}`), { uid: t, depositId: T.id }), A.set(T, {
        uid: t,
        username: I.data().username,
        methodId: n,
        methodName: F.name,
        accountId: s,
        accountNumber: ha,
        holderName: ga,
        ...on ? { bankName: on, branch: ls } : {},
        amount: o,
        trxId: r,
        senderNumber: i,
        screenshotPath: c,
        screenshotStore: d,
        status: "pending",
        note: "",
        createdAt: Ke.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), b.notify(A, t, "Deposit submitted", `${o} is waiting for approval.`, "deposit"), b.bumpStats(A, { pendingDeposits: 1 });
    }), { ok: !0, depositId: T.id };
  });
  et.reviewDeposit = mt({ region: pt }, async (e) => {
    let t = b.requireRole(e, ["super", "finance"]), a = e.data || {}, n = b.str(a.depositId, { max: 80 }), s = a.action === "approve";
    if (!s && a.action !== "reject") throw b.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "", r = await b.siteSettings(), i = Number(r.referral?.depositCommissionPct) || 0;
    return await P.runTransaction(async (c) => {
      let d = P.doc(`deposits/${n}`), l = await c.get(d);
      if (!l.exists) throw new G("not-found", "Deposit not found.");
      let u = l.data();
      if (u.status !== "pending") throw new G("failed-precondition", `Already ${u.status}.`);
      let m = P.doc(`users/${u.uid}`), p = await c.get(m), f = null, w = null;
      s && i > 0 && p.data().referredBy && (f = await c.get(P.doc(`users/${p.data().referredBy}`)), w = await c.get(P.doc(`referrals/${u.uid}`))), u.accountId && await Ca.rotateTx(c, u.methodId, { now: Date.now(), min: Math.max(1, ue((r.deposit || {}).min) || 1), settle: { accountId: u.accountId, amount: u.amount, outcome: s ? "approve" : "release" } });
      let y = { status: s ? "approved" : "rejected", note: o, reviewedAt: Ke.serverTimestamp(), reviewedBy: t };
      if (c.update(d, y), s) {
        if (b.applyDelta(c, m, { main: u.amount }), b.ledger(c, { uid: u.uid, type: "deposit", direction: "in", amount: u.amount, bucket: "main", note: u.methodName, ref: n }), b.notify(c, u.uid, "Deposit approved", `${u.amount} has been added to your wallet.`, "deposit"), b.bumpStats(c, { totalDeposits: u.amount, depositCount: 1, pendingDeposits: -1 }), f && f.exists && f.data().status === "active") {
          let g = b.round2(u.amount * i / 100);
          g > 0 && (b.applyDelta(c, f.ref, { commission: g }), b.ledger(c, { uid: f.id, type: "commission", direction: "in", amount: g, bucket: "commission", note: `Deposit by ${p.data().username}`, ref: n }), b.notify(c, f.id, "Referral commission", `+${g} from ${p.data().username}'s deposit.`, "referral"), w && w.exists && c.update(w.ref, { commissionTotal: Ke.increment(g) }), b.bumpStats(c, { commissionPaid: g }));
        }
      } else
        c.delete(P.doc(`trxIndex/${u.methodId}_${u.trxId}`)), b.notify(c, u.uid, "Deposit rejected", o || "Your deposit request was rejected.", "deposit"), b.bumpStats(c, { pendingDeposits: -1 });
      b.audit(c, t, s ? "deposit_approved" : "deposit_rejected", { depositId: n, amount: u.amount, uid: u.uid });
    }), { ok: !0 };
  });
  et.markDepositProcessing = mt({ region: pt }, async (e) => {
    let t = b.requireRole(e, ["super", "finance"]), a = b.str((e.data || {}).depositId, { max: 80 });
    return await P.runTransaction(async (n) => {
      let s = P.doc(`deposits/${a}`), o = await n.get(s), r = o.exists ? o.data() : null;
      if (!r || r.status !== "pending") throw new G("failed-precondition", "Only a pending deposit can be marked processing.");
      r.stage !== "processing" && (n.update(s, { stage: "processing", processingAt: Date.now(), processingBy: t }), b.notify(n, r.uid, "Deposit processing", `Your deposit of ${r.amount} is being checked.`, "deposit"), b.audit(n, t, "deposit_processing", { depositId: a }));
    }), { ok: !0 };
  });
  et.refundDeposit = mt({ region: pt }, async (e) => {
    let t = b.requireRole(e, ["super", "finance"]), a = e.data || {}, n = b.str(a.depositId, { max: 80 }), s = b.str(a.note, { min: 3, max: 300, label: "Reason" });
    return await P.runTransaction(async (o) => {
      let r = P.doc(`deposits/${n}`), i = await o.get(r), c = i.exists ? i.data() : null;
      if (!c || c.status !== "approved") throw new G("failed-precondition", "Only an approved deposit can be refunded.");
      let d = P.doc(`users/${c.uid}`), l = await o.get(d), u = ue(l.data()?.balances?.main);
      if (u + 1e-9 < ue(c.amount)) throw new G("failed-precondition", `The player's main wallet has only ${b.round2(u)} \u2014 they already used part of this deposit.`);
      o.update(r, { status: "refunded", refundNote: s, refundedAt: Ke.serverTimestamp(), refundedBy: t }), b.applyDelta(o, d, { main: -ue(c.amount) }), b.ledger(o, { uid: c.uid, type: "deposit_refund", direction: "out", amount: c.amount, bucket: "main", note: s, ref: n }), b.notify(o, c.uid, "Deposit refunded", `${c.amount} was returned to you. ${s}`, "deposit"), b.bumpStats(o, { totalDeposits: -ue(c.amount), depositCount: -1, depositsRefunded: ue(c.amount) }), b.audit(o, t, "deposit_refunded", { depositId: n, amount: c.amount, uid: c.uid, note: s });
    }), { ok: !0 };
  });
  var Ia = In();
  et.requestWithdraw = mt({ region: pt }, async (e) => {
    let t = b.requireVerified(e), a = e.data || {}, n = b.str(a.methodId, { max: 80, label: "Method" }), s = a.bucket ? b.str(a.bucket, { max: 20, label: "Wallet" }) : "auto", o = b.amountOf(a.amount), r = b.str(a.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }), i = typeof a.holderName == "string" ? a.holderName.trim().slice(0, 60) : "", c = typeof a.bankName == "string" ? a.bankName.trim().slice(0, 60) : "", d = typeof a.branch == "string" ? a.branch.trim().slice(0, 60) : "", l = await b.siteSettings(), u = Ia.withdrawSettings(l);
    if (!u.enabled) throw new G("failed-precondition", u.notice || "Withdrawals are paused right now. Please try again later.");
    let m = u.allowedBuckets;
    if (s !== "auto" && !m.includes(s)) throw b.bad("This wallet cannot be withdrawn from.");
    let p = b.round2(o * u.feePct / 100 + u.feeFlat);
    if (p >= o) throw b.bad("Amount is too small after fees.");
    if ((await P.collection("withdrawals").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= u.maxPending) throw new G("resource-exhausted", `You already have ${u.maxPending} pending withdrawal(s). Please wait until they are processed.`);
    if (u.dailyLimit > 0 || u.dailyCount > 0) {
      let g = (await P.collection("withdrawals").where("uid", "==", t).where("createdAt", ">=", Ia.startOfDhakaDay()).get()).docs.filter((k) => k.data().status !== "rejected"), _ = g.reduce((k, h) => k + Ia.n0(h.data().amount), 0);
      if (u.dailyCount > 0 && g.length >= u.dailyCount) throw new G("failed-precondition", `Daily limit reached: ${u.dailyCount} withdrawal(s) per day. Try again tomorrow.`);
      if (u.dailyLimit > 0 && _ + o > u.dailyLimit) throw new G("failed-precondition", `Daily withdraw limit is ${u.dailyLimit}. You can withdraw ${Math.max(0, b.round2(u.dailyLimit - _))} more today.`);
    }
    let w = P.collection("withdrawals").doc();
    return await P.runTransaction(async (y) => {
      let g = P.doc(`users/${t}/private/wdCards`), [_, k, h] = await Promise.all([y.get(P.doc(`paymentMethods/${n}`)), y.get(P.doc(`users/${t}`)), y.get(g)]);
      b.assertActive(k.data());
      let T = _.data();
      if (!_.exists || !Xs(T, "withdraw")) throw b.bad("This withdraw method is not available.");
      let A = h.exists && Array.isArray(h.data().list) ? h.data().list : [], E = A.find((ne) => ne.methodId === n);
      if (E && T.cardLock === !0 && String(E.accountNumber).replace(/\s+/g, "") !== String(r).replace(/\s+/g, ""))
        throw new G("failed-precondition", '\u098F\u0987 \u09AE\u09C7\u09A5\u09A1\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C7\u09AD \u0995\u09B0\u09BE \u0995\u09BE\u09B0\u09CD\u09A1 \u0986\u099B\u09C7\u0964 \u0985\u09A8\u09CD\u09AF \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7 \u09A4\u09C1\u09B2\u09A4\u09C7 \u0995\u09BE\u09B0\u09CD\u09A1 \u09A5\u09C7\u0995\u09C7 "\u09A8\u09AE\u09CD\u09AC\u09B0 \u09AC\u09A6\u09B2\u09BE\u09A8" \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964 (Use the saved card or change its number.)');
      if (!E && A.length < 6 && y.set(g, { list: [...A, { methodId: n, accountNumber: r, holderName: i, ...c ? { bankName: c, branch: d } : {}, savedAt: Date.now() }], updatedAt: Date.now() }), T.kind === "bank" && (c.length < 2 || d.length < 2 || i.length < 2)) throw b.bad("Bank name, branch and account holder name are required for a bank withdrawal.");
      let R = Math.max(u.min || 0, T.withdrawMin || 0), I = Math.min(u.max || 1 / 0, T.withdrawMax || 1 / 0);
      if (o < R || o > I) throw b.bad(`Amount must be between ${R} and ${I === 1 / 0 ? "\u221E" : I}.`);
      let z = s === "auto" ? m : [s], ae = b.planDebit(k.data().balances, o, z), F = {};
      for (let [ne, He] of Object.entries(ae)) F[ne] = -He;
      b.applyDelta(y, k.ref, F), b.ledger(y, { uid: t, type: "withdraw_hold", direction: "out", amount: o, bucket: Object.keys(ae)[0], note: T.name, ref: w.id }), b.notify(y, t, "Withdrawal requested", `${o} is waiting for approval (you receive ${b.round2(o - p)}).`, "withdraw"), y.set(w, {
        uid: t,
        username: k.data().username,
        methodId: n,
        methodName: T.name,
        bucket: Object.keys(ae)[0],
        plan: ae,
        holderName: i,
        accountNumber: r,
        ...c ? { bankName: c, branch: d } : {},
        amount: o,
        fee: p,
        net: b.round2(o - p),
        status: "pending",
        stage: "new",
        note: "",
        createdAt: Ke.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), b.bumpStats(y, { pendingWithdrawals: 1 });
    }), { ok: !0, withdrawalId: w.id, fee: p, net: b.round2(o - p) };
  });
  et.reviewWithdrawal = mt({ region: pt }, async (e) => {
    let t = b.requireRole(e, ["super", "finance"]), a = e.data || {}, n = b.str(a.withdrawalId, { max: 80 }), s = a.action === "approve";
    if (!s && a.action !== "reject") throw b.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "";
    return await P.runTransaction(async (r) => {
      let i = P.doc(`withdrawals/${n}`), c = await r.get(i);
      if (!c.exists) throw new G("not-found", "Withdrawal not found.");
      let d = c.data();
      if (d.status !== "pending") throw new G("failed-precondition", `Already ${d.status}.`);
      if (d.stage === "paid_review") throw new G("failed-precondition", "An agent already paid this. Review it in Payout Review.");
      if (d.assignedTo && s) throw new G("failed-precondition", "This request is assigned to a payout agent. Unassign it first.");
      d.assignedTo && r.update(P.doc(`payoutAgents/${d.assignedTo}`), { openCount: Ke.increment(-1) }), Ia.finalize(r, i, d, s, t, o), b.audit(r, t, s ? "withdraw_approved" : "withdraw_rejected", { withdrawalId: n, amount: d.amount, uid: d.uid });
    }), { ok: !0 };
  });
  et.saveWithdrawSettings = mt({ region: pt }, async (e) => {
    let t = b.requireRole(e, ["super", "finance"]), a = e.data || {}, n = (c, d, l, u) => {
      let m = Number(c);
      if (!Number.isFinite(m) || m < d || m > l) throw b.bad(`${u} must be between ${d} and ${l}.`);
      return b.round2(m);
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
    if (s.max > 0 && s.min > s.max) throw b.bad("Minimum cannot be bigger than maximum.");
    let o = Array.isArray(a.allowedBuckets) ? a.allowedBuckets.filter((c) => ["main", "winning", "referral", "commission"].includes(c)) : null;
    if (o) {
      if (!o.length) throw b.bad("Pick at least one wallet.");
      s.allowedBuckets = o;
    }
    let r = P.doc("settings/site"), i = (await r.get()).data() || {};
    return await r.set({ withdraw: { ...i.withdraw || {}, ...s } }, { merge: !0 }), b.audit(null, t, "withdraw_settings", s), { ok: !0, withdraw: { ...i.withdraw || {}, ...s } };
  });
});

// supa/shims/functions-firestore.js
var eo = D((au, Qs) => {
  "use strict";
  Qs.exports = { onDocumentCreated: (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "trigger", a;
  } };
});

// src/admin.js
var ao = D((Et) => {
  "use strict";
  var { onCall: $a } = X(), { onDocumentCreated: Zi } = eo(), B = H(), { db: Ne, admin: ft, FieldValue: Qi, HttpsError: to, REGION: Jt } = B;
  Et.adminAdjustBalance = $a({ region: Jt }, async (e) => {
    let t = B.requireRole(e, ["super", "finance"]), a = e.data || {}, n = B.str(a.uid, { max: 128 }), s = B.str(a.bucket, { max: 20 });
    if (!B.BUCKETS.includes(s)) throw B.bad("Invalid wallet.");
    let o = B.amountOf(Math.abs(Number(a.delta)), { min: 0.01, max: 1e7, label: "Amount" }) * (Number(a.delta) < 0 ? -1 : 1), r = B.str(a.reason, { min: 3, max: 200, label: "Reason" });
    return await Ne.runTransaction(async (i) => {
      let c = Ne.doc(`users/${n}`), d = await i.get(c);
      if (!d.exists) throw new to("not-found", "User not found.");
      if (B.round2((d.data().balances?.[s] || 0) + o) < 0) throw B.bad("Balance cannot go below zero.");
      B.applyDelta(i, c, { [s]: o }), B.ledger(i, { uid: n, type: "admin_adjust", direction: o > 0 ? "in" : "out", amount: Math.abs(o), bucket: s, note: r }), B.notify(i, n, "Balance updated", `${o > 0 ? "+" : ""}${o} (${r})`, "info"), B.audit(i, t, "balance_adjust", { uid: n, bucket: s, delta: o, reason: r });
    }), { ok: !0 };
  });
  Et.setUserStatus = $a({ region: Jt }, async (e) => {
    let t = B.requireRole(e, ["super", "support"]), a = e.data || {}, n = B.str(a.uid, { max: 128 }), s = a.banned === !0, o = typeof a.reason == "string" ? a.reason.trim().slice(0, 200) : "";
    if ((await ft.auth().getUser(n)).customClaims?.admin) throw new to("permission-denied", "Staff accounts cannot be banned here.");
    return await Ne.doc(`users/${n}`).update({ status: s ? "banned" : "active", banReason: s ? o : "" }), await ft.auth().updateUser(n, { disabled: s }), s && await ft.auth().revokeRefreshTokens(n), B.audit(null, t, s ? "user_banned" : "user_unbanned", { uid: n, reason: o }), { ok: !0 };
  });
  Et.setStaffRole = $a({ region: Jt }, async (e) => {
    let t = B.requireRole(e, ["super"]), a = e.data || {}, n = await ft.auth().getUserByEmail(B.str(a.email, { max: 200, label: "Email" })), s = a.role === null ? null : B.str(a.role, { max: 20 });
    if (s && !B.STAFF_ROLES.includes(s)) throw B.bad("Invalid role.");
    if (n.uid === t && s !== "super") throw B.bad("You cannot demote yourself.");
    await ft.auth().setCustomUserClaims(n.uid, s ? { admin: !0, role: s } : { admin: !1, role: null }), await ft.auth().revokeRefreshTokens(n.uid), await Ne.doc(`users/${n.uid}`).set({ role: s || "user" }, { merge: !0 });
    let o = Ne.doc(`payoutAgents/${n.uid}`), r = await o.get();
    if (s === "payout") {
      let i = (await Ne.doc(`users/${n.uid}`).get()).data() || {};
      await o.set(r.exists ? { active: !0, name: i.name || n.displayName || "", email: n.email } : { active: !0, name: i.name || n.displayName || "", email: n.email, methods: [], floatGiven: 0, floatReturned: 0, paidTotal: 0, paidCount: 0, reviewTotal: 0, reviewCount: 0, openCount: 0, createdAt: Date.now() }, { merge: !0 });
    } else r.exists && await o.set({ active: !1 }, { merge: !0 });
    return B.audit(null, t, "staff_role", { uid: n.uid, role: s }), { ok: !0 };
  });
  Et.adminNotify = $a({ region: Jt, timeoutSeconds: 300 }, async (e) => {
    let t = B.requireRole(e, ["super", "support"]), a = e.data || {}, n = B.str(a.title, { max: 80, label: "Title" }), s = B.str(a.body, { max: 400, label: "Message" }), o = (i) => ({ ref: Ne.collection("users").doc(i).collection("notifications").doc(), data: { title: n, body: s, type: "announcement", read: !1, createdAt: Qi.serverTimestamp() } }), r = 0;
    if (a.uid) {
      let i = o(String(a.uid));
      await i.ref.set(i.data), r = 1;
    } else {
      let i = null;
      for (; ; ) {
        let c = Ne.collection("users").where("status", "==", "active").orderBy("__name__").limit(400);
        i && (c = c.startAfter(i));
        let d = await c.get();
        if (d.empty) break;
        let l = Ne.batch();
        d.docs.forEach((u) => {
          let m = o(u.id);
          l.set(m.ref, m.data);
        }), await l.commit(), r += d.size, i = d.docs[d.docs.length - 1];
      }
    }
    return B.audit(null, t, "notify", { title: n, recipients: r }), { ok: !0, recipients: r };
  });
  Et.pushOnNotification = Zi({ document: "users/{uid}/notifications/{nid}", region: Jt }, async (e) => {
    let t = e.data?.data();
    if (!t) return;
    let n = (await Ne.collection("users").doc(e.params.uid).collection("devices").get()).docs.map((r) => r.id);
    if (!n.length) return;
    let s = await ft.messaging().sendEachForMulticast({ tokens: n, notification: { title: t.title, body: t.body } }), o = [];
    s.responses.forEach((r, i) => {
      !r.success && /registration-token-not-registered|invalid-registration-token/.test(r.error?.code || "") && o.push(n[i]);
    }), await Promise.all(o.map((r) => Ne.doc(`users/${e.params.uid}/devices/${r}`).delete()));
  });
});

// src/math.js
var ro = D((su, oo) => {
  "use strict";
  var no = ge("crypto"), Nn = {
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
  }, ec = 0.99, En = () => no.randomInt(0, 2 ** 32) / 2 ** 32;
  function Rn(e) {
    let t = [], a = 1;
    for (let n = 0; n <= e; n++)
      t.push(a / 2 ** e), a = a * (e - n) / (n + 1);
    return t;
  }
  var tc = { low: { base: 1, spread: 4, e: 2 }, medium: { base: 0.4, spread: 30, e: 3 }, high: { base: 0.15, spread: 300, e: 4.5 } };
  function so(e, t, a, n = 1e3) {
    let s = tc[t];
    if (!s) throw new Error("bad risk");
    let o = Rn(e), r = o.map((c, d) => s.base + Math.pow(Math.abs(d - e / 2) / (e / 2), s.e) * s.spread), i = r.reduce((c, d, l) => c + d * o[l], 0);
    return r.map((c) => Math.min(n, Math.round(c * a / i * 100) / 100));
  }
  function ac(e, t, a, n) {
    let s = so(e, t, a, n), o = Rn(e);
    return s.reduce((r, i, c) => r + i * o[c], 0);
  }
  function nc(e) {
    let t = [];
    for (let a = 0; a < e; a++) t.push(no.randomInt(0, 2));
    return { path: t, slot: t.reduce((a, n) => a + n, 0) };
  }
  function sc(e) {
    let t = e.reduce((a, n) => a + n.weight, 0);
    return e.reduce((a, n) => a + n.mult * n.weight, 0) / t;
  }
  function oc(e) {
    let t = e.reduce((n, s) => n + s.weight, 0), a = En() * t;
    for (let n = 0; n < e.length; n++)
      if (a -= e[n].weight, a < 0) return n;
    return e.length - 1;
  }
  function rc(e, t = 1e3) {
    let a = En();
    return Math.min(t, Math.max(1, Math.floor(100 * e / (1 - a)) / 100));
  }
  var ic = (e, t) => Math.floor(Math.exp(t * e) * 100) / 100, cc = (e, t) => Math.log(e) / t;
  function dc(e = {}) {
    let t = { ...Nn, ...e };
    for (let a of ["plinko", "wheel", "rocket"]) t[a] = { ...Nn[a], ...e[a] || {} };
    return t;
  }
  oo.exports = {
    DEFAULTS: Nn,
    MAX_RTP: ec,
    binomProbs: Rn,
    plinkoTable: so,
    plinkoRtp: ac,
    plinkoDrop: nc,
    wheelRtp: sc,
    wheelSpin: oc,
    rocketCrashPoint: rc,
    rocketMultiplierAt: ic,
    rocketCrashTimeMs: cc,
    mergeConfig: dc,
    randFloat: En
  };
});

// src/games.js
var co = D((ht) => {
  "use strict";
  var { onCall: Rt } = X(), L = H(), Ee = ro(), { db: Z, FieldValue: Dn, HttpsError: Na, REGION: Dt } = L;
  async function Ea() {
    let e = await Z.doc("settings/games").get();
    return Ee.mergeConfig(e.exists ? e.data() : {});
  }
  function Mn(e, t, a) {
    let n = e[t];
    if (!n.enabled) throw new Na("failed-precondition", "This game is currently disabled.");
    if (e.rtp > Ee.MAX_RTP) throw new Na("failed-precondition", "Game configuration is invalid.");
    if (a < n.minBet || a > n.maxBet) throw L.bad(`Bet must be between ${n.minBet} and ${n.maxBet}.`);
  }
  function Pn(e, t, a, n, s, o, r) {
    let i = L.planDebit(a.balances, s, ["main", "winning"]), c = {};
    for (let [d, l] of Object.entries(i)) c[d] = -l;
    L.applyDelta(e, t, c), L.ledger(e, { uid: n, type: "bet", direction: "out", amount: s, bucket: Object.keys(i)[0], note: o, ref: r }), L.bumpStats(e, { betVolume: s });
  }
  function On(e, t, a, n, s, o) {
    n <= 0 || (L.applyDelta(e, t, { winning: n }), L.ledger(e, { uid: a, type: "win", direction: "in", amount: n, bucket: "winning", note: s, ref: o }), L.bumpStats(e, { winPayout: n }));
  }
  ht.getGameConfig = Rt({ region: Dt }, async (e) => {
    L.authUid(e);
    let t = await Ea(), a = {};
    for (let n of t.plinko.rows) {
      a[n] = {};
      for (let s of ["low", "medium", "high"]) a[n][s] = Ee.plinkoTable(n, s, t.rtp, t.plinko.maxMultiplier);
    }
    return { rtp: t.rtp, plinko: { ...t.plinko, tables: a }, wheel: t.wheel, rocket: t.rocket };
  });
  ht.playPlinko = Rt({ region: Dt }, async (e) => {
    let t = L.requireVerified(e), a = e.data || {}, n = await Ea(), s = L.amountOf(a.bet, { label: "Bet" });
    Mn(n, "plinko", s);
    let o = Number(a.rows), r = String(a.risk);
    if (!n.plinko.rows.includes(o) || !["low", "medium", "high"].includes(r)) throw L.bad("Invalid Plinko settings.");
    let i = Ee.plinkoTable(o, r, n.rtp, n.plinko.maxMultiplier), c = Ee.plinkoDrop(o), d = i[c.slot], l = L.round2(s * d), u = Z.collection("gameHistory").doc();
    return await Z.runTransaction(async (m) => {
      let p = Z.doc(`users/${t}`), f = await m.get(p);
      L.assertActive(f.data()), Pn(m, p, f.data(), t, s, "plinko", u.id), On(m, p, t, l, "plinko", u.id), m.set(u, { uid: t, game: "plinko", bet: s, payout: l, multiplier: d, status: "settled", detail: { rows: o, risk: r, path: c.path, slot: c.slot }, at: Dn.serverTimestamp() });
    }), { path: c.path, slot: c.slot, multiplier: d, payout: l, historyId: u.id };
  });
  ht.playWheel = Rt({ region: Dt }, async (e) => {
    let t = L.requireVerified(e), a = e.data || {}, n = await Ea(), s = L.amountOf(a.bet, { label: "Bet" });
    Mn(n, "wheel", s);
    let o = n.wheel.segments;
    if (!Array.isArray(o) || o.length < 2 || Ee.wheelRtp(o) > Ee.MAX_RTP) throw new Na("failed-precondition", "Wheel configuration is invalid.");
    let r = Ee.wheelSpin(o), i = o[r].mult, c = L.round2(s * i), d = Z.collection("gameHistory").doc();
    return await Z.runTransaction(async (l) => {
      let u = Z.doc(`users/${t}`), m = await l.get(u);
      L.assertActive(m.data()), Pn(l, u, m.data(), t, s, "wheel", d.id), On(l, u, t, c, "wheel", d.id), l.set(d, { uid: t, game: "wheel", bet: s, payout: c, multiplier: i, status: "settled", detail: { segment: r, label: o[r].label }, at: Dn.serverTimestamp() });
    }), { segment: r, label: o[r].label, multiplier: i, payout: c, historyId: d.id };
  });
  ht.rocketStart = Rt({ region: Dt }, async (e) => {
    let t = L.requireVerified(e), a = e.data || {}, n = await Ea(), s = L.amountOf(a.bet, { label: "Bet" });
    Mn(n, "rocket", s);
    let o = Ee.rocketCrashPoint(n.rtp, n.rocket.maxMultiplier), r = Z.collection("rocketRounds").doc().id, i = Date.now();
    return await Z.runTransaction(async (c) => {
      let d = Z.doc(`users/${t}`), l = await c.get(d);
      L.assertActive(l.data()), Pn(c, d, l.data(), t, s, "rocket", r), c.set(Z.doc(`rocketRounds/${r}`), { uid: t, bet: s, startedAt: i, status: "running", growth: n.rocket.growth }), c.set(Z.doc(`rocketSecrets/${r}`), { crash: o }), c.set(Z.doc(`gameHistory/${r}`), { uid: t, game: "rocket", bet: s, payout: 0, multiplier: 0, status: "running", detail: {}, at: Dn.serverTimestamp() });
    }), { roundId: r, startedAt: i, growth: n.rocket.growth };
  });
  async function io(e, t, a) {
    return Z.runTransaction(async (n) => {
      let s = Z.doc(`rocketRounds/${t}`), [o, r] = await Promise.all([n.get(s), n.get(Z.doc(`rocketSecrets/${t}`))]);
      if (!o.exists || o.data().uid !== e) throw new Na("not-found", "Round not found.");
      let i = o.data(), c = r.data().crash;
      if (i.status !== "running") return { status: i.status, crash: i.status === "running" ? void 0 : c, multiplier: i.cashedAt || null, payout: i.payout || 0 };
      let d = Date.now() - i.startedAt, l = Ee.rocketCrashTimeMs(c, i.growth), u = Z.doc(`gameHistory/${t}`);
      if (d >= l)
        return n.update(s, { status: "crashed", payout: 0 }), n.update(u, { status: "settled", detail: { crash: c } }), { status: "crashed", crash: c, payout: 0 };
      let m = Ee.rocketMultiplierAt(d, i.growth);
      if (!a) return { status: "running", multiplier: m };
      let p = L.round2(i.bet * m);
      return On(n, Z.doc(`users/${e}`), e, p, "rocket", t), n.update(s, { status: "cashed", payout: p, cashedAt: m }), n.update(u, { status: "settled", payout: p, multiplier: m, detail: { crash: c } }), { status: "cashed", multiplier: m, payout: p, crash: c };
    });
  }
  ht.rocketPoll = Rt({ region: Dt }, (e) => io(L.authUid(e), L.str((e.data || {}).roundId, { max: 80 }), !1));
  ht.rocketCashout = Rt({ region: Dt }, (e) => io(L.requireVerified(e), L.str((e.data || {}).roundId, { max: 80 }), !0));
});

// src/features.js
var Mt = D((ru, lo) => {
  "use strict";
  var uc = H(), { db: lc, HttpsError: mc } = uc, Un = { lottery: !0, bonus: !0, referral: !0, refms: !0, checkin: !0, board: !0, livedraw: !0, chat: !0, whatsapp: !0, histgames: !1, sound: !0 }, Xt = { at: 0, v: null };
  async function uo() {
    if (Xt.v && Date.now() - Xt.at < 15e3) return Xt.v;
    let e = await lc.doc("settings/content").get(), t = e.exists && e.data().features || {}, a = {};
    return Object.keys(Un).forEach((n) => {
      a[n] = typeof t[n] == "boolean" ? t[n] : Un[n];
    }), Xt = { at: Date.now(), v: a }, a;
  }
  var pc = { lottery: "\u09B2\u099F\u09BE\u09B0\u09BF", bonus: "\u09AC\u09CB\u09A8\u09BE\u09B8", referral: "\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2", refms: "\u0987\u09A8\u09AD\u09BE\u0987\u099F \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0", checkin: "\u09A6\u09C8\u09A8\u09BF\u0995 \u099A\u09C7\u0995-\u0987\u09A8", chat: "\u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099A\u09CD\u09AF\u09BE\u099F" };
  async function fc(e) {
    if (!(await uo())[e]) throw new mc("failed-precondition", `${pc[e] || e} \u098F\u0996\u09A8 \u09AC\u09A8\u09CD\u09A7 \u0986\u099B\u09C7\u0964 (This feature is turned off.)`);
  }
  lo.exports = { features: uo, requireFeature: fc, DEFAULTS: Un, _reset: () => {
    Xt = { at: 0, v: null };
  } };
});

// src/lotdraw.js
var Da = D((iu, ho) => {
  "use strict";
  var mo = ge("crypto"), gt = H(), { db: ze, FieldValue: hc, HttpsError: Bn } = gt, Ra = (e) => mo.createHash("sha256").update(String(e)).digest("hex"), po = (e, t, a) => parseInt(Ra(`${e}:${t}:${a}`).slice(0, 12), 16) % a;
  async function fo(e) {
    let t = ze.doc(`lotteries/${e}/private/seed`), a = await t.get();
    if (a.exists) return a.data();
    let n = mo.randomBytes(32).toString("hex"), s = Ra(n);
    try {
      await t.create({ seed: n, hash: s, at: Date.now() });
    } catch (r) {
      let i = await t.get();
      if (i.exists) return i.data();
      throw r;
    }
    let o = await ze.doc(`lotteries/${e}`).get();
    return o.exists && !o.data().seedHash && await ze.doc(`lotteries/${e}`).update({ seedHash: s }), { seed: n, hash: s };
  }
  async function gc(e, t) {
    if (!(await ze.doc(`lotteries/${e}`).get()).exists) throw new Bn("not-found", "Lottery not found.");
    return await fo(e), ze.runTransaction(async (n) => {
      let s = ze.doc(`lotteries/${e}`), o = await n.get(s), r = o.data();
      if (!o.exists || !["open", "closed"].includes(r.status)) throw new Bn("failed-precondition", "Lottery cannot be drawn.");
      let c = (await n.get(ze.doc(`lotteries/${e}/private/seed`))).data().seed, d = await n.get(ze.collection("lotteryTickets").where("lotteryId", "==", e).where("status", "==", "active"));
      if (d.empty) throw new Bn("failed-precondition", "No tickets sold.");
      let l = d.docs.slice().sort((y, g) => (Number(y.data().number) || 0) - (Number(g.data().number) || 0)), u = l[po(c, e, l.length)], m = u.data(), p = gt.round2(r.prize), f = ze.doc(`users/${m.uid}`), w = await n.get(f);
      return gt.applyDelta(n, f, { winning: p }), gt.ledger(n, { uid: m.uid, type: "lottery_win", direction: "in", amount: p, bucket: "winning", note: r.title, ref: e }), gt.notify(n, m.uid, "You won the lottery! \u{1F389}", `${r.title}: ${p} added to your winnings.`, "lottery"), n.update(u.ref, { status: "won" }), n.update(s, {
        status: "drawn",
        winnerUid: m.uid,
        winnerName: w.data().username || "",
        winnerTicket: m.number,
        drawnAt: hc.serverTimestamp(),
        drawSeed: c,
        seedHash: Ra(c),
        drawCount: l.length,
        drawBy: t === "auto" ? "auto" : "admin"
      }), gt.bumpStats(n, { lotteryPayout: p }), gt.audit(n, t === "auto" ? "system" : t, "lottery_drawn", { lotteryId: e, winner: m.uid, prize: p, auto: t === "auto" }), { winnerTicket: m.number, winnerUid: m.uid };
    });
  }
  ho.exports = { sha: Ra, pickIndex: po, ensureSeed: fo, drawLottery: gc };
});

// src/engagement.js
var yo = D((Zt) => {
  "use strict";
  var cu = ge("crypto"), { onCall: Pa } = X(), q = H(), { db: me, FieldValue: Ma, HttpsError: xe, REGION: Oa } = q;
  Zt.buyLotteryTickets = Pa({ region: Oa }, async (e) => {
    await Mt().requireFeature("lottery");
    let t = q.requireVerified(e), a = e.data || {}, n = q.str(a.lotteryId, { max: 80 }), s = Math.floor(q.amountOf(a.qty, { min: 1, max: 50, label: "Quantity" })), o = [];
    return (await me.doc(`lotteries/${n}`).get()).exists && await Da().ensureSeed(n), await me.runTransaction(async (r) => {
      let i = me.doc(`lotteries/${n}`), c = me.doc(`users/${t}`), [d, l] = await Promise.all([r.get(i), r.get(c)]);
      q.assertActive(l.data());
      let u = d.data();
      if (!d.exists || u.status !== "open") throw new xe("failed-precondition", "This lottery is closed.");
      if (u.endsAt && u.endsAt.toMillis() <= Date.now()) throw new xe("failed-precondition", "This lottery has ended.");
      if ((u.sold || 0) + s > u.totalTickets) throw new xe("failed-precondition", "Not enough tickets left.");
      let m = l.data().rg?.excludedUntil;
      if ((m?.toMillis ? m.toMillis() : Number(m) || 0) > Date.now()) throw new xe("failed-precondition", "You are on a self-exclusion break.");
      if (Number(u.maxPerUser) > 0 && (await r.get(me.collection("lotteryTickets").where("lotteryId", "==", n).where("uid", "==", t).count())).data().count + s > Number(u.maxPerUser))
        throw new xe("failed-precondition", `Maximum ${u.maxPerUser} tickets per player.`);
      let p = q.round2(u.price * s), f = q.planDebit(l.data().balances, p, ["main", "winning"]), w = {};
      for (let [y, g] of Object.entries(f)) w[y] = -g;
      q.applyDelta(r, c, w), q.ledger(r, { uid: t, type: "lottery", direction: "out", amount: p, bucket: Object.keys(f)[0], note: u.title, ref: n });
      for (let y = 1; y <= s; y++) {
        let g = (u.sold || 0) + y;
        o.push(g), r.set(me.collection("lotteryTickets").doc(), { lotteryId: n, lotteryTitle: u.title, uid: t, number: g, price: u.price, status: "active", createdAt: Ma.serverTimestamp() });
      }
      r.update(i, { sold: Ma.increment(s) }), q.bumpStats(r, { lotterySales: p });
    }), { ok: !0, numbers: o };
  });
  Zt.adminDrawLottery = Pa({ region: Oa, timeoutSeconds: 120 }, async (e) => {
    let t = q.requireRole(e, ["super", "finance"]), a = q.str((e.data || {}).lotteryId, { max: 80 });
    return { ok: !0, winnerTicket: (await Da().drawLottery(a, t)).winnerTicket };
  });
  Zt.adminCancelLottery = Pa({ region: Oa, timeoutSeconds: 300 }, async (e) => {
    let t = q.requireRole(e, ["super", "finance"]), a = q.str((e.data || {}).lotteryId, { max: 80 });
    await me.runTransaction(async (s) => {
      let o = await s.get(me.doc(`lotteries/${a}`));
      if (!o.exists || !["open", "closed"].includes(o.data().status)) throw new xe("failed-precondition", "Lottery cannot be cancelled.");
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
  function wo(e, t) {
    let a = globalThis.crypto && globalThis.crypto.getRandomValues ? globalThis.crypto : ge("node:crypto").webcrypto, n = t - e + 1, s = new Uint32Array(1), o = Math.floor(4294967296 / n) * n, r;
    do
      a.getRandomValues(s), r = s[0];
    while (r >= o);
    return e + r % n;
  }
  function wc(e) {
    let t = e.reduce((n, s) => n + s.weight, 0), a = wo(1, t);
    for (let n = 0; n < e.length; n++)
      if (a -= e[n].weight, a <= 0) return n;
    return e.length - 1;
  }
  var yc = (e) => (Array.isArray(e) ? e : []).map((t) => ({ amount: Math.round(Number(t && t.amount)), weight: Math.round(Number(t && t.weight)) })).filter((t) => t.amount > 0 && t.amount <= 1e6 && t.weight > 0 && t.weight <= 1e5).slice(0, 12), go = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 7);
  Zt.claimBonus = Pa({ region: Oa }, async (e) => {
    await Mt().requireFeature("bonus");
    let t = q.requireVerified(e), a = q.str((e.data || {}).bonusId, { max: 80 }), n = { once: 1 / 0, daily: 24 * 36e5, weekly: 168 * 36e5, monthly: 0 }, s = 0, o = -1;
    return await me.runTransaction(async (r) => {
      let [i, c, d] = await Promise.all([r.get(me.doc(`bonuses/${a}`)), r.get(me.doc(`users/${t}`)), r.get(me.doc(`bonusClaims/${t}_${a}`))]);
      q.assertActive(c.data());
      let l = i.data();
      if (!i.exists || !l.enabled) throw new xe("failed-precondition", "This bonus is not available.");
      let u = l.type in n ? l.type : "once";
      if (d.exists) {
        if (u === "once") throw new xe("already-exists", "You already claimed this bonus.");
        let p = d.data().lastClaimAt && d.data().lastClaimAt.toMillis ? d.data().lastClaimAt.toMillis() : Number(d.data().lastClaimMs) || 0;
        if (u === "monthly") {
          if (go(p) === go(Date.now())) throw new xe("failed-precondition", "Already claimed this month. Available again next month.");
        } else {
          let f = p + n[u] - Date.now();
          if (f > 0) throw new xe("failed-precondition", `Available again in ${Math.ceil(f / 6e4)} min.`);
        }
      }
      let m = yc(l.prizes);
      l.kind === "lucky" && m.length ? (o = wc(m), s = m[o].amount) : l.kind === "random" && Number(l.maxAmount) > Number(l.amount) ? s = wo(Math.max(1, Math.round(l.amount)), Math.round(l.maxAmount)) : s = q.round2(l.amount), q.applyDelta(r, c.ref, { main: s }), q.ledger(r, { uid: t, type: "bonus", direction: "in", amount: s, bucket: "main", note: l.title, ref: a }), r.set(d.ref, { uid: t, bonusId: a, lastClaimAt: Ma.serverTimestamp(), lastClaimMs: Date.now(), lastAmount: s, count: Ma.increment(1) }, { merge: !0 }), q.bumpStats(r, { bonusPaid: s });
    }), { ok: !0, amount: s, prizeIndex: o };
  });
});

// src/ads.js
var Ao = D((bo) => {
  "use strict";
  var { onCall: bc } = X(), Pt = H(), { db: Ua, FieldValue: Ba } = Pt;
  bo.adEvent = bc({ region: Pt.REGION }, async (e) => {
    let t = Pt.authUid(e), a = e.data || {}, n = Pt.str(a.adId, { max: 80, label: "Ad" }), s = a.type === "click" ? "click" : a.type === "view" ? "view" : "";
    if (!s) throw Pt.bad("Invalid event.");
    let o = await Ua.doc("settings/content").get();
    if (!(o.exists && Array.isArray(o.data().ads) ? o.data().ads : []).some((i) => i && i.id === n)) throw Pt.bad("Unknown ad.");
    return await Ua.runTransaction(async (i) => {
      let c = Ua.doc(`adSeen/${n}_${t}`), d = await i.get(c), l = d.exists ? d.data() : {}, u = { updatedAt: Date.now() };
      s === "view" ? (u.views = Ba.increment(1), l.viewedAt || (u.uniqueViews = Ba.increment(1))) : (u.clicks = Ba.increment(1), l.clickedAt || (u.uniqueClicks = Ba.increment(1))), i.set(Ua.doc(`stats/ad_${n}`), u, { merge: !0 }), i.set(c, { uid: t, [s === "view" ? "viewedAt" : "clickedAt"]: Date.now() }, { merge: !0 });
    }), { ok: !0 };
  });
});

// supa/shims/functions-scheduler.js
var Qt = D((lu, To) => {
  "use strict";
  To.exports = { onSchedule: (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "schedule", a;
  } };
});

// supa/shims/firebase-admin-firestore.js
var vo = D((mu, ko) => {
  "use strict";
  var { AggregateField: Ac, FieldValue: Tc } = Ft();
  ko.exports = { AggregateField: Ac, FieldValue: Tc };
});

// src/ag/errors.js
var Ot = D((pu, _o) => {
  "use strict";
  var La = {
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
  }, So = (e) => La[e] || { msg: "Unknown error", en: "Something went wrong. Please try again.", bn: "\u0995\u09BF\u099B\u09C1 \u098F\u0995\u099F\u09BE \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" }, kc = (e) => !!(La[e] && La[e].retry), Ln = class extends Error {
    constructor(t, a = "") {
      super(`${t} ${So(t).msg}${a ? ` \u2014 ${a}` : ""}`), this.code = t, this.detail = a;
    }
  };
  _o.exports = { CODES: La, info: So, isRetryable: kc, AgError: Ln };
});

// src/ag/config.js
var xa = D((fu, $o) => {
  "use strict";
  var { db: Co } = H(), { AgError: vc } = Ot(), Sc = 30 * 1e3, qa = null, qn = 0, Io = {
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
  async function _c({ fresh: e = !1, requireSecret: t = !0 } = {}) {
    if (!e && qa && Date.now() - qn < Sc) return qa;
    let [a, n] = await Promise.all([Co.doc("adminConfig/gameApi").get(), Co.doc("adminPrivate/gameApi").get()]), s = { ...Io, ...a.exists ? a.data() : {}, secretKey: n.exists ? String(n.data().secretKey || "") : "" };
    if (s.terminalType = s.terminalType === "PC" ? "PC" : "PHONE", qa = s, qn = Date.now(), t && (!s.baseUrl || !s.merchantCode || !s.secretKey)) throw new vc("C20001", "Game API is not configured (base URL, merchant code, secret key).");
    return s;
  }
  function Cc() {
    qa = null, qn = 0;
  }
  $o.exports = { loadConfig: _c, clearConfigCache: Cc, DEFAULTS: Io };
});

// src/ag/sign.js
var jn = D((hu, Do) => {
  "use strict";
  var xn = ge("crypto"), Ga = "HmacSHA256", Ic = {
    merchant: "x-merchant-code",
    timestamp: "x-timestamp",
    nonce: "x-nonce",
    sign: "x-sign",
    signType: "x-content-processing-type"
  };
  function No(e, t, a, n, s) {
    let o = s == null ? "" : Buffer.isBuffer(s) ? s.toString("utf8") : String(s);
    return String(e) + String(t) + String(a) + String(n) + o;
  }
  function Gn(e, t, a, n, s, o = Ga) {
    if (!e) throw new Error("Secret key missing");
    return xn.createHmac("sha256", Buffer.from(String(e), "utf8")).update(Buffer.from(No(t, a, n, o, s), "utf8")).digest("hex");
  }
  function Eo(e, t) {
    let a = String(e || "").toLowerCase(), n = String(t || "").toLowerCase();
    return !/^[0-9a-f]+$/.test(a) || a.length !== n.length ? !1 : xn.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(n, "utf8"));
  }
  function $c(e, t, a, n, s, o, r = Ga) {
    return Eo(Gn(e, t, a, n, s, r), o);
  }
  var Ro = () => xn.randomBytes(16).toString("hex");
  function Nc(e, t, a) {
    let n = Date.now().toString(), s = Ro();
    return {
      "X-MERCHANT-CODE": t,
      "X-TIMESTAMP": n,
      "X-NONCE": s,
      "X-SIGN": Gn(e, t, n, s, a),
      "X-CONTENT-PROCESSING-TYPE": Ga
    };
  }
  function Ec(e, t) {
    if (!e) return "";
    if (typeof e.get == "function") return e.get(t) || "";
    let a = e[t] ?? e[t.toLowerCase()] ?? e[t.toUpperCase()];
    return Array.isArray(a) ? String(a[0]) : a == null ? "" : String(a);
  }
  Do.exports = { SIGN_TYPE: Ga, HEADERS: Ic, rawString: No, sign: Gn, verify: $c, safeEqualHex: Eo, newNonce: Ro, signedHeaders: Nc, header: Ec };
});

// src/ag/client.js
var Hn = D((gu, Bo) => {
  "use strict";
  var Rc = ge("crypto"), tt = jn(), Mo = Ot(), { db: Dc, FieldValue: Mc } = H(), Fn = 12e3, Pc = [400, 1200, 2500], Oc = 30, Po = () => "TRACE_" + Rc.randomBytes(10).toString("hex").toUpperCase(), Re = class extends Error {
    /** kind: timeout | network | http | badjson | badsign | provider */
    constructor(t, a, n = {}) {
      super(a), this.kind = t, Object.assign(this, n);
    }
  }, Oo = (e) => e instanceof Re && ["timeout", "network"].includes(e.kind) || e instanceof Re && e.kind === "http" && e.status >= 500 || e instanceof Re && e.kind === "provider" && Mo.isRetryable(e.code), Uc = (e) => new Promise((t) => setTimeout(t, e)), Uo = (e) => e && e.success !== !1 && (e.code === "C10000" || e.code == null && e.success === !0);
  async function Bc(e, t, a, n) {
    let s = { "Content-Type": "application/json", ...tt.signedHeaders(e.secretKey, e.merchantCode, a) }, o = new AbortController(), r = setTimeout(() => o.abort(), Fn), i, c;
    try {
      i = await n(e.baseUrl.replace(/\/+$/, "") + t, { method: "POST", headers: s, body: a, signal: o.signal }), c = await i.text();
    } catch (m) {
      throw new Re(
        m.name === "AbortError" ? "timeout" : "network",
        m.name === "AbortError" ? `Provider timed out after ${Fn / 1e3}s` : `Could not reach provider: ${m.cause?.code || m.message}`
      );
    } finally {
      clearTimeout(r);
    }
    if (!i.ok) throw new Re("http", `Provider returned HTTP ${i.status}`, { status: i.status, body: String(c).slice(0, 300) });
    let d = tt.header(i.headers, "X-SIGN"), l = e.verifyResponseSign || "auto";
    if (l !== "off" && (d || l === "strict") && !(d && tt.verify(
      e.secretKey,
      tt.header(i.headers, "X-MERCHANT-CODE") || e.merchantCode,
      tt.header(i.headers, "X-TIMESTAMP"),
      tt.header(i.headers, "X-NONCE"),
      c,
      d,
      tt.header(i.headers, "X-CONTENT-PROCESSING-TYPE") || tt.SIGN_TYPE
    )))
      throw new Re("badsign", "Provider response signature is invalid");
    let u;
    try {
      u = JSON.parse(c);
    } catch {
      throw new Re("badjson", "Provider returned a non-JSON response", { body: String(c).slice(0, 300) });
    }
    if (!Uo(u)) throw new Re("provider", `${u.code || "ERROR"}: ${u.msg || Mo.info(u.code).msg}`, { code: u.code || "C10001", providerMsg: u.msg });
    return u;
  }
  async function Lc(e, t, a = {}, n = {}) {
    let s = n.fetchImpl || fetch, o = n.retries ?? 2, r = { reqTraceId: Po(), ...a }, i = JSON.stringify(r), c = Date.now(), d = 0, l = null, u = null;
    for (; d <= o; d++)
      try {
        u = await Bc(e, t, i, s), l = null;
        break;
      } catch (m) {
        if (l = m, !Oo(m) || d === o) break;
        await Uc(Pc[d] || 2500);
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
        at: Mc.serverTimestamp(),
        expireAt: new Date(Date.now() + Oc * 864e5)
      };
      Dc.collection("agApiLogs").add(m).catch(() => {
      });
    }
    if (l) throw l;
    return u;
  }
  Bo.exports = { call: Lc, trace: Po, ClientError: Re, isSuccess: Uo, transient: Oo, TIMEOUT_MS: Fn };
});

// src/ag/engine.js
var Jo = D((wu, Yo) => {
  "use strict";
  var ea = ge("crypto"), { AgError: U } = Ot(), x = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, ta = (e) => x(Math.max(0, e)).toFixed(2), qc = /^[A-Za-z0-9_\-.]{1,128}$/, xo = 10;
  function re(e, t, a = 128) {
    let n = e[t];
    if (n == null || String(n).trim() === "") throw new U(t === "playerId" ? "G20001" : "C10002", `${t} is required`);
    let s = String(n).trim();
    if (s.length > a) throw new U("C10002", `${t} too long`);
    return s;
  }
  function ja(e, t) {
    let a = e[t];
    if (a == null || a === "") throw new U("C10002", `${t} is required`);
    if (typeof a != "number" && !/^\d+(\.\d+)?$/.test(String(a).trim())) throw new U("C10002", `${t} must be a non-negative decimal`);
    let n = Number(a);
    if (!Number.isFinite(n) || n < 0 || n > 1e12) throw new U("C10002", `${t} out of range`);
    return x(n);
  }
  function Lo(e, t, a) {
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
  function qo(e, t) {
    let a = e[t];
    if (a == null || a === "") throw new U("C10002", `${t} is required`);
    let n = Number(a);
    if (!Number.isFinite(n) || n < 0) throw new U("C10002", `${t} must be a Unix ms timestamp`);
    return n;
  }
  function aa(e) {
    let t = re(e, "playerId");
    if (!qc.test(t)) throw new U("G20006", "playerId has an invalid format");
    return t;
  }
  function na(e, t) {
    let a = re(e, "currencyCode", 16);
    if (t.currencyCode && a !== t.currencyCode) throw new U("G20005", `wallet currency is ${t.currencyCode}, got ${a}`);
    return a;
  }
  function wt(e) {
    let t = String(e);
    return /^[A-Za-z0-9_\-.:]{1,200}$/.test(t) && !/^\.+$/.test(t) && !t.startsWith("__") ? t : "h_" + ea.createHash("sha256").update(t).digest("hex");
  }
  function Go(e) {
    let t = Object.keys(e || {}).filter((a) => a !== "reqTraceId").sort();
    return ea.createHash("sha256").update(JSON.stringify(t.map((a) => [a, e[a]]))).digest("hex");
  }
  var at = (e) => x((Number(e?.main) || 0) + (Number(e?.winning) || 0));
  function Kn(e, t) {
    if (at(e) + 1e-9 < t) return null;
    let a = x(t), n = {};
    for (let s of ["main", "winning"]) {
      let o = x(Math.min(Math.max(Number(e?.[s]) || 0, 0), a));
      o > 0 && (n[s] = o, a = x(a - o));
    }
    return a > 0 ? null : n;
  }
  function zn(e, t, a) {
    let { db: n, FieldValue: s } = e, o = {}, r = {}, i = s.serverTimestamp();
    return {
      delta(c, d) {
        o[c] = x((o[c] || 0) + d);
      },
      stat(c, d) {
        r[c] = x((r[c] || 0) + d);
      },
      ledger(c, d, l, u, m, p, f) {
        u > 0 && t.set(n.collection("transactions").doc(), { uid: c, type: d, direction: l, amount: x(u), bucket: m, note: p, ref: f, createdAt: i });
      },
      flush() {
        let c = {};
        for (let [l, u] of Object.entries(o)) u !== 0 && (c[`balances.${l}`] = s.increment(u));
        Object.keys(c).length && t.update(a, c);
        let d = {};
        for (let [l, u] of Object.entries(r)) u !== 0 && (d[l] = s.increment(u));
        Object.keys(d).length && t.set(n.doc(`statsShards/ag_${ea.randomInt(0, xo)}`), d, { merge: !0 });
      },
      after(c) {
        let d = { ...c || {} };
        for (let [l, u] of Object.entries(o)) d[l] = x((Number(d[l]) || 0) + u);
        return d;
      }
    };
  }
  function jo(e) {
    return "MB" + ea.createHash("sha1").update(String(e) + ea.randomBytes(4).toString("hex")).digest("hex").slice(0, 18).toUpperCase();
  }
  function Fo(e, t, a) {
    if (e.status !== "active") throw new U("G30001", `account is ${e.status}`);
    let n = e.rg?.excludedUntil;
    if ((n?.toMillis ? n.toMillis() : Number(n) || 0) > a) throw new U("G30001", "player is self-excluded");
    if (t && t.status === "forced") throw new U("G30001", "session was force-logged-out");
  }
  async function Wn(e, t, a, n, s) {
    let { db: o, FieldValue: r } = e, i = Go(a);
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
  async function Ho(e, t) {
    let a = aa(t);
    na(t, e.cfg);
    let n = await e.db.doc(`users/${a}`).get();
    if (!n.exists) throw new U("G20006", a);
    return { balance: ta(at(n.data().balances)) };
  }
  async function Ko(e, t) {
    let a = aa(t);
    na(t, e.cfg);
    let n = await e.db.doc(`users/${a}`).get();
    if (!n.exists) throw new U("G20006", a);
    let s = n.data(), o = String(e.cfg.siteUrl || "").replace(/\/+$/, ""), r = /^https:\/\//.test(s.photoURL || "") ? s.photoURL : e.cfg.defaultAvatarUrl || (o ? `${o}/icons/icon-192.png` : "");
    return { nickName: String(s.username || s.name || "Player").slice(0, 32), avatarUrl: r };
  }
  async function zo(e, t) {
    let a = aa(t), n = na(t, e.cfg), s = re(t, "gameCode"), o = re(t, "roundId"), r = re(t, "betId"), i = re(t, "transactionId"), c = ja(t, "betAmount"), d = re(t, "timestamp", 40), { db: l } = e;
    return Wn(e, `bet_${wt(i)}`, t, { kind: "bet", transactionId: i, betId: r, roundId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: c, providerTime: d }, async (u) => {
      let m = l.doc(`users/${a}`), p = l.doc(`agBets/${wt(r)}`), f = l.doc(`agSessions/${a}`), [w, y, g] = await Promise.all([u.get(m), u.get(p), u.get(f)]);
      if (!w.exists) throw new U("G20006", a);
      let _ = w.data();
      Fo(_, g.exists ? g.data() : null, e.now);
      let k = y.exists ? y.data() : null;
      if (k && k.status === "cancelled") throw new U("C10002", `bet ${r} was already cancelled`);
      if (k && k.uid !== a) throw new U("C10002", `bet ${r} belongs to another player`);
      let h = Kn(_.balances, c);
      if (!h) throw new U("G30003", `needs ${c}, has ${at(_.balances)}`);
      let T = zn(e, u, m);
      for (let [I, z] of Object.entries(h)) T.delta(I, -z);
      T.ledger(a, "game_bet", "out", c, Object.keys(h)[0] || "main", s, r), T.stat("agBetVolume", c), T.stat("agBetCount", 1);
      let A = k?.merchantBetId || jo(r), E = k?.debitPlan || {};
      u.set(p, {
        betId: r,
        merchantBetId: A,
        uid: a,
        playerId: a,
        gameCode: s,
        roundId: o,
        currencyCode: n,
        betAmount: x((k?.betAmount || 0) + c),
        debitPlan: { main: x((E.main || 0) + (h.main || 0)), winning: x((E.winning || 0) + (h.winning || 0)) },
        winAmount: k?.winAmount || 0,
        winReversed: k?.winReversed || 0,
        betRefunded: !1,
        status: k?.status === "settled" ? "settled" : "placed",
        isFree: !1,
        createdAt: k?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: k?.at || e.now
      }, { merge: !0 }), T.flush();
      let R = { merchantBetId: A, balance: ta(at(T.after(_.balances))) };
      return { data: R, record: { merchantBetId: A, balanceAfter: R.balance, debitPlan: h } };
    });
  }
  async function Wo(e, t) {
    let a = aa(t), n = na(t, e.cfg), s = re(t, "gameCode"), o = re(t, "roundId"), r = re(t, "betId"), i = re(t, "transactionId"), c = ja(t, "betAmount"), d = ja(t, "winAmount"), l = Lo(t, "isFree", !1), u = Lo(t, "isEnd"), m = qo(t, "betTime"), p = qo(t, "settledTime"), f = re(t, "type", 16);
    if (!["win", "bet_win"].includes(f)) throw new U("C10002", "type must be win or bet_win");
    let { db: w } = e;
    return Wn(e, `win_${wt(i)}`, t, { kind: "win", type: f, transactionId: i, betId: r, roundId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: c, winAmount: d, isFree: l, isEnd: u, betTime: m, settledTime: p }, async (y) => {
      let g = w.doc(`users/${a}`), _ = w.doc(`agBets/${wt(r)}`), k = w.doc(`agSessions/${a}`), [h, T, A] = await Promise.all([y.get(g), y.get(_), y.get(k)]);
      if (!h.exists) throw new U("G20006", a);
      let E = h.data(), R = T.exists ? T.data() : null;
      if (R && R.uid !== a) throw new U("C10002", `bet ${r} belongs to another player`);
      if (R && R.status === "cancelled") throw new U("C10002", `bet ${r} was cancelled`);
      let I = zn(e, y, g), z = {}, ae = f === "bet_win" && !l && c > 0;
      if (ae) {
        if (Fo(E, A.exists ? A.data() : null, e.now), z = Kn(E.balances, c), !z) throw new U("G30003", `needs ${c}, has ${at(E.balances)}`);
        for (let [ha, ga] of Object.entries(z)) I.delta(ha, -ga);
        I.ledger(a, "game_bet", "out", c, Object.keys(z)[0] || "main", s, r), I.stat("agBetVolume", c), I.stat("agBetCount", 1);
      }
      d > 0 && (I.delta("winning", d), I.ledger(a, "game_win", "in", d, "winning", s + (l ? " (free spin)" : ""), r), I.stat("agWinPayout", d)), !R && f === "win" && I.stat("agOrphanWins", 1);
      let F = R?.merchantBetId || jo(r), ne = R?.debitPlan || {};
      y.set(_, {
        betId: r,
        merchantBetId: F,
        uid: a,
        playerId: a,
        gameCode: s,
        roundId: o,
        currencyCode: n,
        betAmount: x((R?.betAmount || 0) + (ae ? c : 0)),
        declaredBetAmount: c,
        debitPlan: { main: x((ne.main || 0) + (z.main || 0)), winning: x((ne.winning || 0) + (z.winning || 0)) },
        winAmount: x((R?.winAmount || 0) + d),
        winReversed: R?.winReversed || 0,
        betRefunded: R?.betRefunded || !1,
        isFree: l,
        isEnd: u,
        status: u ? "settled" : R?.status || "placed",
        betTime: m,
        settledTime: u ? p : R?.settledTime || null,
        createdAt: R?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: R?.at || e.now
      }, { merge: !0 }), I.flush();
      let He = { merchantBetId: F, balance: ta(at(I.after(E.balances))) };
      return { data: He, record: { merchantBetId: F, balanceAfter: He.balance, debitPlan: z } };
    });
  }
  async function Vo(e, t) {
    let a = aa(t), n = na(t, e.cfg), s = re(t, "gameCode"), o = re(t, "betId"), r = re(t, "merchantBetId"), i = ja(t, "betAmount"), c = re(t, "cancelType", 8).toUpperCase(), d = re(t, "transactionId");
    if (!["BET", "WIN"].includes(c)) throw new U("C10002", "cancelType must be BET or WIN");
    let { db: l } = e;
    return Wn(e, `cancel_${wt(d)}`, t, { kind: "cancel", cancelType: c, transactionId: d, betId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: i, merchantBetId: r }, async (u) => {
      let m = l.doc(`users/${a}`), p = l.doc(`agBets/${wt(o)}`), [f, w] = await Promise.all([u.get(m), u.get(p)]);
      if (!f.exists) throw new U("G20006", a);
      let y = f.data(), g = zn(e, u, m), _ = w.exists ? w.data() : null;
      if (_ && _.uid !== a) throw new U("C10002", `bet ${o} belongs to another player`);
      let k = 0, h = 0, T = "", A = e.FieldValue.serverTimestamp();
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
          for (let z of ["main", "winning"]) I[z] > 0 && g.delta(z, I[z]);
          k = x((I.main || 0) + (I.winning || 0)), g.ledger(a, "game_refund", "in", k, "main", `${s} bet cancelled`, o), g.stat("agBetVolume", -k), g.stat("agCancelCount", 1), Math.abs(k - i) > 1e-3 && (T = `refunded the ${k} actually debited (request said ${i})`);
        }
        u.set(p, { status: "cancelled", betRefunded: !0, cancelledAt: A, updatedAt: A }, { merge: !0 });
      } else {
        let I = x((_.winAmount || 0) - (_.winReversed || 0));
        if (I > 0) {
          let z = y.balances || {}, ae = x(Math.min(Math.max(Number(z.winning) || 0, 0), I)), F = x(Math.min(Math.max(Number(z.main) || 0, 0), x(I - ae))), ne = x(I - ae - F);
          ae + ne > 0 && g.delta("winning", -(ae + ne)), F > 0 && g.delta("main", -F), h = I, g.ledger(a, "game_win_reversal", "out", h, "winning", `${s} win cancelled`, o), g.stat("agWinPayout", -h), g.stat("agCancelCount", 1), ne > 0 && (T = `player balance short by ${ne}; recorded as negative winning balance`, g.stat("agDebt", ne));
        } else T = "nothing to reverse";
        u.set(p, { winReversed: x((_.winReversed || 0) + h), winCancelledAt: A, updatedAt: A }, { merge: !0 });
      }
      g.flush();
      let R = { merchantBetId: _?.merchantBetId || r, betId: o, balance: ta(at(g.after(y.balances))), currencyCode: n };
      return { data: R, record: { refunded: k, reversed: h, note: T, balanceAfter: R.balance } };
    });
  }
  var xc = {
    "/wallet/balance": (e, t) => Ho(e, t),
    "/player/info": (e, t) => Ko(e, t),
    "/wallet/bet": async (e, t) => (await zo(e, t)).data,
    "/wallet/win": async (e, t) => (await Wo(e, t)).data,
    "/wallet/cancel": async (e, t) => (await Vo(e, t)).data
  };
  Yo.exports = { ROUTES: xc, STAT_SHARDS: xo, balance: Ho, playerInfo: Ko, bet: zo, win: Wo, cancel: Vo, planDebit: Kn, safeId: wt, requestHash: Go, playable: at, round2: x, money: ta };
});

// src/ag/callbacks.js
var er = D((yu, Qo) => {
  "use strict";
  var Gc = ge("crypto"), We = jn(), pe = Ot(), { ROUTES: Xo, requestHash: jc } = Jo(), Fc = 24 * 36e5, Hc = 90;
  function Fa(e, t = null, a) {
    return { success: e === "C10000", code: e, msg: a || pe.info(e).msg, data: e === "C10000" ? t : null };
  }
  function Zo(e) {
    let t = String(e || "").split("?")[0].replace(/\/+$/, "");
    return Object.keys(Xo).find((a) => t === a || t.endsWith(a)) || null;
  }
  function Kc(e, t) {
    let a = We.header(e, "x-forwarded-for");
    return (a ? a.split(",")[0] : t || "").trim();
  }
  var Vn = cn(), zc = (e, t) => Vn.run(() => Wc(e, t));
  async function Wc(e, t) {
    let a = Date.now(), n = Zo(t.path), s = Buffer.isBuffer(t.rawBody) ? t.rawBody.toString("utf8") : String(t.rawBody ?? ""), o = null, r, i = "";
    try {
      if (t.method !== "POST") throw new pe.AgError("C10003", "POST required");
      if (!n) throw new pe.AgError("C10002", `unknown endpoint ${t.path}`);
      let m = t.headers || {}, p = We.header(m, "X-MERCHANT-CODE"), f = We.header(m, "X-TIMESTAMP"), w = We.header(m, "X-NONCE"), y = We.header(m, "X-SIGN"), g = We.header(m, "X-CONTENT-PROCESSING-TYPE");
      if (!p || !f || !w || !y || !g) throw new pe.AgError("C10003", "missing signature headers");
      if (w.length > 64 || y.length > 256) throw new pe.AgError("C10003", "header too long");
      if (!e.cfg.merchantCode || !e.cfg.secretKey) throw new pe.AgError("C20001", "merchant not configured on our side");
      if (p !== e.cfg.merchantCode) throw new pe.AgError("C20001", `unknown merchant ${p}`);
      if (g !== We.SIGN_TYPE) throw new pe.AgError("C10003", `unsupported signType ${g}`);
      let _ = Number(f), k = (Number(e.cfg.timestampToleranceSec) || 300) * 1e3;
      if (!/^\d{10,16}$/.test(f) || !Number.isFinite(_) || Math.abs(e.now - _) > k) throw new pe.AgError("C10003", "timestamp outside allowed window");
      if (!We.verify(e.cfg.secretKey, p, f, w, s, y, g)) throw new pe.AgError("C10004");
      let h = Array.isArray(e.cfg.callbackIpWhitelist) ? e.cfg.callbackIpWhitelist.filter(Boolean) : [];
      if (h.length && !h.includes(t.ip)) throw new pe.AgError("C10003", `IP ${t.ip} not allowed`);
      try {
        o = JSON.parse(s || "{}");
      } catch {
        throw new pe.AgError("C10002", "body is not valid JSON");
      }
      if (!o || typeof o != "object" || Array.isArray(o)) throw new pe.AgError("C10002", "body must be a JSON object");
      let T = e.db.doc(`agNonces/${Gc.createHash("sha256").update(p + ":" + w).digest("hex")}`), A = jc(o);
      try {
        await T.create({ route: n, bodyHash: A, at: e.now, expireAt: new Date(e.now + Fc) });
      } catch (R) {
        if (!(R.code === 6 || /ALREADY_EXISTS/i.test(String(R.message || R)))) throw R;
        let I = await T.get();
        if (!I.exists || I.data().bodyHash !== A) throw new pe.AgError("C10003", "nonce already used (replay)");
        i = "identical retry (same nonce + payload)";
      }
      let E = await Xo[n](e, o);
      r = Fa("C10000", E);
    } catch (m) {
      m instanceof pe.AgError ? (r = Fa(m.code), i = m.detail || i) : (r = Fa("C10001"), i = String(m && m.stack || m).slice(0, 500));
    }
    Vn.mark("done");
    let c = Vn.summary();
    c && Date.now() - a > 1500 && (i = (i ? i + " | " : "") + "timing " + c);
    let d = JSON.stringify(r), l = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
    e.cfg.secretKey && e.cfg.merchantCode && Object.assign(l, We.signedHeaders(e.cfg.secretKey, e.cfg.merchantCode, d));
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
      expireAt: new Date(e.now + Hc * 864e5)
    };
    return { status: t.method === "POST" ? 200 : 405, headers: l, body: d, log: u };
  }
  Qo.exports = { handle: zc, wrap: Fa, routeOf: Zo, clientIp: Kc };
});

// src/ag/platform.js
var Jn = D((ie) => {
  "use strict";
  var ar = ge("net"), { onCall: De, onRequest: Vc, HttpsError: nt } = X(), { onSchedule: nr } = Qt(), { AggregateField: Ut } = vo(), S = H(), { db: M, admin: Yc, FieldValue: Q, REGION: we } = S, Bt = Ot(), { loadConfig: Ve, clearConfigCache: Jc, DEFAULTS: sr } = xa(), fe = Hn(), tr = er(), Xc = ["slots", "live", "sports", "fishing", "lottery", "cards", "crash"], Zc = (e = "", t = "", a = "") => {
    let n = `${e} ${t} ${a}`.toUpperCase();
    return /LIVE|BACCARAT|ROULETTE/.test(n) ? "live" : /SPORT/.test(n) ? "sports" : /FISH/.test(n) ? "fishing" : /LOTT|KENO|BINGO/.test(n) ? "lottery" : /CARD|POKER|RUMMY|TEEN|ANDAR|TABLE/.test(n) ? "cards" : /CRASH|AVIATOR|ROCKET/.test(n) ? "crash" : "slots";
  }, Ha = (e) => String(e).replace(/[\/\s]/g, "_").slice(0, 400), Qc = ["BR_BRL", "GB_GBP", "DK_DKK", "DE_EUR", "ES_EUR", "FI_EUR", "FR_EUR", "ID_IDR", "IT_EUR", "NL_EUR", "NO_NOK", "PL_PLN", "PT_EUR", "TH_THB", "TR_TRY", "VN_VND", "MM_MMK", "SG_SGD", "NG_NGN", "US_USD", "PK_PKR", "CO_COP", "PH_PHP", "MX_MXN", "AR_ARS", "KE_KES", "CL_CLP", "ZA_ZAR", "BD_BDT", "IN_INR", "LK_LKR"], or = ["en", "ar", "az", "bg", "bn", "cs", "da", "de", "el", "en-stkus", "es", "et", "fa", "fi", "fr", "hi", "hu", "hy", "id", "it", "ja", "ko", "lo", "lt", "mn", "my", "ms", "nl", "no", "pl", "pt", "pt-br", "ro", "ru", "sh", "si", "sk", "sq", "sv", "th", "tr", "uk", "ur", "uz", "vi"];
  function Yn(e, t = "Game service error") {
    if (e instanceof nt) return e;
    if (e instanceof Bt.AgError || e instanceof fe.ClientError && e.kind === "provider") {
      let a = e.code || "C10001", n = Bt.info(a);
      return new nt("failed-precondition", n.en, { agCode: a, bn: n.bn, providerMsg: e.providerMsg || e.detail || "", retry: Bt.isRetryable(a) });
    }
    if (e instanceof fe.ClientError) {
      let a = {
        timeout: "The game provider did not respond in time. Please try again.",
        network: "Could not reach the game provider. Please try again.",
        http: `The game provider returned an error (HTTP ${e.status}).`,
        badjson: "The game provider sent an invalid response.",
        badsign: "The game provider response failed the security check."
      }[e.kind] || t;
      return new nt("unavailable", a, { kind: e.kind, status: e.status || null, retry: ["timeout", "network", "http"].includes(e.kind) });
    }
    return console.error(e), new nt("internal", t);
  }
  var Ge = (e) => async (t) => {
    try {
      return await e(t);
    } catch (a) {
      throw Yn(a);
    }
  }, ed = (e) => {
    let a = String(e.rawRequest?.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || String(e.rawRequest?.ip || "").replace(/^::ffff:/, "");
    return ar.isIP(a) ? a : "";
  }, yt = (e, t, a, n) => {
    let s = Number(e);
    if (!Number.isInteger(s) || s < t || s > a) throw S.bad(`${n} must be a whole number ${t}-${a}.`);
    return s;
  }, za = (e, t) => {
    let a = S.str(e, { max: 40, label: t }), n = Date.parse(a);
    if (!Number.isFinite(n)) throw S.bad(`${t} must be an ISO-8601 date/time.`);
    return { s: new Date(n).toISOString(), ms: n };
  }, Ka = /^[A-Za-z0-9-]{1,50}$/, sa = /^[A-Za-z0-9_\-.]{1,128}$/;
  ie.agCallback = Vc({ region: we, timeoutSeconds: 30, memory: "256MiB", minInstances: 0, concurrency: 80, invoker: "public" }, async (e, t) => {
    let a;
    try {
      a = await Ve({ requireSecret: !1 });
    } catch {
      a = { ...sr };
    }
    let n = await tr.handle({ db: M, FieldValue: Q, cfg: a, now: Date.now() }, {
      method: e.method,
      path: e.path || e.url,
      headers: e.headers,
      rawBody: e.rawBody || Buffer.from(""),
      ip: tr.clientIp(e.headers, e.ip)
    });
    M.collection("agCallbackLogs").add({ ...n.log, at: Q.serverTimestamp(), atMs: n.log.at }).catch((s) => console.error("log", s.message)), n.log.code === "C10001" && console.error("agCallback internal error", n.log.detail), t.status(n.status).set(n.headers).send(n.body);
  });
  ie.adminSaveGameApiConfig = De({ region: we }, Ge(async (e) => {
    let t = S.requireRole(e, ["super"]), a = e.data || {}, n = S.str(a.baseUrl, { max: 200, label: "Base URL", pattern: /^https:\/\/[^\s]+$/ }).replace(/\/+$/, ""), s = S.str(a.currencyCode || "BD_BDT", { max: 20, label: "Currency" });
    if (!Qc.includes(s)) throw S.bad("Unsupported currency code (see PDF \xA72.7).");
    let o = S.str(a.lang || "bn", { max: 10, label: "Language" });
    if (!or.includes(o)) throw S.bad("Unsupported language (see PDF \xA72.8).");
    let r = S.str(a.subMerchantCode || "site", { max: 50, label: "Sub-merchant code", pattern: Ka }), i = a.siteUrl ? S.str(a.siteUrl, { max: 200, label: "Site URL", pattern: /^https:\/\/[^\s/]+(\/[^\s]*)?$/ }).replace(/\/+$/, "") : "", c = (Array.isArray(a.callbackIpWhitelist) ? a.callbackIpWhitelist : String(a.callbackIpWhitelist || "").split(/[\s,]+/)).map((u) => String(u).trim()).filter(Boolean);
    if (c.some((u) => !ar.isIP(u))) throw S.bad("IP allow-list contains an invalid IP address.");
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
      timestampToleranceSec: yt(a.timestampToleranceSec ?? 300, 30, 900, "Timestamp tolerance"),
      callbackIpWhitelist: c.slice(0, 50),
      categoryMap: typeof a.categoryMap == "object" && a.categoryMap ? a.categoryMap : {},
      updatedAt: Q.serverTimestamp(),
      updatedBy: t
    };
    await M.doc("adminConfig/gameApi").set(d, { merge: !0 });
    let l = typeof a.secretKey == "string" && a.secretKey.trim().length > 0;
    return l && await M.doc("adminPrivate/gameApi").set({ secretKey: a.secretKey.trim(), rotatedAt: Q.serverTimestamp() }), await M.doc("adminConfig/gameApiStatus").set({ ok: !1, testedAt: null, message: "Configuration changed \u2014 run the connection test." }), Jc(), S.audit(null, t, "game_api_config", { baseUrl: n, merchantCode: d.merchantCode, env: d.env, secretChanged: l }), { ok: !0 };
  }));
  ie.adminGetGameApiConfig = De({ region: we }, Ge(async (e) => {
    S.requireRole(e, ["super"]);
    let [t, a, n, s] = await Promise.all([M.doc("adminConfig/gameApi").get(), M.doc("adminPrivate/gameApi").get(), M.doc("adminConfig/gameApiStatus").get(), M.doc("adminConfig/agMerchant").get()]), o = String((globalThis.__ENV || process.env).SUPABASE_URL || "").replace(/\/+$/, ""), r = { ...sr, ...t.exists ? t.data() : {} };
    return delete r.updatedAt, {
      config: r,
      secretSet: a.exists && !!a.data().secretKey,
      status: n.exists ? { ...n.data(), testedAt: n.data().testedAt?.toMillis?.() || null } : null,
      merchant: s.exists ? { ...s.data(), syncedAt: s.data().syncedAt?.toMillis?.() || null } : null,
      callbackUrls: [o ? `${o}/functions/v1/api/agw` : null].filter(Boolean)
    };
  }));
  ie.adminTestGameApi = De({ region: we, timeoutSeconds: 60 }, async (e) => {
    S.requireRole(e, ["super"]);
    let t = Date.now(), a;
    try {
      let n = await Ve({ fresh: !0 }), o = ((await fe.call(n, "/game/v5/providers", {}, { retries: 0 })).data?.providers || []).length;
      a = { ok: !0, latencyMs: Date.now() - t, message: `Connected \u2014 ${o} provider(s) returned.`, providerCount: o };
    } catch (n) {
      let s = Yn(n);
      a = { ok: !1, latencyMs: Date.now() - t, message: n.message || s.message, agCode: s.details?.agCode || null, kind: n.kind || s.details?.kind || "config", httpStatus: n.status || null };
    }
    return await M.doc("adminConfig/gameApiStatus").set({ ...a, testedAt: Q.serverTimestamp() }), a;
  });
  ie.adminSyncGames = De({ region: we, timeoutSeconds: 540, memory: "512MiB" }, Ge(async (e) => {
    let t = S.requireRole(e, ["super", "content"]), a = await Ve({ fresh: !0 }), s = ((await fe.call(a, "/game/v5/providers", {})).data?.providers || []).map((u) => typeof u == "string" ? { name: u, code: u } : u);
    await M.doc("adminConfig/agProviders").set({ providers: s, syncedAt: Q.serverTimestamp() });
    let o = (await fe.call(a, "/game/v5/categories", { currencyCode: a.currencyCode, lang: a.lang })).data?.categoryDataList || [], r = 0, i = [], c = /* @__PURE__ */ new Set(), d = new Set((await M.collection("games").limit(2e4).get()).docs.map((u) => u.id));
    for (let u of o) {
      let m = u.categoryCode || u.code;
      if (!m) continue;
      let p = (a.categoryMap || {})[m] || Zc(m, u.categoryName), f = 0;
      for (let w = 1; w <= 200; w++) {
        let y = await fe.call(a, "/game/v5/games", { categoryCode: m, currencyCode: a.currencyCode, lang: a.lang, pageIndex: w }), g = y.data?.gameItemList || y.data?.gameltemList || [];
        if (!g.length) break;
        let _ = M.batch();
        for (let h of g) {
          let T = h.gameCode;
          if (!T) continue;
          let A = Number.isInteger(Number(h.status)) ? Number(h.status) : 1;
          _.set(M.doc(`games/${Ha(T)}`), {
            gameCode: String(T),
            name: h.gameName || h.name || String(T),
            gameType: h.gameType || "",
            status: A,
            imageUrl: h.imageUrl || h.gameIcon || h.iconUrl || "",
            provider: h.providerCode || h.provider || "",
            categoryCode: m,
            categoryName: u.categoryName || m,
            lobbyCategory: p,
            syncedAt: Q.serverTimestamp(),
            ...d.has(Ha(T)) ? {} : { addedAt: Date.now() }
          }, { merge: !0 }), c.add(String(T)), r++, f++;
        }
        await _.commit();
        let k = Number(y.data?.totalSize) || 0;
        if (k && f >= k) break;
      }
      i.push({ code: m, name: u.categoryName || m, lobby: p, count: f });
    }
    let l = M.batch();
    return i.forEach((u) => l.set(M.doc(`gameCategories/${Ha(u.code)}`), { ...u, syncedAt: Q.serverTimestamp() }, { merge: !0 })), await l.commit(), S.audit(null, t, "games_synced", { providers: s.length, categories: i.length, games: r, unique: c.size }), { ok: !0, providers: s.length, categories: i.length, games: c.size };
  }));
  function td(e, t) {
    let a = String(e.rawRequest?.headers?.origin || "").replace(/\/+$/, ""), n = [t.siteUrl, String((globalThis.__ENV || process.env).SITE_URL || "").replace(/\/+$/, "")].filter(Boolean);
    if (a && (n.includes(a) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(a))) return a;
    if (t.siteUrl) return t.siteUrl;
    throw new nt("failed-precondition", "Set the Site URL in Admin \u2192 Game API (needed for the game exit page).");
  }
  ie.launchGame = De({ region: we, timeoutSeconds: 30 }, Ge(async (e) => {
    let t = S.requireVerified(e), a = e.data || {}, n = S.str(a.gameCode, { max: 120, label: "Game" }), [s, o, r] = await Promise.all([M.doc(`games/${Ha(n)}`).get(), M.doc(`users/${t}`).get(), Ve()]), i = o.data();
    S.assertActive(i);
    let c = i.rg?.excludedUntil;
    if ((c?.toMillis ? c.toMillis() : Number(c) || 0) > Date.now()) throw new nt("failed-precondition", "You are on a self-exclusion break. Games are unavailable until it ends.");
    if (!s.exists || s.data().enabled === !1) throw new Bt.AgError("G20002");
    if (s.data().status === 0) throw new Bt.AgError("G20003");
    if (s.data().status === 2) throw new Bt.AgError("G20010");
    let d = ed(e);
    if (!d) throw new nt("failed-precondition", "Could not determine your IP address.");
    let l = a.terminalType === "PC" ? "PC" : a.terminalType === "PHONE" ? "PHONE" : r.terminalType, u = td(e, r), m = {
      gameCode: s.data().gameCode,
      playerId: t,
      currencyCode: r.currencyCode,
      language: or.includes(a.language) ? a.language : r.lang,
      terminalType: l,
      returnUrl: `${u}/exitGame.html?game=${encodeURIComponent(s.data().gameCode)}`,
      ipAddress: d,
      subMerchantCode: r.subMerchantCode || "site",
      nickName: String(i.username || i.name || "Player").slice(0, 32)
    };
    /^https:\/\//.test(i.photoURL || "") && (m.avatarUrl = i.photoURL);
    let p = await fe.call(r, "/game/v5/game/url", m), f = p.data?.gameUrl || p.data?.url;
    if (!f || !/^https?:\/\//.test(f)) throw new nt("unavailable", "The game provider did not return a game URL.");
    return await M.doc(`agSessions/${t}`).set({
      uid: t,
      status: "active",
      gameCode: s.data().gameCode,
      gameName: s.data().name || "",
      terminalType: l,
      ip: d,
      expireTime: p.data?.expireTime || null,
      launchedAt: Q.serverTimestamp(),
      launchedAtMs: Date.now(),
      closedAt: null,
      forcedAt: null
    }, { merge: !0 }), await M.collection("gameHistory").add({ uid: t, game: s.data().gameCode, provider: "ag", status: "launched", at: Q.serverTimestamp() }), { gameUrl: f, gameCode: s.data().gameCode, gameName: s.data().name || "", expireTime: p.data?.expireTime || null };
  }));
  ie.agExitGame = De({ region: we }, Ge(async (e) => {
    let t = S.authUid(e), a = M.doc(`agSessions/${t}`);
    return await M.runTransaction(async (n) => {
      let s = await n.get(a);
      s.exists && s.data().status === "active" && n.update(a, { status: "closed", closedAt: Q.serverTimestamp() });
    }), { ok: !0 };
  }));
  async function rr(e, t, a, { revokeTokens: n = !1, reason: s = "" } = {}) {
    let o = "SKIPPED", r = "";
    try {
      let i = await fe.call(e, "/game/v5/player/force/logout", { playerId: t });
      o = i.data?.logoutStatus || "SUCCESS", r = i.data?.message || "";
    } catch (i) {
      o = "FAILED", r = Yn(i).message;
    }
    return await M.doc(`agSessions/${t}`).set({ uid: t, status: "forced", forcedAt: Q.serverTimestamp(), forcedBy: a, forceReason: s, providerLogout: o }, { merge: !0 }), n && (await Yc.auth().revokeRefreshTokens(t), await M.doc(`users/${t}`).set({ sessionsRevokedAt: Q.serverTimestamp() }, { merge: !0 })), await M.collection("users").doc(t).collection("notifications").add({
      title: "Signed out of games",
      body: s || "Your game session was ended by support.",
      type: "security",
      read: !1,
      createdAt: Q.serverTimestamp()
    }), { playerId: t, logoutStatus: o, message: r };
  }
  ie.adminForceLogout = De({ region: we, timeoutSeconds: 300 }, Ge(async (e) => {
    let t = S.requireRole(e, ["super", "support"]), a = e.data || {}, n = await Ve(), s = typeof a.reason == "string" ? a.reason.trim().slice(0, 200) : "", o = [];
    a.all === !0 ? o = (await M.collection("agSessions").where("status", "==", "active").limit(200).get()).docs.map((c) => c.id) : o = [S.str(a.uid, { max: 128, label: "Player", pattern: sa })];
    let r = [];
    for (let i of o) r.push(await rr(n, i, t, { revokeTokens: a.revokeTokens === !0, reason: s }));
    return S.audit(null, t, "ag_force_logout", { count: r.length, all: a.all === !0, revokeTokens: a.revokeTokens === !0, failed: r.filter((i) => i.logoutStatus === "FAILED").length }), { ok: !0, results: r };
  }));
  ie.forceLogoutOne = rr;
  ie.adminAgRtp = De({ region: we, timeoutSeconds: 60 }, Ge(async (e) => {
    let t = S.requireRole(e, ["super", "finance"]), a = e.data || {}, n = await Ve(), s = n.currencyCode, o, r = null;
    switch (a.action) {
      case "subMerchant": {
        let i = S.str(a.subMerchantCode || n.subMerchantCode, { max: 50, label: "Sub-merchant", pattern: Ka }), c = yt(a.rtp, 1, 100, "RTP");
        o = await fe.call(n, "/game/v5/set/sub/merchant/rtp", { subMerchantCode: i, rtp: c, currencyCode: s }), r = { scope: "SUB_MERCHANT", subMerchantCode: i, rtp: c, changed: o.data?.changedRtpValue };
        break;
      }
      case "player": {
        let i = S.str(a.playerId, { max: 128, label: "Player", pattern: sa }), c = yt(a.rtp, 1, 100, "RTP");
        o = await fe.call(n, "/game/v5/set/player/rtp", { currencyCode: s, rtp: c, playerId: i }), r = { scope: "PLAYER", playerId: i, rtp: c, changed: o.data?.changedRtpValue };
        break;
      }
      case "batch": {
        let i = [...new Set((Array.isArray(a.playerIds) ? a.playerIds : []).map((d) => String(d).trim()).filter(Boolean))];
        if (!i.length || i.length > 50) throw S.bad("Provide 1-50 player IDs.");
        if (i.some((d) => !sa.test(d))) throw S.bad("One of the player IDs is invalid.");
        let c = yt(a.rtp, 1, 100, "RTP");
        o = await fe.call(n, "/game/v5/batch/set/player/rtp", { currencyCode: s, rtp: c, playerIds: i }), r = { scope: "BATCH", playerIds: i, rtp: c, accepted: !0 };
        break;
      }
      case "effective": {
        let i = { currencyCode: s };
        a.subMerchantCode && (i.subMerchantCode = S.str(a.subMerchantCode, { max: 50, pattern: Ka, label: "Sub-merchant" })), a.playerId && (i.playerId = S.str(a.playerId, { max: 128, pattern: sa, label: "Player" })), o = await fe.call(n, "/game/v5/rtp/effective", i);
        break;
      }
      case "history": {
        let i = za(a.startTime, "Start time"), c = za(a.endTime, "End time");
        if (i.ms >= c.ms) throw S.bad("Start time must be before end time.");
        if (i.ms < Date.now() - 31 * 864e5) throw S.bad("Only the past month can be queried (PDF \xA75.4.4).");
        let d = { currencyCode: s, startTime: i.s, endTime: c.s, pageSize: yt(a.pageSize ?? 20, 1, 100, "Page size") };
        a.cursor && (d.cursor = S.str(a.cursor, { max: 200, label: "Cursor" })), a.subMerchantCode && (d.subMerchantCode = S.str(a.subMerchantCode, { max: 50, pattern: Ka, label: "Sub-merchant" })), a.playerId && (d.playerId = S.str(a.playerId, { max: 128, pattern: sa, label: "Player" })), Array.isArray(a.playerIds) && a.playerIds.length && (d.playerIds = a.playerIds.slice(0, 50).map(String)), o = await fe.call(n, "/game/v5/rtp/change/history", d);
        break;
      }
      default:
        throw S.bad("Unknown RTP action.");
    }
    return r && (await M.collection("agRtpChanges").add({ ...r, currencyCode: s, by: t, at: Q.serverTimestamp() }), S.audit(null, t, "ag_rtp_change", r)), { ok: !0, data: o.data ?? {} };
  }));
  async function ir(e, { startIso: t, endIso: a, pageNum: n, pageSize: s, sort: o }) {
    let i = (await fe.call(e, "/game/v5/game/record", { pageNum: n, pageSize: s, reqData: { startTime: t, endTime: a, sort: o } })).data?.gameRecordList || [];
    if (i.length) {
      let c = M.batch();
      for (let d of i) {
        if (d.orderNo === void 0 || d.orderNo === null) continue;
        let l = d.playerId || d.playerUniqueId || "", u = Number(d.betAmount) || 0, m = Number(d.winAmount) || 0;
        c.set(M.doc(`agGameRecords/${String(d.orderNo)}`), {
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
          syncedAt: Q.serverTimestamp()
        }, { merge: !0 });
      }
      await c.commit();
    }
    return i;
  }
  ie.adminAgGameRecords = De({ region: we, timeoutSeconds: 120 }, Ge(async (e) => {
    S.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = await Ve(), n = za(t.startTime, "Start time"), s = za(t.endTime, "End time");
    if (n.ms >= s.ms) throw S.bad("Start time must be before end time.");
    let o = await ir(a, { startIso: n.s, endIso: s.s, pageNum: yt(t.pageNum ?? 1, 1, 1e5, "Page"), pageSize: yt(t.pageSize ?? 20, 1, 100, "Page size"), sort: t.sort !== !1 });
    return { ok: !0, records: o, hasMore: o.length >= (Number(t.pageSize) || 20) };
  }));
  async function cr(e) {
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
      syncedAt: Q.serverTimestamp()
    };
    return await M.doc("adminConfig/agMerchant").set(r), r;
  }
  ie.adminAgMerchantInfo = De({ region: we, timeoutSeconds: 60 }, Ge(async (e) => (S.requireRole(e, ["super", "finance"]), { ok: !0, merchant: { ...await cr(await Ve({ fresh: !0 })), syncedAt: Date.now() } })));
  ie.adminAgReport = De({ region: we, timeoutSeconds: 60 }, Ge(async (e) => {
    S.requireRole(e, ["super", "finance"]);
    let t = e.data || {}, a = Number(t.from) || Date.now() - 864e5, n = Number(t.to) || Date.now();
    if (a >= n || n - a > 400 * 864e5) throw S.bad("Invalid date range.");
    let s = M.collection("agBets").where("at", ">=", a).where("at", "<", n), [o, r, i, c] = await Promise.all([
      s.aggregate({ bets: Ut.sum("betAmount"), wins: Ut.sum("winAmount"), reversed: Ut.sum("winReversed"), n: Ut.count() }).get(),
      s.where("status", "==", "cancelled").aggregate({ refunded: Ut.sum("betAmount"), n: Ut.count() }).get(),
      M.collection("statsShards").get(),
      M.collection("agSessions").where("status", "==", "active").count().get()
    ]), d = o.data(), l = r.data(), u = (d.bets || 0) - (l.refunded || 0), m = (d.wins || 0) - (d.reversed || 0), p = {};
    return i.docs.filter((f) => f.id.startsWith("ag_")).forEach((f) => {
      for (let [w, y] of Object.entries(f.data())) p[w] = Math.round(((p[w] || 0) + (Number(y) || 0)) * 100) / 100;
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
  ie.agScheduledSync = nr({ region: we, schedule: "every 30 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    let e;
    try {
      e = await Ve({ fresh: !0 });
    } catch {
      return;
    }
    try {
      await cr(e);
    } catch (a) {
      console.error("merchant sync", a.message);
    }
    try {
      let a = /* @__PURE__ */ new Date(), n = new Date(a.getTime() - 40 * 6e4);
      for (let s = 1; s <= 50 && !((await ir(e, { startIso: n.toISOString(), endIso: a.toISOString(), pageNum: s, pageSize: 100, sort: !1 })).length < 100); s++)
        ;
    } catch (a) {
      console.error("records sync", a.message);
    }
    let t = await M.collection("agSessions").where("status", "==", "active").where("launchedAtMs", "<", Date.now() - 12 * 36e5).limit(400).get();
    if (!t.empty) {
      let a = M.batch();
      t.docs.forEach((n) => a.update(n.ref, { status: "expired", closedAt: Q.serverTimestamp() })), await a.commit();
    }
  });
  ie.agCleanup = nr({ region: we, schedule: "every day 04:10", timeZone: "Asia/Dhaka", timeoutSeconds: 540 }, async () => {
    let e = /* @__PURE__ */ new Date();
    for (let t of ["agNonces", "agCallbackLogs", "agApiLogs"])
      for (let a = 0; a < 40; a++) {
        let n = await M.collection(t).where("expireAt", "<", e).limit(400).get();
        if (n.empty) break;
        let s = M.batch();
        n.docs.forEach((o) => s.delete(o.ref)), await s.commit();
      }
  });
  ie.LOBBY = Xc;
});

// src/account.js
var dr = D((oa) => {
  "use strict";
  var { onCall: Va } = X(), Se = H(), { db: bt, admin: Xn, FieldValue: Wa, HttpsError: ad, REGION: Ya } = Se;
  oa.setResponsibleGaming = Va({ region: Ya }, async (e) => {
    let t = Se.authUid(e), a = e.data || {}, n = bt.doc(`users/${t}`), s = {};
    if (await bt.runTransaction(async (o) => {
      let r = await o.get(n);
      Se.assertActive(r.data());
      let i = { ...r.data().rg || {} }, c = Date.now();
      if (i.pendingLimitAt && i.pendingLimitAt <= c && (i.dailyDepositLimit = i.pendingLimit, delete i.pendingLimit, delete i.pendingLimitAt), a.dailyDepositLimit !== void 0) {
        let d = Number(a.dailyDepositLimit) || 0;
        if (d < 0 || d > 1e8) throw Se.bad("Invalid limit.");
        let l = Number(i.dailyDepositLimit) || 0;
        d > 0 && (l === 0 || d < l) ? (i.dailyDepositLimit = Se.round2(d), delete i.pendingLimit, delete i.pendingLimitAt, s.applied = "now") : d !== l && (i.pendingLimit = Se.round2(d), i.pendingLimitAt = c + 24 * 36e5, s.applied = "in24h");
      }
      if (a.excludeDays !== void 0) {
        let d = Number(a.excludeDays);
        if (![1, 7, 30, 90, 180, 365].includes(d)) throw Se.bad("Choose 1, 7, 30, 90, 180 or 365 days.");
        let l = c + d * 864e5, u = i.excludedUntil?.toMillis ? i.excludedUntil.toMillis() : Number(i.excludedUntil) || 0;
        i.excludedUntil = Math.max(u, l), s.excludedUntil = i.excludedUntil, o.set(bt.doc(`agSessions/${t}`), { uid: t, status: "forced", forcedAt: Wa.serverTimestamp(), forceReason: "self-exclusion" }, { merge: !0 });
      }
      o.update(n, { rg: i }), s.rg = i;
    }), s.excludedUntil)
      try {
        let { loadConfig: o } = xa();
        await Hn().call(await o(), "/game/v5/player/force/logout", { playerId: t }, { retries: 1 });
      } catch (o) {
        console.warn("self-exclusion provider logout", o.message);
      }
    return { ok: !0, ...s };
  });
  oa.revokeMySessions = Va({ region: Ya }, async (e) => {
    let t = Se.authUid(e);
    return await Xn.auth().revokeRefreshTokens(t), await bt.doc(`users/${t}`).set({ sessionsRevokedAt: Wa.serverTimestamp() }, { merge: !0 }), await bt.collection("loginHistory").add({ uid: t, event: "logout_all", at: Wa.serverTimestamp() }), { ok: !0 };
  });
  oa.adminListStaff = Va({ region: Ya }, async (e) => (Se.requireRole(e, ["super"]), { staff: (await bt.collection("users").where("role", "in", Se.STAFF_ROLES).limit(100).get()).docs.map((a) => ({ uid: a.id, name: a.data().name || "", username: a.data().username || "", email: a.data().email || "", role: a.data().role, status: a.data().status })) }));
  oa.adminSignOutUser = Va({ region: Ya, timeoutSeconds: 60 }, async (e) => {
    let t = Se.requireRole(e, ["super", "support"]), a = Se.str((e.data || {}).uid, { max: 128, label: "User" });
    if (!await Xn.auth().getUser(a).catch(() => null)) throw new ad("not-found", "User not found.");
    await Xn.auth().revokeRefreshTokens(a), await bt.doc(`users/${a}`).set({ sessionsRevokedAt: Wa.serverTimestamp() }, { merge: !0 });
    try {
      let { loadConfig: s } = xa(), { forceLogoutOne: o } = Jn();
      await o(await s(), a, t, { reason: "Signed out by support" });
    } catch (s) {
      console.warn("provider logout", s.message);
    }
    return Se.audit(null, t, "user_signed_out", { uid: a }), { ok: !0 };
  });
});

// src/fswrite.js
var gr = D((hr) => {
  "use strict";
  var { onCall: nd } = X(), At = H(), { db: ur, HttpsError: mr, REGION: sd } = At, { merge: lr, setPath: od, plain: rd } = Ft(), ye = (e) => typeof e == "number" && Number.isFinite(e), je = (e) => typeof e == "string", pr = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  }, Ie = (e, t) => t.includes(pr(e)), fr = (e) => new mr("permission-denied", e || "You do not have permission."), id = (e, t) => [.../* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])].filter((n) => JSON.stringify((e || {})[n]) !== JSON.stringify((t || {})[n])), Ja = (e, t, a) => id(e, t).every((n) => a.includes(n)), $ = (e, t) => {
    if (!e) throw fr(t);
  };
  function cd(e, t, a, n, s, o) {
    let r = a.split("/"), i = pr(e) !== null;
    if (r[0] === "users" && r.length === 2) {
      $(n === "update" && t === r[1], "Not allowed."), $(Ja(s, o, ["name", "phone", "photoURL", "lastSeenAt"]), "You cannot change that field."), $(je(o.name) && o.name.length >= 2 && o.name.length <= 60, "Name must be 2-60 characters."), $(je(o.phone) && /^\+?[0-9]{8,15}$/.test(o.phone), "Invalid phone number."), $(je(o.photoURL) && o.photoURL.length < 600, "Invalid photo.");
      return;
    }
    if (r[0] === "users" && r[2] === "notifications" && r.length === 4) {
      if ($(t === r[1], "Not allowed."), n === "delete") return;
      $(n === "update" && Ja(s, o, ["read"]) && typeof o.read == "boolean", "Not allowed.");
      return;
    }
    if (r[0] === "users" && r[2] === "devices" && r.length === 4) {
      if ($(t === r[1], "Not allowed."), n === "delete") return;
      $(Object.keys(o).every((c) => ["platform", "updatedAt"].includes(c)) && je(o.platform), "Invalid device.");
      return;
    }
    if (r[0] === "users" && r[2] === "private" && r[3] === "withdrawAccounts" && r.length === 4) {
      if ($(t === r[1], "Not allowed."), n === "delete") return;
      $(Object.keys(o).every((c) => ["list", "updatedAt"].includes(c)) && Array.isArray(o.list) && o.list.length <= 6, "Invalid saved accounts.");
      return;
    }
    if (r[0] === "paymentMethods" && r.length === 2) {
      if ($(Ie(e, ["super", "finance"])), n === "delete") return;
      $(je(o.name) && o.name.length > 0 && o.name.length <= 60 && typeof o.enabled == "boolean", "Invalid payment method."), $(o.type === void 0 || ["deposit", "withdraw", "both"].includes(o.type), "Invalid type."), $(o.minAmount === void 0 || ye(o.minAmount) && o.minAmount >= 0, "Invalid minimum."), $(o.cardChangeFee === void 0 || ye(o.cardChangeFee) && o.cardChangeFee >= 0 && o.cardChangeFee <= 1e5, "Invalid card change fee."), $(o.cardLock === void 0 || typeof o.cardLock == "boolean", "Invalid card lock."), $(["logo", "cardBg"].every((c) => o[c] === void 0 || je(o[c]) && o[c].length <= 300), "Invalid logo.");
      return;
    }
    if (r[0] === "paymentAccounts" && r.length === 2) {
      if ($(Ie(e, ["super", "finance"])), n === "delete") return;
      $(je(o.methodId) && je(o.accountNumber) && ["active", "standby", "cooldown", "paused", "disabled", "maintenance", "locked", "archived"].includes(o.status) && ye(o.dailyLimit) && ye(o.monthlyLimit), "Invalid payment account."), $(["bankName", "branch"].every((c) => o[c] === void 0 || typeof o[c] == "string" && o[c].length <= 60), "Invalid bank details."), $(o.cycleLimit === void 0 || ye(o.cycleLimit) && o.cycleLimit >= 0 && o.cycleLimit <= 1e8, "Invalid cycle limit."), $(o.cooldownDays === void 0 || ye(o.cooldownDays) && o.cooldownDays >= 0 && o.cooldownDays <= 365, "Invalid cooldown.");
      return;
    }
    if (r[0] === "paymentAccounts" && r[2] === "private" && r.length === 4) {
      $(Ie(e, ["super", "finance"]));
      return;
    }
    if ((r[0] === "banners" || r[0] === "legal") && r.length === 2) {
      $(Ie(e, ["super", "content"]));
      return;
    }
    if (r[0] === "bonuses" && r.length === 2) {
      if ($(Ie(e, ["super", "content", "finance"])), n === "delete") return;
      $(je(o.title) && ye(o.amount) && o.amount > 0 && o.amount <= 1e6 && ["once", "daily", "weekly", "monthly"].includes(o.type) && typeof o.enabled == "boolean", "Invalid bonus."), $(o.kind === void 0 || ["fixed", "random", "lucky"].includes(o.kind), "Invalid bonus kind."), $(o.maxAmount === void 0 || ye(o.maxAmount) && o.maxAmount >= o.amount && o.maxAmount <= 1e6, "Maximum must be \u2265 minimum (up to 1,000,000)."), $(o.prizes === void 0 || Array.isArray(o.prizes) && o.prizes.length <= 12 && o.prizes.every((c) => c && ye(c.amount) && c.amount > 0 && c.amount <= 1e6 && ye(c.weight) && c.weight > 0 && c.weight <= 1e5), "Invalid prizes (max 12)."), $(o.kind !== "lucky" || Array.isArray(o.prizes) && o.prizes.length >= 2, "A lucky draw needs at least 2 prizes.");
      return;
    }
    if (r[0] === "lotteries" && r.length === 2) {
      if ($(Ie(e, ["super", "content"])), n === "delete") {
        $(s && s.sold === 0, "Tickets were already sold.");
        return;
      }
      if (!s) {
        $(o.sold === 0 && o.status === "open" && ye(o.price) && ye(o.prize) && ye(o.totalTickets), "Invalid lottery.");
        return;
      }
      $(Ja(s, o, ["title", "price", "prize", "endsAt", "totalTickets", "maxPerUser", "imageUrl", "status", "autoDraw"]), "You cannot change that field."), $(["open", "closed"].includes(o.status) && ["open", "closed"].includes(s.status) && o.totalTickets >= s.sold, "Invalid lottery.");
      return;
    }
    if (r[0] === "games" && r.length === 2) {
      $(n === "update" && Ie(e, ["super", "content"]) && Ja(s, o, ["enabled", "featured", "sort", "lobbyCategory", "name", "imageUrl"]), "Not allowed.");
      return;
    }
    if (r[0] === "settings" && r.length === 2 && /^ban_/.test(r[1])) {
      if ($(Ie(e, ["super", "content"]) && /^ban_[a-z0-9_]{2,40}$/.test(r[1]), "Not allowed."), n === "delete") return;
      $(je(o.data) && /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(o.data) && o.data.length <= 7e5 && ye(o.v), "Picture must be a WEBP/JPG/PNG under 500 KB.");
      return;
    }
    if (r[0] === "settings" && r.length === 2) {
      let c = r[1];
      $(c === "support" && Ie(e, ["super", "support"]) || c === "content" && Ie(e, ["super", "content", "support"]) || c === "site" && Ie(e, ["super", "finance"]) || !["support", "content", "site"].includes(c) && Ie(e, ["super"]), "Not allowed.");
      return;
    }
    throw fr("Not allowed.");
  }
  hr.fsWrite = nd({ region: sd }, async (e) => {
    let t = At.authUid(e), a = (e.data || {}).ops;
    if (!Array.isArray(a) || !a.length || a.length > 400) throw At.bad("Invalid request.");
    return await ur.runTransaction(async (n) => {
      let s = [];
      for (let o of a) {
        let r = At.str(o.path, { max: 300, label: "Path" });
        if (!/^[A-Za-z0-9_\-./]+$/.test(r) || r.includes("..") || r.split("/").length % 2 !== 0) throw At.bad("Invalid path.");
        let i = ur.doc(r), c = await n.get(i), d = c.exists ? c.data() : void 0, l = o.op === "create" ? "set" : o.op;
        if (!["set", "update", "delete"].includes(l)) throw At.bad("Invalid operation.");
        let u;
        if (l === "delete") u = void 0;
        else {
          let m = rd(o.data || {});
          if (typeof m != "object" || Array.isArray(m)) throw At.bad("Invalid data.");
          if (l === "update") {
            if (!d) throw new mr("not-found", "Document not found.");
            u = JSON.parse(JSON.stringify(d));
            for (let [p, f] of Object.entries(m)) od(u, p, f);
          } else u = o.merge && d ? lr(JSON.parse(JSON.stringify(d)), m) : lr({}, m);
        }
        cd(e, t, r, l === "delete" ? "delete" : d ? "update" : "create", d, u), s.push({ ref: i, type: l, data: o.data, merge: !!o.merge });
      }
      for (let o of s)
        o.type === "delete" ? n.delete(o.ref) : o.type === "update" ? n.update(o.ref, o.data) : n.set(o.ref, o.data, { merge: o.merge });
    }), { ok: !0 };
  });
});

// src/rotation.js
var Ar = D((ra) => {
  "use strict";
  var { onCall: Qn } = X(), { onSchedule: dd } = Qt(), _e = H(), Xa = An(), { db: Me, FieldValue: ud, HttpsError: Zn, REGION: Za } = _e, Qa = Xa.n0, wr = async () => {
    let e = await _e.siteSettings();
    return Math.max(1, Qa((e.deposit || {}).min) || 1);
  }, yr = (e) => e && typeof e.toMillis == "function" ? e.toMillis() : Qa(e);
  async function br(e = Date.now()) {
    let t = await wr(), a = await Me.collection("paymentMethods").get(), n = 0;
    for (let i of a.docs)
      (await Me.runTransaction((d) => Xa.rotateTx(d, i.id, { now: e, min: t, reason: "tick" }))).changed.length && n++;
    let s = await _e.siteSettings(), o = Qa((s.deposit || {}).expireHours), r = 0;
    if (o > 0) {
      let i = await Me.collection("deposits").where("status", "==", "pending").limit(200).get();
      for (let c of i.docs) {
        let d = c.data();
        if (!d.createdAt || yr(d.createdAt) > e - o * 36e5) continue;
        await Me.runTransaction(async (u) => {
          let m = await u.get(c.ref);
          return !m.exists || m.data().status !== "pending" ? !1 : (d.accountId && await Xa.rotateTx(u, d.methodId, { now: e, min: t, settle: { accountId: d.accountId, amount: d.amount, outcome: "release" } }), u.update(c.ref, { status: "expired", note: "Expired: not reviewed in time", reviewedAt: ud.serverTimestamp(), reviewedBy: "system" }), _e.notify(u, d.uid, "Deposit expired", "Your deposit request expired. Please contact support if you already paid.", "deposit"), _e.bumpStats(u, { pendingDeposits: -1 }), _e.audit(u, "system", "deposit_expired", { depositId: c.id, amount: d.amount }), !0);
        }) && r++;
      }
    }
    return { rotated: n, expired: r };
  }
  ra.paymentRotationTick = dd({ region: Za, schedule: "every 10 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    await br();
  });
  ra.paymentSync = Qn({ region: Za }, async (e) => {
    let t = _e.authUid(e), a = e.auth.token.admin === !0 && ["super", "finance"].includes(e.auth.token.role), n = Me.doc("system/paymentTick"), s = await n.get(), o = s.exists ? Qa(s.data().at) : 0;
    return !(a && (e.data || {}).force) && Date.now() - o < 45e3 ? { ok: !0, skipped: !0 } : (await n.set({ at: Date.now(), by: t }, { merge: !0 }), { ok: !0, ...await br() });
  });
  var ld = ["activate", "pause", "resume", "reset"];
  ra.paymentAccountAction = Qn({ region: Za }, async (e) => {
    let t = _e.requireRole(e, ["super", "finance"]), a = e.data || {}, n = _e.str(a.accountId, { max: 120, label: "Account" }), s = a.action;
    if (!ld.includes(s)) throw _e.bad("Invalid action.");
    let o = await wr(), i = await Me.doc(`paymentAccounts/${n}`).get();
    if (!i.exists) throw new Zn("not-found", "Account not found.");
    let c = i.data().methodId;
    return await Me.runTransaction(async (d) => {
      let u = (await Xa.rotateTx(d, c, { now: Date.now(), min: o, force: { [s]: n }, reason: "manual" })).accounts.find((m) => m.id === n);
      if (!u) throw new Zn("not-found", "Account not found.");
      _e.audit(d, t, `payment_account_${s}`, { accountId: n, number: u.accountNumber || "", methodId: c });
    }).catch((d) => {
      throw d;
    }), { ok: !0 };
  });
  ra.paymentAccountHistory = Qn({ region: Za }, async (e) => {
    _e.requireRole(e, ["super", "finance"]);
    let t = _e.str((e.data || {}).accountId, { max: 120, label: "Account" }), a = await Me.doc(`paymentAccounts/${t}`).get();
    if (!a.exists) throw new Zn("not-found", "Account not found.");
    let [n, s, o] = await Promise.all([
      Me.collection("paymentCycles").where("accountId", "==", t).get(),
      Me.collection("deposits").where("accountId", "==", t).limit(200).get(),
      Me.collection("paymentRotationLogs").where("methodId", "==", a.data().methodId).limit(200).get()
    ]), r = (i) => JSON.parse(JSON.stringify(i));
    return {
      cycles: n.docs.map((i) => r(i.data())).sort((i, c) => c.cycleNo - i.cycleNo),
      deposits: s.docs.map((i) => ({ id: i.id, amount: i.data().amount, status: i.data().status, trxId: i.data().trxId, username: i.data().username, at: yr(i.data().createdAt) })).sort((i, c) => c.at - i.at).slice(0, 100),
      logs: o.docs.map((i) => r(i.data())).filter((i) => i.oldAccountId === t || i.newAccountId === t).sort((i, c) => c.at - i.at).slice(0, 50)
    };
  });
});

// src/payout.js
var kr = D(($e) => {
  "use strict";
  var { onCall: Pe } = X(), C = H(), es = In(), ia = Yt().helpers, { db: V, FieldValue: ce, HttpsError: le, REGION: Oe } = C, J = es.n0, be = (e) => V.doc(`payoutAgents/${e}`), qt = ["super", "finance"], Lt = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0;
  async function ts(e) {
    let t = C.requireRole(e, ["payout"]), a = await be(t).get();
    if (!a.exists || a.data().active === !1) throw new le("permission-denied", "Your payout access is turned off.");
    return t;
  }
  var md = (e, t) => ({
    id: e,
    methodId: t.methodId,
    methodName: t.methodName,
    accountNumber: t.accountNumber,
    holderName: t.holderName || "",
    bankName: t.bankName || "",
    branch: t.branch || "",
    amount: t.net,
    stage: t.stage,
    createdAt: Lt(t.createdAt),
    assignedAt: Lt(t.assignedAt),
    reviewNote: t.reviewNote || "",
    paidAt: Lt(t.paidAt),
    payTrxId: t.payTrxId || "",
    hasProof: !!t.proofKey,
    status: t.status
  });
  $e.payoutMyTasks = Pe({ region: Oe }, async (e) => {
    let t = await ts(e), n = (await V.collection("withdrawals").where("assignedTo", "==", t).limit(300).get()).docs.map((r) => md(r.id, r.data())), s = (await be(t).get()).data() || {}, o = es.startOfDhakaDay().getTime();
    return {
      open: n.filter((r) => r.status === "pending" && r.stage === "assigned").sort((r, i) => r.assignedAt - i.assignedAt),
      review: n.filter((r) => r.status === "pending" && r.stage === "paid_review").sort((r, i) => i.paidAt - r.paidAt),
      done: n.filter((r) => r.status === "approved").sort((r, i) => i.paidAt - r.paidAt).slice(0, 50),
      today: n.filter((r) => r.status === "approved" && r.paidAt >= o).reduce((r, i) => ({ count: r.count + 1, total: C.round2(r.total + J(i.amount)) }), { count: 0, total: 0 }),
      me: { name: s.name || "", methods: s.methods || [], ...en(s) },
      storage: ia.configured()
    };
  });
  function en(e) {
    let t = J(e.floatGiven), a = J(e.floatReturned), n = J(e.paidTotal), s = J(e.reviewTotal);
    return { floatGiven: t, floatReturned: a, paidTotal: n, paidCount: J(e.paidCount), reviewTotal: s, reviewCount: J(e.reviewCount), remaining: C.round2(t - a - n - s), openCount: Math.max(0, J(e.openCount)) };
  }
  $e.payoutMarkPaid = Pe({ region: Oe }, async (e) => {
    let t = await ts(e), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = C.str(a.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), o = typeof a.fromNumber == "string" ? a.fromNumber.replace(/[^0-9+]/g, "").slice(0, 20) : "", r = typeof a.proofKey == "string" ? a.proofKey.trim() : "";
    if (ia.configured()) {
      if (!r) throw C.bad("Please upload the payment screenshot.");
      if (!ia.safeKey(r) || !r.startsWith(`payouts/${n}/${t}-`)) throw C.bad("Invalid screenshot.");
      await ia.verifyImage(r);
    }
    return await V.runTransaction(async (i) => {
      let c = V.doc(`withdrawals/${n}`), d = await i.get(c), l = d.exists ? d.data() : null;
      if (!l || l.assignedTo !== t) throw new le("permission-denied", "This task is not assigned to you.");
      if (l.status !== "pending" || l.stage !== "assigned") throw new le("failed-precondition", "This task is not waiting for payment.");
      i.update(c, { stage: "paid_review", paidBy: t, paidAt: Date.now(), payTrxId: s, fromNumber: o, proofKey: r, reviewNote: "" }), i.update(be(t), { reviewTotal: ce.increment(J(l.net)), reviewCount: ce.increment(1), openCount: ce.increment(-1), lastPaidAt: Date.now() }), C.audit(i, t, "payout_paid", { withdrawalId: n, net: l.net, trx: s });
    }), { ok: !0 };
  });
  $e.payoutReturn = Pe({ region: Oe }, async (e) => {
    let t = await ts(e), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = C.str(a.reason, { min: 3, max: 200, label: "Reason" });
    return await V.runTransaction(async (o) => {
      let r = V.doc(`withdrawals/${n}`), i = await o.get(r), c = i.exists ? i.data() : null;
      if (!c || c.assignedTo !== t) throw new le("permission-denied", "This task is not assigned to you.");
      if (c.status !== "pending" || c.stage !== "assigned") throw new le("failed-precondition", "You can only return a task you have not paid yet.");
      o.update(r, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null, returnReason: s, returnedBy: t, returnedAt: Date.now() }), o.update(be(t), { openCount: ce.increment(-1), returnedCount: ce.increment(1) }), C.audit(o, t, "payout_returned", { withdrawalId: n, reason: s });
    }), { ok: !0 };
  });
  async function Tr(e, t, a) {
    await V.runTransaction(async (n) => {
      let s = V.doc(`withdrawals/${e}`), [o, r] = await Promise.all([n.get(s), n.get(be(t))]), i = o.exists ? o.data() : null;
      if (!r.exists || r.data().active === !1) throw new le("failed-precondition", "That agent is not active.");
      if (!i || i.status !== "pending") throw new le("failed-precondition", "This request is no longer pending.");
      if (i.stage === "paid_review") throw new le("failed-precondition", "Already paid \u2014 waiting for review.");
      i.assignedTo !== t && (i.assignedTo && n.update(be(i.assignedTo), { openCount: ce.increment(-1) }), n.update(s, { stage: "assigned", assignedTo: t, assignedName: r.data().name || "", assignedAt: Date.now(), assignedBy: a }), n.update(be(t), { openCount: ce.increment(1) }), C.notify(n, t, "New payout task", `Send ${i.net} by ${i.methodName}.`, "payout"));
    });
  }
  $e.payoutAssign = Pe({ region: Oe }, async (e) => {
    let t = C.requireRole(e, qt), a = e.data || {}, n = Array.isArray(a.withdrawalIds) ? a.withdrawalIds.slice(0, 100).map((r) => C.str(r, { max: 80 })) : [];
    if (!n.length) throw C.bad("Pick at least one request.");
    let s = C.str(a.agentUid, { max: 80, label: "Agent" }), o = { ok: 0, failed: [] };
    for (let r of n)
      try {
        await Tr(r, s, t), o.ok++;
      } catch (i) {
        o.failed.push({ id: r, error: i.message });
      }
    return C.audit(null, t, "payout_assign", { agentUid: s, count: o.ok }), o;
  });
  $e.payoutAutoAssign = Pe({ region: Oe }, async (e) => {
    let t = C.requireRole(e, qt), a = e.data || {}, n = a.mode === "method" ? "method" : "equal", s = Array.isArray(a.agentUids) && a.agentUids.length ? new Set(a.agentUids.map(String)) : null, o = (await V.collection("payoutAgents").where("active", "==", !0).get()).docs.map((c) => ({ uid: c.id, methods: c.data().methods || [], load: Math.max(0, J(c.data().openCount)) })).filter((c) => !s || s.has(c.uid));
    if (!o.length) throw new le("failed-precondition", "No active payout agents.");
    let r = (await V.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.filter((c) => !c.data().assignedTo && c.data().stage !== "paid_review").sort((c, d) => Lt(c.data().createdAt) - Lt(d.data().createdAt)), i = { ok: 0, skipped: 0, failed: [] };
    for (let c of r) {
      let d = n === "method" ? o.filter((u) => !u.methods.length || u.methods.includes(c.data().methodId)) : o;
      if (!d.length) {
        i.skipped++;
        continue;
      }
      let l = d.reduce((u, m) => m.load < u.load ? m : u, d[0]);
      try {
        await Tr(c.id, l.uid, t), l.load++, i.ok++;
      } catch (u) {
        i.failed.push({ id: c.id, error: u.message });
      }
    }
    return C.audit(null, t, "payout_auto_assign", { mode: n, count: i.ok }), i;
  });
  $e.payoutUnassign = Pe({ region: Oe }, async (e) => {
    let t = C.requireRole(e, qt), a = C.str((e.data || {}).withdrawalId, { max: 80 });
    return await V.runTransaction(async (n) => {
      let s = V.doc(`withdrawals/${a}`), o = await n.get(s), r = o.exists ? o.data() : null;
      if (!r || r.status !== "pending" || !r.assignedTo) throw new le("failed-precondition", "Nothing to unassign.");
      if (r.stage === "paid_review") throw new le("failed-precondition", "Already paid \u2014 review it instead.");
      n.update(s, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null }), n.update(be(r.assignedTo), { openCount: ce.increment(-1) }), C.audit(n, t, "payout_unassign", { withdrawalId: a });
    }), { ok: !0 };
  });
  $e.payoutReview = Pe({ region: Oe }, async (e) => {
    let t = C.requireRole(e, qt), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = a.action;
    if (!["approve", "send_back"].includes(s)) throw C.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "";
    if (s === "send_back" && o.length < 3) throw C.bad("Write why it is sent back.");
    return await V.runTransaction(async (r) => {
      let i = V.doc(`withdrawals/${n}`), c = await r.get(i), d = c.exists ? c.data() : null;
      if (!d || d.status !== "pending" || d.stage !== "paid_review") throw new le("failed-precondition", "This payment is not waiting for review.");
      if (d.paidBy === t) throw new le("permission-denied", "You cannot approve a payment you made yourself.");
      let l = J(d.net);
      s === "approve" ? (es.finalize(r, i, d, !0, t, o, { approvedBy: t }), r.update(be(d.paidBy), { reviewTotal: ce.increment(-l), reviewCount: ce.increment(-1), paidTotal: ce.increment(l), paidCount: ce.increment(1) })) : (r.update(i, { stage: "assigned", reviewNote: o, sentBackAt: Date.now(), sentBackBy: t }), r.update(be(d.paidBy), { reviewTotal: ce.increment(-l), reviewCount: ce.increment(-1), openCount: ce.increment(1) }), C.notify(r, d.paidBy, "Payout sent back", o, "payout")), C.audit(r, t, s === "approve" ? "payout_approved" : "payout_sent_back", { withdrawalId: n, net: l, agent: d.paidBy });
    }), { ok: !0 };
  });
  $e.payoutAgents = Pe({ region: Oe }, async (e) => {
    C.requireRole(e, qt);
    let t = await V.collection("payoutAgents").limit(50).get(), a = (await V.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.map((o) => ({ id: o.id, ...o.data() })), n = t.docs.map((o) => {
      let r = o.data(), i = a.filter((c) => c.assignedTo === o.id);
      return {
        uid: o.id,
        name: r.name || "",
        email: r.email || "",
        active: r.active !== !1,
        methods: r.methods || [],
        ...en(r),
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
      createdAt: Lt(o.createdAt),
      paidBy: o.paidBy || "",
      paidAt: J(o.paidAt),
      payTrxId: o.payTrxId || "",
      fromNumber: o.fromNumber || "",
      proofKey: o.proofKey || "",
      returnReason: o.returnReason || "",
      reviewNote: o.reviewNote || ""
    })).sort((o, r) => o.createdAt - r.createdAt);
    return { agents: n, queue: s, storage: ia.configured() };
  });
  $e.payoutAgentSave = Pe({ region: Oe }, async (e) => {
    let t = C.requireRole(e, ["super"]), a = e.data || {}, n = C.str(a.agentUid, { max: 80 }), s = be(n);
    if (!(await s.get()).exists) throw new le("not-found", "Agent not found.");
    let r = {};
    return typeof a.active == "boolean" && (r.active = a.active), Array.isArray(a.methods) && (r.methods = a.methods.slice(0, 20).map((i) => C.str(i, { max: 80 }))), await s.update(r), C.audit(null, t, "payout_agent_save", { uid: n, ...r }), { ok: !0 };
  });
  $e.payoutFloat = Pe({ region: Oe }, async (e) => {
    let t = C.requireRole(e, ["super"]), a = e.data || {}, n = C.str(a.agentUid, { max: 80 }), s = C.amountOf(a.amount, { max: 1e8 }), o = a.direction === "take" ? "take" : "give", r = typeof a.note == "string" ? a.note.trim().slice(0, 200) : "";
    return await V.runTransaction(async (i) => {
      let c = await i.get(be(n));
      if (!c.exists) throw new le("not-found", "Agent not found.");
      if (o === "take" && s > en(c.data()).remaining + 1e-9) throw C.bad("Cannot take back more than the agent has left.");
      i.update(be(n), o === "give" ? { floatGiven: ce.increment(s) } : { floatReturned: ce.increment(s) }), i.set(V.collection("payoutFloat").doc(), { agentUid: n, amount: s, direction: o, note: r, by: t, at: Date.now() }), C.audit(i, t, "payout_float", { uid: n, amount: s, dir: o });
    }), { ok: !0 };
  });
  $e.payoutReport = Pe({ region: Oe }, async (e) => {
    C.requireRole(e, qt);
    let t = e.data || {}, a = C.str(t.agentUid, { max: 80 }), n = J(t.from), s = J(t.to) || Date.now() + 864e5, o = await be(a).get();
    if (!o.exists) throw new le("not-found", "Agent not found.");
    let r = (await V.collection("withdrawals").where("paidBy", "==", a).limit(1e3).get()).docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => J(d.paidAt) >= n && J(d.paidAt) <= s).map((d) => ({ id: d.id, methodName: d.methodName, accountNumber: d.accountNumber, net: d.net, status: d.status, stage: d.stage, payTrxId: d.payTrxId || "", fromNumber: d.fromNumber || "", proofKey: d.proofKey || "", paidAt: J(d.paidAt), approvedBy: d.approvedBy || d.reviewedBy || "" })).sort((d, l) => l.paidAt - d.paidAt), i = (await V.collection("payoutFloat").where("agentUid", "==", a).limit(300).get()).docs.map((d) => d.data()).sort((d, l) => l.at - d.at), c = {};
    for (let d of r.filter((l) => l.status === "approved")) {
      let l = d.accountNumber;
      c[l] = c[l] || { accountNumber: l, methodName: d.methodName, count: 0, total: 0 }, c[l].count++, c[l].total = C.round2(c[l].total + J(d.net));
    }
    return { agent: { uid: a, name: o.data().name || "", ...en(o.data()) }, rows: r, float: i, byNumber: Object.values(c).sort((d, l) => l.total - d.total) };
  });
});

// src/community.js
var $r = D((xt) => {
  "use strict";
  var { onCall: ua } = X(), Y = H(), { db: ee, FieldValue: vr, HttpsError: as, REGION: la } = Y, _r = 24 * 36e5, pd = 6 * 36e5, Sr = (e) => new Date(e + pd).toISOString().slice(0, 10), da = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0, K = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, fd = ["super", "finance", "support"];
  async function Cr() {
    let e = await ee.doc("settings/content").get();
    return e.exists ? e.data() : {};
  }
  var hd = (e) => (Array.isArray(e) ? e : []).slice(0, 7).map((t) => Math.max(0, Math.min(1e5, Math.round(K(t)))));
  function Ir(e, t, a) {
    let n = hd(e && e.rewards), s = !!(e && e.enabled) && n.some((u) => u > 0), o = Sr(a), r = Sr(a - _r), i = t ? K(t.streak) : 0, c = t ? t.lastDay : "", d = c === o;
    !d && c !== r && (i = 0);
    let l = i % 7;
    return { enabled: s, rewards: n, streak: i, claimedToday: d, today: o, nextIndex: l, lastDay: c || "" };
  }
  xt.checkinStatus = ua({ region: la }, async (e) => {
    let t = Y.authUid(e), [a, n] = await Promise.all([Cr(), ee.doc(`bonusClaims/${t}_checkin`).get()]), s = Ir(a.checkin, n.exists ? n.data() : null, Date.now());
    return { enabled: s.enabled, rewards: s.rewards, streak: s.streak, claimedToday: s.claimedToday, nextIndex: s.nextIndex };
  });
  xt.claimCheckin = ua({ region: la }, async (e) => {
    await Mt().requireFeature("checkin");
    let t = Y.requireVerified(e), a = 0, n = 0, s = 0;
    return await ee.runTransaction(async (o) => {
      let [r, i, c] = await Promise.all([o.get(ee.doc("settings/content")), o.get(ee.doc(`users/${t}`)), o.get(ee.doc(`bonusClaims/${t}_checkin`))]);
      Y.assertActive(i.data());
      let d = Date.now(), l = Ir((r.exists ? r.data() : {}).checkin, c.exists ? c.data() : null, d);
      if (!l.enabled) throw new as("failed-precondition", "Daily check-in is not available right now.");
      if (l.claimedToday) throw new as("failed-precondition", "You already checked in today. Come back tomorrow.");
      n = l.nextIndex, s = l.streak + 1, a = Y.round2(l.rewards[n] || 0), a > 0 && (Y.applyDelta(o, i.ref, { main: a }), Y.ledger(o, { uid: t, type: "bonus", direction: "in", amount: a, bucket: "main", note: `Daily check-in \xB7 day ${n + 1}`, ref: "checkin" }), Y.bumpStats(o, { bonusPaid: a })), o.set(c.ref, { uid: t, bonusId: "checkin", lastDay: l.today, streak: s, best: Math.max(s, K(c.exists ? c.data().best : 0)), lastClaimAt: vr.serverTimestamp(), lastClaimMs: d, lastAmount: a, count: vr.increment(1) }, { merge: !0 });
    }), { ok: !0, amount: a, day: n, streak: s };
  });
  var gd = (e) => {
    let t = String(e || "").trim();
    return t ? t.slice(0, Math.min(2, t.length)) + "***" : "Player";
  }, ca = { at: 0, data: null };
  xt.publicBoard = ua({ region: la }, async (e) => {
    Y.authUid(e);
    let t = (await Cr()).board || {};
    if (!t.enabled) return { enabled: !1, weekly: [], latest: [] };
    if (ca.data && Date.now() - ca.at < 6e4 && ca.min === K(t.minShow)) return ca.data;
    let a = Math.max(0, K(t.minShow)), n = Date.now() - 7 * _r, o = (await ee.collection("transactions").where("type", "in", ["win", "game_win"]).where("createdAt", ">=", n).orderBy("createdAt", "desc").limit(4e3).get()).docs.map((m) => m.data()).filter((m) => K(m.amount) >= a && K(m.amount) > 0), r = /* @__PURE__ */ new Map();
    for (let m of o) {
      let p = r.get(m.uid);
      (!p || K(m.amount) > p.amount) && r.set(m.uid, { uid: m.uid, amount: K(m.amount), game: m.note || "" });
    }
    let i = [...r.values()].sort((m, p) => p.amount - m.amount).slice(0, 10), c = o.slice(0, 20), d = [.../* @__PURE__ */ new Set([...i.map((m) => m.uid), ...c.map((m) => m.uid)])], l = /* @__PURE__ */ new Map();
    await Promise.all(d.map(async (m) => {
      let p = await ee.doc(`users/${m}`).get(), f = p.exists ? p.data() : {};
      l.set(m, gd(f.username || f.name));
    }));
    let u = {
      enabled: !0,
      weekly: i.map((m) => ({ name: l.get(m.uid), amount: m.amount, game: m.game })),
      latest: c.map((m) => ({ name: l.get(m.uid), amount: K(m.amount), game: m.note || "", at: da(m.createdAt) }))
    };
    return ca = { at: Date.now(), data: u, min: K(t.minShow) }, u;
  });
  var Fe = ["main", "winning", "referral", "commission"];
  xt.adminReconcile = ua({ region: la, timeoutSeconds: 120 }, async (e) => {
    Y.requireRole(e, ["super", "finance"]);
    let t = 6e4, [a, n] = await Promise.all([ee.collection("users").limit(2e4).get(), ee.collection("transactions").orderBy("createdAt", "desc").limit(t).get()]), s = /* @__PURE__ */ new Map();
    for (let d of n.docs) {
      let l = d.data();
      if (!l.uid) continue;
      let u = K(l.amount) * (l.direction === "out" ? -1 : 1), m = Fe.includes(l.bucket) ? l.bucket : "main", p = s.get(l.uid) || { main: 0, winning: 0, referral: 0, commission: 0 };
      p[m] += u, s.set(l.uid, p);
    }
    let o = n.docs.length >= t, r = { main: 0, winning: 0, referral: 0, commission: 0 }, i = [];
    for (let d of a.docs) {
      let l = d.data(), u = l.balances || {};
      for (let w of Fe) r[w] += K(u[w]);
      let m = s.get(d.id) || { main: 0, winning: 0, referral: 0, commission: 0 }, p = {}, f = !1;
      for (let w of Fe)
        p[w] = Y.round2(K(u[w]) - m[w]), Math.abs(p[w]) >= 0.01 && (f = !0);
      f && i.push({ uid: d.id, name: l.username || l.name || l.email || d.id, balances: Fe.reduce((w, y) => ({ ...w, [y]: Y.round2(K(u[y])) }), {}), ledger: Fe.reduce((w, y) => ({ ...w, [y]: Y.round2(m[y]) }), {}), diff: p });
    }
    i.sort((d, l) => Math.max(...Fe.map((u) => Math.abs(l.diff[u]))) - Math.max(...Fe.map((u) => Math.abs(d.diff[u]))));
    let c = (await ee.doc("stats/global").get()).data() || {};
    return {
      at: Date.now(),
      users: a.size,
      ledgerRows: n.size,
      partial: o,
      totals: Fe.reduce((d, l) => ({ ...d, [l]: Y.round2(r[l]) }), {}),
      allBalances: Y.round2(Fe.reduce((d, l) => d + r[l], 0)),
      deposits: K(c.totalDeposits),
      withdrawals: K(c.totalWithdrawals),
      bonusPaid: K(c.bonusPaid),
      mismatched: i.length,
      diffs: i.slice(0, 50)
    };
  });
  xt.adminUserOverview = ua({ region: la }, async (e) => {
    Y.requireRole(e, fd);
    let t = Y.str((e.data || {}).uid, { max: 128, label: "User" }), a = await ee.doc(`users/${t}`).get();
    if (!a.exists) throw new as("not-found", "User not found.");
    let n = a.data(), [s, o, r, i, c, d] = await Promise.all([
      ee.collection("transactions").where("uid", "==", t).orderBy("createdAt", "desc").limit(25).get(),
      ee.collection("deposits").where("uid", "==", t).orderBy("createdAt", "desc").limit(200).get(),
      ee.collection("withdrawals").where("uid", "==", t).orderBy("createdAt", "desc").limit(200).get(),
      ee.collection("loginHistory").where("uid", "==", t).orderBy("at", "desc").limit(10).get(),
      ee.collection("referrals").where("referrerUid", "==", t).limit(500).get(),
      ee.doc(`bonusClaims/${t}_checkin`).get()
    ]), l = (p, f) => p.filter((w) => f(w.data())).reduce((w, y) => w + K(y.data().amount), 0), u = o.docs, m = r.docs;
    return {
      user: { uid: t, name: n.name || "", username: n.username || "", email: n.email || "", phone: n.phone || "", status: n.status || "active", role: n.role || "user", createdAt: da(n.createdAt), lastLoginAt: da(n.lastLoginAt), referredBy: n.referredBy || "" },
      balances: Fe.reduce((p, f) => ({ ...p, [f]: Y.round2(K((n.balances || {})[f])) }), {}),
      totals: {
        deposited: Y.round2(l(u, (p) => p.status === "approved")),
        depositCount: u.filter((p) => p.data().status === "approved").length,
        withdrawn: Y.round2(l(m, (p) => p.status === "approved" || p.status === "paid")),
        withdrawCount: m.filter((p) => ["approved", "paid"].includes(p.data().status)).length,
        pendingDeposits: u.filter((p) => p.data().status === "pending").length,
        pendingWithdraws: m.filter((p) => p.data().status === "pending").length,
        referrals: c.size,
        checkinStreak: d.exists ? K(d.data().streak) : 0
      },
      ledger: s.docs.map((p) => {
        let f = p.data();
        return { type: f.type, direction: f.direction, amount: K(f.amount), bucket: f.bucket, note: f.note || "", at: da(f.createdAt) };
      }),
      logins: i.docs.map((p) => {
        let f = p.data();
        return { at: da(f.at), ok: f.success !== !1, device: f.device || f.ua || "", ip: f.ip || "" };
      })
    };
  });
});

// src/growth.js
var Gr = D((te) => {
  "use strict";
  var { onCall: Ae } = X(), { onSchedule: wd } = Qt(), v = H(), yd = Da(), { db: N, FieldValue: Nr, HttpsError: Ue, REGION: he } = v, j = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, jt = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0, ss = (e) => (e = String(e || ""), e ? e.slice(0, 2) + "***" : "***"), Tt = () => globalThis.__ENV || process.env;
  async function Dr() {
    let e = await N.doc("settings/content").get();
    return e.exists ? e.data() : {};
  }
  function Mr(e) {
    let t = e && e.refMs || {}, a = (Array.isArray(t.steps) ? t.steps : []).map((s) => ({ count: Math.round(j(s && s.count)), reward: v.round2(j(s && s.reward)) })).filter((s) => s.count >= 1 && s.count <= 1e5 && s.reward > 0 && s.reward <= 1e6).sort((s, o) => s.count - o.count).slice(0, 20), n = a.filter((s, o) => o === 0 || s.count !== a[o - 1].count);
    return { enabled: !!t.enabled && n.length > 0, minDeposit: Math.max(0, j(t.minDeposit)), bucket: t.bucket === "main" ? "main" : "referral", steps: n };
  }
  async function Pr(e) {
    let a = (await N.collection("users").where("referredBy", "==", e).limit(3e3).get()).docs.map((n) => ({ uid: n.id, username: n.data().username || "", at: jt(n.data().createdAt), deposited: 0 }));
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
  var Or = (e, t) => e.filter((a) => t.minDeposit > 0 ? a.deposited >= t.minDeposit : a.deposited > 0 || t.minDeposit === 0).length;
  te.refProgress = Ae({ region: he }, async (e) => {
    let t = v.authUid(e), a = Mr(await Dr()), n = await Pr(t), s = Or(n, a), o = await N.doc(`bonusClaims/${t}_refms`).get(), r = o.exists && Array.isArray(o.data().claimed) ? o.data().claimed : [];
    return {
      enabled: a.enabled,
      minDeposit: a.minDeposit,
      steps: a.steps,
      total: n.length,
      active: s,
      claimed: r,
      friends: n.sort((i, c) => c.at - i.at).slice(0, 100).map((i) => ({ name: ss(i.username), at: i.at, active: a.minDeposit > 0 ? i.deposited >= a.minDeposit : !0, deposited: i.deposited > 0 }))
    };
  });
  te.claimRefMilestone = Ae({ region: he }, async (e) => {
    await Mt().requireFeature("refms");
    let t = v.requireVerified(e), a = Math.round(j((e.data || {}).count)), n = Mr(await Dr());
    if (!n.enabled) throw new Ue("failed-precondition", "Invite rewards are off.");
    let s = n.steps.find((r) => r.count === a);
    if (!s) throw v.bad("Unknown reward step.");
    let o = Or(await Pr(t), n);
    if (o < s.count) throw new Ue("failed-precondition", `\u0986\u09B0\u0993 ${s.count - o} \u099C\u09A8 \u09B8\u0995\u09CD\u09B0\u09BF\u09AF\u09BC \u09AC\u09A8\u09CD\u09A7\u09C1 \u09A6\u09B0\u0995\u09BE\u09B0\u0964`);
    return await N.runTransaction(async (r) => {
      let i = N.doc(`bonusClaims/${t}_refms`), c = N.doc(`users/${t}`), [d, l] = await Promise.all([r.get(i), r.get(c)]);
      v.assertActive(l.data());
      let u = d.exists && Array.isArray(d.data().claimed) ? d.data().claimed : [];
      if (u.includes(s.count)) throw new Ue("already-exists", "\u098F\u0987 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u0986\u0997\u09C7\u0987 \u09A8\u09C7\u0993\u09AF\u09BC\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964");
      v.applyDelta(r, c, { [n.bucket]: s.reward }), v.ledger(r, { uid: t, type: "referral", direction: "in", amount: s.reward, bucket: n.bucket, note: `Invite reward \xB7 ${s.count} friends`, ref: "refms" }), v.notify(r, t, "Invite reward \u{1F389}", `${s.count} friends joined. +${s.reward}`, "referral"), r.set(i, { uid: t, kind: "refms", claimed: [...u, s.count], updatedAt: Date.now() }), v.bumpStats(r, { bonusPaid: s.reward });
    }), { ok: !0, reward: s.reward };
  });
  var Er = { mobile: /^01[3-9]\d{8}$/, bank: /^[0-9A-Za-z\- ]{6,30}$/, crypto: /^[0-9A-Za-z]{20,100}$/ };
  te.wdCardList = Ae({ region: he }, async (e) => {
    let t = v.authUid(e), a = await N.doc(`users/${t}/private/wdCards`).get(), n = a.exists && Array.isArray(a.data().list) ? a.data().list : [], s = await Promise.all(n.map((o) => N.doc(`paymentMethods/${o.methodId}`).get()));
    return { cards: n.map((o, r) => ({ ...o, index: r, fee: s[r].exists ? Math.max(0, j(s[r].data().cardChangeFee)) : 0, lock: s[r].exists ? s[r].data().cardLock === !0 : !1 })) };
  });
  te.wdCardChange = Ae({ region: he }, async (e) => {
    let t = v.requireVerified(e), a = e.data || {}, n = Math.round(j(a.index));
    if (n < 0 || n > 5) throw v.bad("Invalid card.");
    let s = v.str(a.methodId, { max: 80, label: "Method" }), o = v.str(a.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }).replace(/\s+/g, " "), r = v.str(a.holderName, { min: 2, max: 60, label: "Name" }), i = typeof a.bankName == "string" ? a.bankName.trim().slice(0, 60) : "", c = typeof a.branch == "string" ? a.branch.trim().slice(0, 60) : "", d = 0;
    return await N.runTransaction(async (l) => {
      let u = N.doc(`users/${t}/private/wdCards`), m = N.doc(`users/${t}`), [p, f, w] = await Promise.all([l.get(u), l.get(m), l.get(N.doc(`paymentMethods/${s}`))]);
      v.assertActive(f.data());
      let y = p.exists && Array.isArray(p.data().list) ? p.data().list.slice() : [], g = y[n];
      if (!g) throw new Ue("not-found", "Card not found.");
      let _ = await l.get(N.doc(`paymentMethods/${g.methodId}`)), k = w.data();
      if (!w.exists || k.enabled !== !0 || !["withdraw", "both"].includes(k.type || "both")) throw v.bad("This method is not available.");
      let h = k.kind || "mobile", T = h === "mobile" ? o.replace(/\s/g, "") : o;
      if (Er[h] && !Er[h].test(T)) throw v.bad(h === "mobile" ? "\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F, 01 \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B6\u09C1\u09B0\u09C1\u0964" : "\u09B8\u09A0\u09BF\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09BF\u09A8\u0964");
      if (h === "bank" && (i.length < 2 || c.length < 2)) throw v.bad("\u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7\u09B0 \u09A8\u09BE\u09AE \u0993 \u09B6\u09BE\u0996\u09BE \u09A6\u09BF\u09A8\u0964");
      if (y.some((A, E) => E !== n && A.methodId === s)) throw v.bad("\u098F\u0987 \u09AE\u09C7\u09A5\u09A1\u09C7 \u0986\u0997\u09C7\u0987 \u0986\u09B0\u09C7\u0995\u099F\u09BE \u0995\u09BE\u09B0\u09CD\u09A1 \u0986\u099B\u09C7\u0964");
      if (g.methodId === s && g.accountNumber === T && (g.holderName || "") === r && (g.bankName || "") === i && (g.branch || "") === c) throw v.bad("\u0995\u09BF\u099B\u09C1 \u09AC\u09A6\u09B2\u09BE\u09AF\u09BC\u09A8\u09BF\u0964");
      if (d = _.exists ? Math.min(1e5, Math.max(0, v.round2(j(_.data().cardChangeFee)))) : 0, d > 0) {
        let A = v.planDebit(f.data().balances, d, ["main", "winning", "referral", "commission"]), E = {};
        for (let [R, I] of Object.entries(A)) E[R] = -I;
        v.applyDelta(l, m, E);
        for (let [R, I] of Object.entries(A)) v.ledger(l, { uid: t, type: "fee", direction: "out", amount: I, bucket: R, note: "Card number change", ref: "wdcard" });
        v.bumpStats(l, { feesCollected: d });
      }
      y[n] = { methodId: s, accountNumber: T, holderName: r, ...i ? { bankName: i, branch: c } : {}, savedAt: g.savedAt || Date.now(), changedAt: Date.now() }, l.set(u, { list: y, updatedAt: Date.now() }), v.notify(l, t, "Card updated", d > 0 ? `Withdraw card changed. Fee ${d}.` : "Withdraw card changed.", "withdraw"), v.audit(l, t, "wd_card_changed", { index: n, from: g.methodId, to: s, fee: d });
    }), { ok: !0, fee: d };
  });
  var ns = /* @__PURE__ */ new Map();
  async function bd(e) {
    let t = ns.get(e);
    if (t && t.at > Date.now() - 15e3) return t.v;
    let n = (await N.collection("lotteryTickets").where("lotteryId", "==", e).limit(3e3).get()).docs.map((i) => i.data()).filter((i) => i.status === "active" || i.status === "won").sort((i, c) => j(i.number) - j(c.number)), s = [...new Set(n.map((i) => i.uid))], o = {};
    for (let i = 0; i < s.length; i += 50)
      (await Promise.all(s.slice(i, i + 50).map((d) => N.doc(`users/${d}`).get()))).forEach((d) => {
        d.exists && (o[d.id] = d.data().username || "");
      });
    let r = { players: s.length, entries: n.slice(0, 600).map((i) => ({ t: i.number, n: ss(o[i.uid]), uid: i.uid })) };
    return ns.set(e, { at: Date.now(), v: r }), r;
  }
  async function Ur(e, t) {
    if (!t || t.autoDraw !== !0 || t.status !== "open" || !jt(t.endsAt) || jt(t.endsAt) > Date.now() || !(j(t.sold) > 0)) return !1;
    try {
      return await yd.drawLottery(e, "auto"), ns.delete(e), !0;
    } catch {
      return !1;
    }
  }
  te.lotteryLive = Ae({ region: he }, async (e) => {
    let t = v.authUid(e), a = v.str((e.data || {}).lotteryId, { max: 80 }), n = await N.doc(`lotteries/${a}`).get();
    if (!n.exists) throw new Ue("not-found", "Lottery not found.");
    await Ur(a, n.data()) && (n = await N.doc(`lotteries/${a}`).get());
    let s = n.data(), o = await bd(a);
    return {
      id: a,
      title: s.title || "",
      prize: j(s.prize),
      price: j(s.price),
      sold: j(s.sold),
      total: j(s.totalTickets),
      status: s.status,
      endsAt: jt(s.endsAt),
      now: Date.now(),
      autoDraw: s.autoDraw === !0,
      seedHash: s.seedHash || "",
      drawSeed: s.status === "drawn" && s.drawSeed || "",
      drawCount: j(s.drawCount),
      winnerTicket: s.winnerTicket || null,
      winnerName: s.status === "drawn" ? ss(s.winnerName) : "",
      winnerIsMe: s.status === "drawn" && s.winnerUid === t,
      players: o.players,
      mine: o.entries.filter((r) => r.uid === t).map((r) => r.t),
      entries: o.entries.map((r) => ({ t: r.t, n: r.n }))
    };
  });
  async function Br() {
    let e = await N.collection("lotteries").where("status", "==", "open").limit(100).get(), t = 0;
    for (let a of e.docs) await Ur(a.id, a.data()) && t++;
    return t;
  }
  te.lotteryTick = wd({ region: he, schedule: "every 1 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 120 }, async () => {
    await Br();
  });
  te.lotteryAutoCheck = Ae({ region: he }, async (e) => (v.authUid(e), { drawn: await Br() }));
  var Ad = ["deposit", "withdraw", "account", "game", "other"], Td = { deposit: "\u09A1\u09BF\u09AA\u09CB\u099C\u09BF\u099F", withdraw: "\u0989\u0987\u09A5\u09A1\u09CD\u09B0", account: "\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F", game: "\u0997\u09C7\u09AE", other: "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF" }, Lr = { fetch: (...e) => fetch(...e) };
  async function Gt(e, t) {
    let a = Tt().TELEGRAM_BOT_TOKEN;
    if (!a) return null;
    try {
      return await (await Lr.fetch(`https://api.telegram.org/bot${a}/${e}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(t) })).json();
    } catch {
      return null;
    }
  }
  async function os(e, t, a, n = {}) {
    let s = N.doc(`supportThreads/${e}`), o = Date.now();
    await N.collection(`supportThreads/${e}/msgs`).doc().set({ from: t, text: a, at: o, ...n });
    let r = { lastAt: o, lastText: a.slice(0, 120), lastFrom: t };
    t === "user" ? (r.unreadStaff = Nr.increment(1), r.status = "open") : (r.unreadUser = Nr.increment(1), r.unreadStaff = 0), await s.set(r, { merge: !0 });
  }
  te.supportSend = Ae({ region: he }, async (e) => {
    await Mt().requireFeature("chat");
    let t = v.authUid(e), a = e.data || {}, n = v.str(a.text, { min: 1, max: 1e3, label: "Message" }), s = Ad.includes(a.topic) ? a.topic : "other", o = (await N.doc(`users/${t}`).get()).data() || {}, r = N.doc(`supportThreads/${t}`), i = await r.get(), c = i.exists ? i.data() : {}, d = Math.floor(Date.now() / 36e5), l = c.rateHour === d ? j(c.rateCount) : 0;
    if (l >= 30) throw new Ue("resource-exhausted", "\u0985\u09A8\u09C7\u0995 \u09AE\u09C7\u09B8\u09C7\u099C \u09AA\u09BE\u09A0\u09BF\u09AF\u09BC\u09C7\u099B\u09C7\u09A8, \u098F\u0995\u099F\u09C1 \u09AA\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u09B2\u09BF\u0996\u09C1\u09A8\u0964");
    i.exists || await r.set({ uid: t, username: o.username || "", createdAt: Date.now(), unreadUser: 0, unreadStaff: 0 }), await r.set({ rateHour: d, rateCount: l + 1, topic: s, username: o.username || "" }, { merge: !0 }), await os(t, "user", n, { topic: s });
    let u = Tt().TELEGRAM_CHAT_ID;
    if (u) {
      let m = await Gt("sendMessage", { chat_id: u, text: `\u{1F198} ${o.username || "player"} \xB7 ${Td[s]}

${n}

#U${t.slice(0, 8)} \u2014 \u098F\u0987 \u09AE\u09C7\u09B8\u09C7\u099C\u09C7 Reply \u09A6\u09BF\u09B2\u09C7 \u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0 \u09B8\u09BE\u0987\u099F\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09AA\u09BE\u09AC\u09C7` });
      m && m.ok && m.result && await N.doc(`tgMap/${m.result.message_id}`).set({ uid: t, at: Date.now() });
    }
    return { ok: !0 };
  });
  te.supportMine = Ae({ region: he }, async (e) => {
    let t = v.authUid(e), a = await N.collection(`supportThreads/${t}/msgs`).orderBy("at", "desc").limit(60).get(), n = await N.doc(`supportThreads/${t}`).get();
    return n.exists && j(n.data().unreadUser) && await N.doc(`supportThreads/${t}`).update({ unreadUser: 0 }), { msgs: a.docs.map((s) => {
      let o = s.data();
      return { from: o.from, text: o.text, at: o.at, via: o.via || "" };
    }).reverse() };
  });
  te.adminSupportList = Ae({ region: he }, async (e) => (v.requireRole(e, ["super", "support"]), {
    threads: (await N.collection("supportThreads").orderBy("lastAt", "desc").limit(100).get()).docs.map((a) => {
      let n = a.data();
      return { uid: a.id, username: n.username || "", lastAt: n.lastAt || 0, lastText: n.lastText || "", lastFrom: n.lastFrom || "", unread: j(n.unreadStaff), topic: n.topic || "" };
    }),
    telegram: !!(Tt().TELEGRAM_BOT_TOKEN && Tt().TELEGRAM_CHAT_ID)
  }));
  te.adminSupportThread = Ae({ region: he }, async (e) => {
    v.requireRole(e, ["super", "support"]);
    let t = v.str((e.data || {}).uid, { max: 80 }), a = await N.collection(`supportThreads/${t}/msgs`).orderBy("at", "desc").limit(100).get(), n = await N.doc(`supportThreads/${t}`).get();
    return n.exists && j(n.data().unreadStaff) && await N.doc(`supportThreads/${t}`).update({ unreadStaff: 0 }), { username: n.exists && n.data().username || "", msgs: a.docs.map((s) => {
      let o = s.data();
      return { from: o.from, text: o.text, at: o.at, via: o.via || "" };
    }).reverse() };
  });
  te.adminSupportReply = Ae({ region: he }, async (e) => {
    let t = v.requireRole(e, ["super", "support"]), a = e.data || {}, n = v.str(a.uid, { max: 80 }), s = v.str(a.text, { min: 1, max: 1e3, label: "Message" });
    if (!(await N.doc(`supportThreads/${n}`).get()).exists) throw new Ue("not-found", "Chat not found.");
    return await os(n, "staff", s, { by: t, via: "panel" }), await N.runTransaction(async (o) => {
      v.notify(o, n, "Support replied", s.slice(0, 140), "support");
    }), { ok: !0 };
  });
  te.adminSupportClose = Ae({ region: he }, async (e) => {
    v.requireRole(e, ["super", "support"]);
    let t = v.str((e.data || {}).uid, { max: 80 });
    return await N.doc(`supportThreads/${t}`).set({ status: "closed", unreadStaff: 0 }, { merge: !0 }), { ok: !0 };
  });
  te.adminTelegramSetup = Ae({ region: he }, async (e) => {
    v.requireRole(e, ["super"]);
    let t = Tt();
    if (!t.TELEGRAM_BOT_TOKEN) throw new Ue("failed-precondition", "Supabase Secrets \u098F TELEGRAM_BOT_TOKEN \u09A8\u09C7\u0987\u0964");
    if (!t.TELEGRAM_WEBHOOK_SECRET) throw new Ue("failed-precondition", "Supabase Secrets \u098F TELEGRAM_WEBHOOK_SECRET \u09A8\u09C7\u0987\u0964");
    let a = await Gt("getMe", {});
    if (!a || !a.ok) throw new Ue("failed-precondition", "\u09AC\u099F\u09C7\u09B0 \u099F\u09CB\u0995\u09C7\u09A8 \u0995\u09BE\u099C \u0995\u09B0\u099B\u09C7 \u09A8\u09BE\u0964");
    let n = `${String(t.SUPABASE_URL || "").replace(/\/+$/, "")}/functions/v1/api/tg`, s = await Gt("setWebhook", { url: n, secret_token: t.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ["message"] });
    if (!s || !s.ok) throw new Ue("failed-precondition", "Webhook \u09B8\u09C7\u099F \u09B9\u09AF\u09BC\u09A8\u09BF: " + (s && s.description || "unknown"));
    return t.TELEGRAM_CHAT_ID && await Gt("sendMessage", { chat_id: t.TELEGRAM_CHAT_ID, text: "\u2705 DEEMBD \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u09AC\u099F \u099A\u09BE\u09B2\u09C1 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" }), { ok: !0, bot: a.result.username, chat: !!t.TELEGRAM_CHAT_ID };
  });
  async function qr(e) {
    let t = e && e.message;
    if (!t || typeof t.text != "string") return;
    let a = String(t.chat && t.chat.id), n = t.text.trim();
    if (/^\/(id|start)\b/.test(n)) {
      await Gt("sendMessage", { chat_id: a, text: `\u098F\u0987 \u099A\u09CD\u09AF\u09BE\u099F\u09C7\u09B0 \u0986\u0987\u09A1\u09BF: ${a}
\u098F\u099F\u09BE Supabase Secrets \u098F TELEGRAM_CHAT_ID \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09AC\u09B8\u09BE\u09A8\u0964` });
      return;
    }
    if (!Tt().TELEGRAM_CHAT_ID || a !== String(Tt().TELEGRAM_CHAT_ID)) return;
    let s = t.reply_to_message;
    if (!s) return;
    let o = await N.doc(`tgMap/${s.message_id}`).get();
    if (!o.exists) return;
    let r = o.data().uid, i = t.from && (t.from.first_name || t.from.username) || "Support";
    await os(r, "staff", n.slice(0, 1e3), { via: "telegram", by: `tg:${i}` }), await N.runTransaction(async (c) => {
      v.notify(c, r, "Support replied", n.slice(0, 140), "support");
    }), await Gt("sendMessage", { chat_id: a, text: "\u2713 \u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0\u0995\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09AF\u09BC\u09C7\u099B\u09C7", reply_to_message_id: t.message_id });
  }
  qr.__kind = "hook";
  te.telegramHook = qr;
  te.__net = Lr;
  var ma = null;
  try {
    ma = It();
  } catch {
    ma = null;
  }
  var xr = (e) => jt(e && e.createdAt), kd = () => {
    let e = new Date(Date.now() + 216e5);
    return e.setUTCHours(0, 0, 0, 0), e.getTime() - 6 * 36e5;
  }, Rr = (e, t) => ({
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
    at: xr(t),
    reviewedBy: t.reviewedBy || "",
    shot: t.screenshotPath || "",
    shotStore: t.screenshotStore || "",
    bank: t.bankName ? `${t.bankName}${t.branch ? ", " + t.branch : ""}` : ""
  }), vd = (e, t) => ({
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
    at: xr(t),
    reviewedBy: t.reviewedBy || "",
    shot: t.proofKey || "",
    shotStore: t.proofKey ? "s3" : "",
    bank: t.bankName ? `${t.bankName}${t.branch ? ", " + t.branch : ""}` : ""
  });
  async function Sd(e, t, a, n) {
    let s = "%" + a.replace(/[\\%_]/g, (i) => "\\" + i) + "%", o = t.map((i, c) => `coalesce(data->>'${i}','') ilike $1`).join(" or ");
    return (await ma.sql.unsafe(`select id, data from public.docs where collection = $2 and (${o}) order by coalesce((data->'createdAt'->>'__ts')::bigint, 0) desc limit ${n}`, [s, e])).map((i) => [i.id, i.data]);
  }
  async function _d(e, t, a, n) {
    let s = await N.collection(e).orderBy("createdAt", "desc").limit(5e3).get(), o = a.toLowerCase();
    return s.docs.filter((r) => t.some((i) => String(r.data()[i] || "").toLowerCase().includes(o))).slice(0, n).map((r) => [r.id, r.data()]);
  }
  te.adminTrxSearch = Ae({ region: he, timeoutSeconds: 60 }, async (e) => {
    v.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = ["deposit", "withdraw"].includes(t.kind) ? t.kind : "all", n = ["today", "approved", "pending", "dup"].includes(t.list) ? t.list : "";
    if (n === "dup") {
      let i = await N.collection("auditLogs").where("action", "==", "duplicate_trx_attempt").orderBy("at", "desc").limit(60).get(), c = [...new Set(i.docs.map((l) => l.data().actorUid).filter(Boolean))], d = {};
      return (await Promise.all(c.map((l) => N.doc(`users/${l}`).get()))).forEach((l) => {
        l.exists && (d[l.id] = l.data().username || "");
      }), { results: i.docs.map((l) => {
        let u = l.data(), m = u.detail || {};
        return { kind: "dup", id: l.id, trxId: m.trxId || "", method: m.methodId || "", username: d[u.actorUid] || "", uid: u.actorUid || "", count: j(m.count), at: jt(u.at) };
      }) };
    }
    if (n) {
      let c = (await N.collection("deposits").where("createdAt", ">=", kd()).orderBy("createdAt", "desc").limit(500).get()).docs.map((d) => Rr(d.id, d.data()));
      return n !== "today" && (c = c.filter((d) => d.status === n)), { results: c.slice(0, 200) };
    }
    let s = v.str(t.q, { min: 2, max: 60, label: "Search" }), o = ma && ma.sql ? Sd : _d, r = [];
    return a !== "withdraw" && (await o("deposits", ["trxId", "senderNumber", "username", "accountNumber"], s, 40)).forEach(([i, c]) => r.push(Rr(i, c))), a !== "deposit" && (await o("withdrawals", ["payTrxId", "accountNumber", "username", "fromNumber"], s, 40)).forEach(([i, c]) => r.push(vd(i, c))), r.sort((i, c) => c.at - i.at), { results: r.slice(0, 60) };
  });
});

// src/archive.js
var Vr = D((St) => {
  "use strict";
  var rs = ge("zlib"), { onCall: an } = X(), { onSchedule: Cd } = Qt(), kt = H(), vt = Yt().helpers, { db: Ye, HttpsError: is, REGION: pa } = kt, Ce = null;
  try {
    Ce = It();
  } catch {
    Ce = null;
  }
  var Id = ["bet", "win", "game_bet", "game_win", "game_refund", "game_win_reversal"], tn = 864e5, Fr = 6 * 36e5, fa = (e) => new Date(e + Fr).toISOString().slice(0, 10), Hr = (e) => Date.parse(e + "T00:00:00Z") - Fr, Te = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, jr = (e, t = "createdAt") => {
    let a = e && e[t];
    return a && typeof a == "object" && a.__ts ? a.__ts : typeof a == "number" ? a : 0;
  }, cs = { fetch: (...e) => (kt.storageFetch || globalThis.fetch)(...e) };
  async function Kr() {
    let e = await Ye.doc("settings/archive").get(), t = e.exists ? e.data() : {};
    return { enabled: t.enabled !== !1, afterDays: Math.max(1, Math.min(30, Math.round(Te(t.afterDays) || 1))), keepDays: Math.max(1, Math.min(90, Math.round(Te(t.keepDays) || 7))) };
  }
  async function zr(e, t) {
    let a = await vt.presign("PUT", e, { expires: 300, contentType: "application/gzip" }), n = await cs.fetch(a, { method: "PUT", headers: { "content-type": "application/gzip" }, body: t });
    if (!n.ok) throw new Error("upload failed " + n.status);
    let s = await vt.headObject(e);
    if (!s.exists || s.size && s.size !== t.length) throw new Error("upload not confirmed");
  }
  async function $d(e) {
    let t = await cs.fetch(await vt.presign("GET", e, { expires: 120 }), { method: "GET" });
    if (!t.ok) throw new is("unavailable", "\u0986\u09B0\u09CD\u0995\u09BE\u0987\u09AD \u09AB\u09BE\u0987\u09B2 \u09AA\u09A1\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964");
    let a = await t.arrayBuffer();
    return rs.gunzipSync(Buffer.from(a)).toString("utf8");
  }
  async function Nd(e) {
    let t = {}, a = [...new Set(e)].filter(Boolean);
    for (let n = 0; n < a.length; n += 500)
      (await Ce.sql`select id, data->>'username' as u from public.docs where collection = 'users' and id = any(${a.slice(n, n + 500)})`).forEach((o) => {
        t[o.id] = o.u || "";
      });
    return t;
  }
  async function Wr(e, t) {
    let a = Ye.doc(`archiveDays/${e}`), n = await a.get(), s = n.exists ? n.data() : { day: e, parts: [], rows: 0, ag: 0, bytes: 0 };
    s.parts = [...s.parts || [], t.key], s.rows = Te(s.rows) + Te(t.rows), s.ag = Te(s.ag) + Te(t.ag), s.bytes = Te(s.bytes) + Te(t.bytes), s.updatedAt = Date.now(), await a.set(s);
  }
  async function Ed(e) {
    let t = await Ce.sql`select path, id, data from public.docs where collection = 'transactions' and data->>'type' = any(${Id})
    and coalesce((data->'createdAt'->>'__ts')::bigint, 0) < ${e} order by coalesce((data->'createdAt'->>'__ts')::bigint, 0) limit 20000`;
    if (!t.length) return 0;
    let a = await Nd(t.map((s) => s.data.uid)), n = /* @__PURE__ */ new Map();
    t.forEach((s) => {
      let o = fa(jr(s.data) || e - 1);
      n.has(o) || n.set(o, []), n.get(o).push(s);
    });
    for (let [s, o] of n) {
      let r = o.map((m) => {
        let p = m.data;
        return JSON.stringify({ c: "tx", id: m.id, t: jr(p), uid: p.uid, u: a[p.uid] || "", ty: p.type, d: p.direction, a: Te(p.amount), b: p.bucket || "main", g: p.note || "", r: p.ref || "" });
      }), i = rs.gzipSync(Buffer.from(r.join(`
`) + `
`, "utf8")), c = `archive/rounds/${s}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jsonl.gz`;
      await zr(c, i);
      let d = /* @__PURE__ */ new Map();
      o.forEach((m) => {
        let p = m.data, f = String(p.note || "").replace(/ \(free spin\)$| bet cancelled$| win cancelled$/, ""), w = [p.uid, f, p.bucket || "main", p.direction === "out" ? "out" : "in"].join("|"), y = d.get(w) || { uid: p.uid, g: f, b: p.bucket || "main", d: p.direction === "out" ? "out" : "in", a: 0, n: 0 };
        y.a += Te(p.amount), /bet$/.test(p.type) && (y.n += 1), d.set(w, y);
      });
      let l = Hr(s) + tn - 1e3, u = [...d.values()].filter((m) => m.a > 0).map((m, p) => {
        let f = `gd_${s.replace(/-/g, "")}_${Date.now().toString(36)}_${p}`;
        return { path: `transactions/${f}`, collection: "transactions", id: f, data: {
          uid: m.uid,
          type: "game_day",
          direction: m.d,
          amount: Math.round(m.a * 100) / 100,
          bucket: m.b,
          note: m.g,
          gameCode: m.g,
          rounds: m.n,
          day: s,
          ref: "day:" + s,
          createdAt: { __ts: l }
        } };
      });
      await Ce.sql.begin(async (m) => {
        for (let f = 0; f < u.length; f += 500) {
          let w = u.slice(f, f + 500);
          await m`insert into public.docs (path, collection, id, data) select * from jsonb_to_recordset(${m.json(w)}::jsonb) as x(path text, collection text, id text, data jsonb)`;
        }
        let p = o.map((f) => f.path);
        for (let f = 0; f < p.length; f += 5e3) await m`delete from public.docs where path = any(${p.slice(f, f + 5e3)})`;
      }), await Wr(s, { key: c, rows: o.length, bytes: i.length });
    }
    return t.length;
  }
  async function Rd(e) {
    let t = await Ce.sql`select path, id, data from public.docs where collection = 'agTransactions' and coalesce((data->>'at')::bigint, 0) < ${e} order by coalesce((data->>'at')::bigint, 0) limit 20000`;
    if (!t.length) return 0;
    let a = /* @__PURE__ */ new Map();
    t.forEach((n) => {
      let s = fa(Te(n.data.at) || e - 1);
      a.has(s) || a.set(s, []), a.get(s).push(n);
    });
    for (let [n, s] of a) {
      let o = rs.gzipSync(Buffer.from(s.map((c) => JSON.stringify({ c: "ag", id: c.id, ...c.data })).join(`
`) + `
`, "utf8")), r = `archive/rounds/${n}/${Date.now()}-ag-${Math.random().toString(36).slice(2, 7)}.jsonl.gz`;
      await zr(r, o);
      let i = s.map((c) => c.path);
      for (let c = 0; c < i.length; c += 5e3) await Ce.sql`delete from public.docs where path = any(${i.slice(c, c + 5e3)})`;
      await Wr(n, { key: r, ag: s.length, bytes: o.length });
    }
    return t.length;
  }
  async function Dd(e) {
    let t = fa(Date.now() - e * tn), a = await Ye.collection("archiveDays").get(), n = 0;
    for (let s of a.docs)
      if (!(s.id >= t)) {
        for (let o of s.data().parts || []) await vt.deleteObject(o);
        await Ye.doc(`archiveDays/${s.id}`).delete(), n++;
      }
    return n;
  }
  async function ds(e) {
    let t = Ye.doc("archiveMeta/state");
    if (!vt.configured())
      return await t.set({ lastRun: Date.now(), ok: !1, error: "storage", by: e }, { merge: !0 }), { ok: !1, error: "storage" };
    if (!Ce || !Ce.sql) return { ok: !1, error: "db" };
    let a = await Kr();
    if (e === "auto" && !a.enabled) return { ok: !1, error: "off" };
    let n = Hr(fa(Date.now())), s = n - (a.afterDays - 1) * tn, o = n - Math.max(3, a.afterDays) * tn, r = 0, i = 0, c = 0, d = "", l = Date.now();
    try {
      for (let m = 0; m < 40 && Date.now() - l < 1e5; m++) {
        let p = await Ed(s);
        if (r += p, p < 2e4) break;
      }
      for (let m = 0; m < 20 && Date.now() - l < 12e4; m++) {
        let p = await Rd(o);
        if (i += p, p < 2e4) break;
      }
      c = await Dd(a.keepDays);
    } catch (m) {
      d = String(m && m.message || m).slice(0, 200);
    }
    let u = { ok: !d, rounds: r, ag: i, purged: c, error: d, lastRun: Date.now(), by: e };
    return await t.set(u, { merge: !0 }), u;
  }
  St.archiveTick = Cd({ region: pa, schedule: "0 3 * * *", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    await ds("auto");
  });
  St.adminArchiveRun = an({ region: pa, timeoutSeconds: 300 }, async (e) => {
    let t = kt.requireRole(e, ["super", "finance"]);
    return ds(t);
  });
  St.adminArchiveStatus = an({ region: pa }, async (e) => {
    kt.requireRole(e, ["super", "finance"]);
    let [t, a, n] = await Promise.all([Kr(), Ye.doc("archiveMeta/state").get(), Ye.collection("archiveDays").get()]), s = null;
    if (Ce && Ce.sql)
      try {
        let [o] = await Ce.sql`select pg_database_size(current_database())::bigint as b`, r = await Ce.sql`select collection, count(*)::int as n from public.docs where collection in ('transactions','agTransactions','notifications','auditLogs','loginEvents','deposits','withdrawals','users') group by collection`;
        s = { bytes: Number(o.b), counts: Object.fromEntries(r.map((i) => [i.collection, i.n])) };
      } catch {
        s = null;
      }
    return {
      configured: vt.configured(),
      cfg: t,
      state: a.exists ? a.data() : null,
      db: s,
      days: n.docs.map((o) => ({ day: o.id, rows: Te(o.data().rows), ag: Te(o.data().ag), bytes: Te(o.data().bytes), parts: (o.data().parts || []).length })).sort((o, r) => o.day < r.day ? 1 : -1)
    };
  });
  St.adminArchiveDay = an({ region: pa, timeoutSeconds: 120 }, async (e) => {
    kt.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = String(t.day || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a)) throw kt.bad("Invalid day.");
    let n = await Ye.doc(`archiveDays/${a}`).get();
    if (!n.exists) throw new is("not-found", "\u098F\u0987 \u09A6\u09BF\u09A8\u09C7\u09B0 \u0986\u09B0\u09CD\u0995\u09BE\u0987\u09AD \u09A8\u09C7\u0987\u0964");
    let s = String(t.q || "").trim().toLowerCase().slice(0, 60), o = String(t.game || "").slice(0, 120), r = 3e3, i = [], c = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), l = 0, u = 0, m = 0, p = /* @__PURE__ */ new Set();
    for (let f of n.data().parts || []) {
      if (/-ag-/.test(f)) continue;
      let w = await $d(f);
      for (let y of w.split(`
`)) {
        if (!y) continue;
        let g;
        try {
          g = JSON.parse(y);
        } catch {
          continue;
        }
        if (g.c !== "tx" || (d.set(g.g, (d.get(g.g) || 0) + 1), o && g.g !== o) || s && !(String(g.u).toLowerCase().includes(s) || String(g.uid).toLowerCase().startsWith(s) || String(g.g).toLowerCase().includes(s))) continue;
        l++, p.add(g.uid), g.d === "out" ? u += g.a : m += g.a;
        let _ = g.uid + "|" + g.g, k = c.get(_) || { u: g.u || g.uid.slice(0, 8), uid: g.uid, g: g.g, n: 0, bet: 0, win: 0 };
        /bet$/.test(g.ty) && k.n++, g.d === "out" ? k.bet += g.a : k.win += g.a, c.set(_, k), i.length < r && i.push({ t: g.t, u: g.u, uid: g.uid, g: g.g, ty: g.ty, d: g.d, a: g.a, b: g.b });
      }
    }
    return i.sort((f, w) => f.t - w.t), {
      day: a,
      total: l,
      players: p.size,
      bet: Math.round(u * 100) / 100,
      win: Math.round(m * 100) / 100,
      truncated: l > i.length,
      rows: i,
      groups: [...c.values()].sort((f, w) => w.bet - f.bet).slice(0, 200),
      games: [...d.entries()].sort((f, w) => w[1] - f[1]).slice(0, 60).map(([f, w]) => ({ g: f, n: w }))
    };
  });
  St.adminArchiveDownload = an({ region: pa }, async (e) => {
    kt.requireRole(e, ["super", "finance"]);
    let t = String((e.data || {}).day || ""), a = await Ye.doc(`archiveDays/${t}`).get();
    if (!a.exists) throw new is("not-found", "\u098F\u0987 \u09A6\u09BF\u09A8\u09C7\u09B0 \u0986\u09B0\u09CD\u0995\u09BE\u0987\u09AD \u09A8\u09C7\u0987\u0964");
    return { files: await Promise.all((a.data().parts || []).map(async (n) => ({ name: n.split("/").pop(), url: await vt.presign("GET", n, { expires: 300 }) }))) };
  });
  St.__archive = { runArchive: ds, net: cs, dayKey: fa };
});

// src/index.js
var Yr = D((st) => {
  "use strict";
  Object.assign(
    st,
    Os(),
    Zs(),
    ao(),
    co(),
    yo(),
    Ao(),
    Jn(),
    dr(),
    gr(),
    Ar(),
    kr(),
    Yt(),
    $r(),
    Gr(),
    Vr()
  );
  delete st.ensureUserDoc;
  delete st.LOBBY;
  delete st.forceLogoutOne;
  delete st.helpers;
  delete st.__net;
  delete st.__archive;
});

// supa/handler.js
var Qr = D(($u, Zr) => {
  "use strict";
  var de = It(), { HttpsError: Jr } = X(), Md = {
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
  }, Pd = (e) => String(e).toUpperCase().replace(/-/g, "_"), Od = null, nn = () => Od ||= Yr();
  function Xr(e) {
    return {
      "access-control-allow-origin": de.env.ALLOWED_ORIGIN || "*",
      "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-max-age": "86400",
      vary: "origin",
      ...e
    };
  }
  var Be = (e, t, a) => ({ status: e, headers: Xr({ "content-type": "application/json", "cache-control": "no-store", ...a || {} }), body: JSON.stringify(t) }), Ud = (e) => e instanceof Jr || e && e.name === "HttpsError" ? Be(Md[e.code] || 500, { error: { status: Pd(e.code), code: e.code, message: e.message, details: e.details === void 0 ? null : e.details } }) : (console.error("unhandled", e && e.stack || e), Be(500, { error: { status: "INTERNAL", code: "internal", message: "Something went wrong on the server. Please try again.", details: null } })), sn = de.tokenCache = /* @__PURE__ */ new Map();
  async function Bd(e) {
    if (de.verifyToken) return de.verifyToken(e);
    let t = sn.get(e);
    if (t && t.exp > Date.now()) return t.user;
    let a = String(de.env.SUPABASE_URL || "").replace(/\/$/, "") + "/auth/v1/user", n = await de.fetch(a, { headers: { apikey: de.env.SUPABASE_ANON_KEY || de.env.SUPABASE_SERVICE_ROLE_KEY || "", authorization: "Bearer " + e } });
    if (!n.ok) return null;
    let s = await n.json();
    if (!s || !s.id) return null;
    let o = { uid: s.id, email: s.email || "", confirmed: !!s.email_confirmed_at, app: s.app_metadata || {}, lastSignIn: s.last_sign_in_at };
    return sn.set(e, { user: o, exp: Date.now() + (Number(de.env.TOKEN_CACHE_MS) >= 0 && de.env.TOKEN_CACHE_MS !== void 0 && de.env.TOKEN_CACHE_MS !== "" ? Number(de.env.TOKEN_CACHE_MS) : 3e3) }), sn.size > 500 && sn.clear(), o;
  }
  var Ld = (e) => e && {
    uid: e.uid,
    token: { uid: e.uid, email: e.email, email_verified: e.confirmed || !de.requireVerified(), admin: e.app.admin === !0, role: e.app.role || null, auth_time: e.lastSignIn ? Math.floor(Date.parse(e.lastSignIn) / 1e3) : void 0 }
  }, us = (e) => e == null ? Buffer.alloc(0) : Buffer.from(e), qd = (e) => {
    let t = {};
    for (let [a, n] of Object.entries(e || {})) t[String(a).toLowerCase()] = n;
    return t;
  };
  async function xd(e) {
    let t = qd(e.headers), a = String(e.method || "GET").toUpperCase();
    if (a === "OPTIONS") return { status: 204, headers: Xr(), body: "" };
    let s = new URL(e.url, "http://x").pathname, o = s.indexOf("/api/");
    o >= 0 ? s = s.slice(o + 4) : s.endsWith("/api") && (s = "/"), s = s.replace(/\/+$/, "") || "/";
    try {
      if (s === "/health") return Be(200, { ok: !0, time: Date.now() });
      if (s === "/agw" || s.startsWith("/agw/")) {
        let f = nn().agCallback, w = { status: 200, headers: {}, body: "" }, y = { status(g) {
          return w.status = g, y;
        }, set(g) {
          return Object.assign(w.headers, g), y;
        }, send(g) {
          return w.body = g, y;
        } };
        return await f({ method: a, path: s, url: s, headers: t, rawBody: us(e.body), ip: t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : "" }, y), { status: w.status, headers: { "cache-control": "no-store", ...w.headers }, body: typeof w.body == "string" ? w.body : JSON.stringify(w.body) };
      }
      if (s === "/tg") {
        if (!de.env.TELEGRAM_WEBHOOK_SECRET || t["x-telegram-bot-api-secret-token"] !== de.env.TELEGRAM_WEBHOOK_SECRET) return Be(401, { ok: !1 });
        let f = null;
        try {
          f = JSON.parse(us(e.body).toString("utf8") || "{}");
        } catch {
          f = null;
        }
        try {
          await nn().telegramHook(f);
        } catch {
        }
        return Be(200, { ok: !0 });
      }
      if (s.startsWith("/_cron/")) {
        if (!de.env.CRON_SECRET || t["x-cron-secret"] !== de.env.CRON_SECRET) return Be(401, { error: { code: "unauthenticated", message: "bad secret" } });
        let f = nn()[s.slice(7)];
        return !f || f.__kind !== "schedule" ? Be(404, { error: { code: "not-found", message: "unknown job" } }) : (await f(), Be(200, { ok: !0 }));
      }
      if (a !== "POST") return Be(405, { error: { code: "invalid-argument", message: "POST only" } });
      let r = s.slice(1), i = nn()[r];
      if (!i || i.__kind !== "call") return Be(404, { error: { status: "NOT_FOUND", code: "not-found", message: "Unknown function." } });
      let c = null, d = /^Bearer\s+(.+)$/i.exec(t.authorization || "");
      if (d) {
        let f = await Bd(d[1]).catch(() => null);
        f && (c = Ld(f));
      }
      let l = {}, u = us(e.body).toString("utf8");
      if (u)
        try {
          let f = JSON.parse(u);
          l = f && f.data !== void 0 ? f.data : f;
        } catch {
          throw new Jr("invalid-argument", "Bad JSON.");
        }
      let m = t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : t["cf-connecting-ip"] || "", p = await i({ data: l, auth: c, rawRequest: { headers: t, ip: m } });
      return Be(200, { result: p === void 0 ? null : p });
    } catch (r) {
      return Ud(r);
    }
  }
  Zr.exports = { handle: xd };
});

// supa/entry-deno.mjs
var ei = hs(It(), 1), ti = hs(Qr(), 1);
import Gd from "npm:postgres@3.4.4";
var ai = {};
for (let e of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET", "REQUIRE_VERIFIED", "ALLOWED_ORIGIN", "SITE_URL", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_REGION"]) ai[e] = Deno.env.get(e) || "";
var jd = Deno.env.get("DB_URL") || Deno.env.get("SUPABASE_DB_URL"), Fd = Gd(jd, { max: 4, prepare: !1, idle_timeout: 20, connect_timeout: 10, onnotice() {
} });
ei.default.configure({ sql: Fd, env: ai });
Deno.serve(async (e) => {
  let t = {};
  e.headers.forEach((s, o) => {
    t[o] = s;
  });
  let a = e.method === "GET" || e.method === "HEAD" || e.method === "OPTIONS" ? void 0 : new Uint8Array(await e.arrayBuffer()), n = await (0, ti.handle)({ method: e.method, url: e.url, headers: t, body: a });
  return new Response(n.status === 204 ? null : n.body, { status: n.status, headers: n.headers });
});
