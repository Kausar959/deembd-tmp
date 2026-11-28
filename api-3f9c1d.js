// @ts-nocheck
import { createRequire as __cr } from "node:module";
import { Buffer as __Buf } from "node:buffer";
import __proc from "node:process";
const require = __cr("file:///src/index.ts");
globalThis.Buffer = globalThis.Buffer || __Buf;
globalThis.process = globalThis.process || __proc;
var Nr = Object.create;
var Jn = Object.defineProperty;
var Er = Object.getOwnPropertyDescriptor;
var Rr = Object.getOwnPropertyNames;
var Dr = Object.getPrototypeOf, Mr = Object.prototype.hasOwnProperty;
var ye = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, {
  get: (t, a) => (typeof require < "u" ? require : t)[a]
}) : e)(function(e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var R = (e, t) => () => {
  try {
    return t || e((t = { exports: {} }).exports, t), t.exports;
  } catch (a) {
    throw t = 0, a;
  }
};
var Pr = (e, t, a, n) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let s of Rr(t))
      !Mr.call(e, s) && s !== a && Jn(e, s, { get: () => t[s], enumerable: !(n = Er(t, s)) || n.enumerable });
  return e;
};
var Xn = (e, t, a) => (a = e != null ? Nr(Dr(e)) : {}, Pr(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  t || !e || !e.__esModule ? Jn(a, "default", { value: e, enumerable: !0 }) : a,
  e
));

// src/trace.js
var Va = R((aa) => {
  "use strict";
  var { AsyncLocalStorage: Or } = ye("async_hooks"), Wa = new Or();
  aa.run = (e) => Wa.run({ t0: Date.now(), marks: [] }, e);
  aa.mark = (e) => {
    let t = Wa.getStore();
    t && t.marks.length < 40 && t.marks.push(`${e}@${Date.now() - t.t0}`);
  };
  aa.summary = () => {
    let e = Wa.getStore();
    return e ? e.marks.join(" ") : "";
  };
});

// supa/pgdb.js
var Pt = R((td, es) => {
  "use strict";
  var Ur = ye("crypto"), { mark: tt } = Va(), Br = {
    increment: (e) => ({ __op: "inc", n: e }),
    serverTimestamp: () => ({ __op: "ts" })
  }, Lr = {
    count: () => ({ aggregateType: "count" }),
    sum: (e) => ({ aggregateType: "sum", _field: e })
  }, xr = (e) => Object.defineProperties({ __ts: e }, {
    toMillis: { value: () => e },
    toDate: { value: () => new Date(e) },
    seconds: { value: Math.floor(e / 1e3) },
    nanoseconds: { value: e % 1e3 * 1e6 }
  });
  function na(e) {
    if (Array.isArray(e)) return e.map(na);
    if (e && typeof e == "object") {
      if (typeof e.__ts == "number" && Object.keys(e).length === 1) return xr(e.__ts);
      let t = {};
      for (let [a, n] of Object.entries(e)) t[a] = na(n);
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
  function sa(e, t) {
    if (t && t.__op === "inc") return (Number(e) || 0) + t.n;
    if (t && t.__op === "ts") return { __ts: Date.now() };
    if (Array.isArray(t)) return t.map((a) => sa(void 0, a));
    if (t && typeof t == "object" && typeof t.__ts != "number") {
      let a = {};
      for (let [n, s] of Object.entries(t)) a[n] = sa(void 0, s);
      return a;
    }
    return t;
  }
  function Zn(e, t, a) {
    let n = t.split("."), s = e;
    for (let r = 0; r < n.length - 1; r++)
      (typeof s[n[r]] != "object" || s[n[r]] === null) && (s[n[r]] = {}), s = s[n[r]];
    let o = n[n.length - 1];
    s[o] = sa(s[o], a);
  }
  function at(e, t) {
    for (let [a, n] of Object.entries(t))
      n && typeof n == "object" && !n.__op && !Array.isArray(n) && typeof n.__ts != "number" && e[a] && typeof e[a] == "object" && !Array.isArray(e[a]) && typeof e[a].__ts != "number" ? at(e[a], n) : e[a] = sa(e[a], n);
    return e;
  }
  var za = (e) => {
    let t = e.lastIndexOf("/");
    return { collection: e.slice(0, t), id: e.slice(t + 1) };
  }, bt = class {
    constructor(t, a) {
      this.ref = t, this.id = t.id, this._d = a, this.exists = a !== void 0;
    }
    data() {
      return this._d === void 0 ? void 0 : na(JSON.parse(JSON.stringify(this._d)));
    }
  }, Qn = (e) => {
    let t = new Error("ALREADY_EXISTS " + e);
    return t.code = 6, t;
  }, Gr = (e) => {
    let t = new Error("NOT_FOUND " + e);
    return t.code = 5, t;
  }, Ya = class {
    /** @param sql a `postgres` (porsager) client */
    constructor(t) {
      this.sql = t;
    }
    doc(t) {
      return new At(this, t);
    }
    collection(t) {
      return new oa(this, t);
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
        let u = o.get(d.path);
        if (d.type === "delete") {
          o.set(d.path, void 0);
          continue;
        }
        let l;
        if (d.type === "create") {
          if (u !== void 0) throw Qn(d.path);
          l = at({}, Ue(d.data));
        } else if (d.type === "set") l = d.merge && u ? at(JSON.parse(JSON.stringify(u)), Ue(d.data)) : at({}, Ue(d.data));
        else if (d.type === "update") {
          if (u === void 0) throw Gr(d.path);
          l = JSON.parse(JSON.stringify(u));
          for (let [m, p] of Object.entries(Ue(d.data))) Zn(l, m, p);
        } else throw new Error("bad op " + d.type);
        o.set(d.path, l);
      }
      let r = [], i = [];
      for (let d of n) {
        let u = o.get(d);
        if (u === void 0) {
          s.some((p) => p.path === d) && i.push(d);
          continue;
        }
        let { collection: l, id: m } = za(d);
        r.push({ path: d, collection: l, id: m, data: u });
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
      let { collection: n, id: s } = za(this.path);
      await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${n}, ${s}, ${this.db.sql.json(at({}, Ue(t)))}::jsonb)
                      on conflict (path) do update set data = excluded.data`;
    }
    update(t) {
      return this.db._one({ type: "update", path: this.path, data: t });
    }
    /** create = one `insert … on conflict do nothing` (1 round trip); no row back → ALREADY_EXISTS. */
    async create(t) {
      let { collection: a, id: n } = za(this.path), s = await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${a}, ${n}, ${this.db.sql.json(at({}, Ue(t)))}::jsonb)
                                on conflict (path) do nothing returning path`;
      if (tt("create"), !s.length) throw Qn(this.path);
    }
    delete() {
      return this.db._one({ type: "delete", path: this.path });
    }
    collection(t) {
      return new oa(this.db, `${this.path}/${t}`);
    }
  }, Ja = class e {
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
  }, oa = class extends Ja {
    constructor(t, a) {
      super(t, a);
    }
    doc(t) {
      return new At(this.db, `${this.path}/${t || Ur.randomBytes(10).toString("hex")}`);
    }
    async add(t) {
      let a = this.doc();
      return await a.set(t), a;
    }
  };
  es.exports = { PgDb: Ya, FieldValue: Br, AggregateField: Lr, revive: na, plain: Ue, merge: at, setPath: Zn };
});

// supa/runtime.js
var ra = R((ad, ts) => {
  "use strict";
  var Be = { sql: null, db: null, env: {}, fetch: (...e) => fetch(...e) };
  Be.configure = ({ sql: e, env: t, fetch: a }) => {
    let { PgDb: n } = Pt();
    return Be.sql = e, Be.db = new n(e), Be.env = t || {}, globalThis.__ENV = Be.env, a && (Be.fetch = a), Be;
  };
  Be.requireVerified = () => String(Be.env.REQUIRE_VERIFIED || "0") === "1";
  ts.exports = Be;
});

// supa/shims/functions-https.js
var ne = R((nd, as) => {
  "use strict";
  var Xa = class extends Error {
    constructor(t, a, n) {
      super(a), this.code = t, this.details = n, this.name = "HttpsError";
    }
  }, qr = (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "call", a;
  }, jr = (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "request", a;
  };
  as.exports = { HttpsError: Xa, onCall: qr, onRequest: jr };
});

// supa/shims/functions-v1.js
var os = R((sd, ss) => {
  "use strict";
  var ns = () => {
    let e = () => {
    };
    return e.__kind = "trigger", e;
  };
  ss.exports = { region: () => ({ auth: { user: () => ({ onCreate: ns, onDelete: ns }) } }) };
});

// supa/shims/firebase-admin.js
var ms = R((od, Za) => {
  "use strict";
  var K = ra(), { FieldValue: ds, AggregateField: Fr } = Pt(), us = () => K.db;
  us.FieldValue = ds;
  var Hr = new Proxy(us, { get: (e, t) => t === "FieldValue" ? ds : t === "AggregateField" ? Fr : K.db[t] && typeof K.db[t] == "function" ? K.db[t].bind(K.db) : e[t] }), rs = (e) => e && {
    uid: e.id,
    email: e.email || "",
    emailVerified: !!e.email_confirmed_at || !K.requireVerified(),
    displayName: e.raw_user_meta_data && (e.raw_user_meta_data.displayName || e.raw_user_meta_data.name) || "",
    disabled: !!e.banned_until && new Date(e.banned_until).getTime() > Date.now(),
    customClaims: e.raw_app_meta_data || {}
  }, is = (e) => {
    let t = new Error(e || "There is no user record");
    return t.code = "auth/user-not-found", t;
  }, Kr = {
    async getUser(e) {
      let t = await K.sql`select * from auth.users where id = ${e}::uuid`;
      if (!t.length) throw is();
      return rs(t[0]);
    },
    async getUserByEmail(e) {
      let t = await K.sql`select * from auth.users where lower(email) = lower(${e}) limit 1`;
      if (!t.length) throw is();
      return rs(t[0]);
    },
    async updateUser(e, t) {
      t.displayName !== void 0 && await K.sql`update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || ${K.sql.json({ displayName: t.displayName })}::jsonb where id = ${e}::uuid`, t.disabled !== void 0 && (await K.sql`update auth.users set banned_until = case when ${!!t.disabled}::boolean then 'infinity'::timestamptz else null end where id = ${e}::uuid`, K.tokenCache && K.tokenCache.clear());
    },
    async setCustomUserClaims(e, t) {
      await K.sql`update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || ${K.sql.json(t)}::jsonb where id = ${e}::uuid`;
    },
    /** Kills every session of the user: their refresh tokens stop working and the access token is rejected on the next call. */
    async revokeRefreshTokens(e) {
      await K.sql`delete from auth.sessions where user_id = ${e}::uuid`, K.tokenCache && K.tokenCache.clear();
    }
  }, cs = (e) => e.startsWith("deposits/") ? { bucket: "deposits", name: e.slice(9) } : { bucket: "pub", name: e }, Wr = () => ({
    bucket: () => ({
      file: (e) => ({
        async exists() {
          let t = cs(e);
          return [(await K.sql`select 1 from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`).length > 0];
        },
        async getMetadata() {
          let t = cs(e), a = await K.sql`select metadata from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`, n = a[0] && a[0].metadata || {};
          return [{ contentType: n.mimetype || n.contentType || "", size: Number(n.size) || 0 }];
        }
      })
    })
  }), Vr = () => ({ sendEachForMulticast: async () => ({ responses: [] }) }), ls = { apps: [1], initializeApp() {
  }, firestore: Hr, auth: () => Kr, storage: Wr, messaging: Vr };
  Za.exports = ls;
  Za.exports.default = ls;
});

// src/util.js
var W = R((rd, fs) => {
  "use strict";
  var Ot = ms(), { HttpsError: ze } = ne();
  Ot.apps.length || Ot.initializeApp();
  var Tt = Ot.firestore(), vt = Ot.firestore.FieldValue, zr = "asia-south1", ps = ["main", "winning", "referral", "commission"], Yr = ["super", "finance", "support", "content", "payout"], Ve = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, nt = (e) => new ze("invalid-argument", e);
  function Qa(e) {
    if (!e.auth) throw new ze("unauthenticated", "Please sign in.");
    return e.auth.uid;
  }
  function Jr(e) {
    let t = Qa(e);
    if (!e.auth.token.email_verified) throw new ze("failed-precondition", "Please verify your email first.");
    return t;
  }
  function Xr(e, t) {
    let a = Qa(e), n = e.auth.token;
    if (n.admin !== !0 || !t.includes(n.role)) throw new ze("permission-denied", "You do not have permission.");
    return a;
  }
  function Zr(e, { min: t = 0.01, max: a = 1e9, label: n = "Amount" } = {}) {
    let s = Number(e);
    if (!Number.isFinite(s)) throw nt(`${n} must be a number.`);
    if (s < t) throw nt(`${n} must be at least ${t}.`);
    if (s > a) throw nt(`${n} must be at most ${a}.`);
    return Ve(s);
  }
  function Qr(e, { min: t = 1, max: a = 200, label: n = "Value", pattern: s = null } = {}) {
    if (typeof e != "string") throw nt(`${n} is required.`);
    let o = e.trim();
    if (o.length < t || o.length > a) throw nt(`${n} must be ${t}-${a} characters.`);
    if (s && !s.test(o)) throw nt(`${n} has an invalid format.`);
    return o;
  }
  function ei(e) {
    if (!e) throw new ze("not-found", "User profile not found.");
    if (e.status !== "active") throw new ze("permission-denied", "This account is not active.");
  }
  function ti(e, t, a = ["main", "winning"]) {
    let n = Ve(t);
    if (Ve(a.reduce((r, i) => r + (Number(e?.[i]) || 0), 0)) < n) throw new ze("failed-precondition", "Insufficient balance.");
    let o = {};
    for (let r of a) {
      let i = Math.min(Number(e?.[r]) || 0, n);
      if (i > 0 && (o[r] = Ve(i), n = Ve(n - i)), n <= 0) break;
    }
    return o;
  }
  function ai(e, t, a) {
    let n = {};
    for (let [s, o] of Object.entries(a)) {
      if (!ps.includes(s)) throw new Error("bad bucket " + s);
      n[`balances.${s}`] = vt.increment(Ve(o));
    }
    e.update(t, n);
  }
  function ni(e, { uid: t, type: a, direction: n, amount: s, bucket: o = "main", note: r = "", ref: i = "" }) {
    e.set(Tt.collection("transactions").doc(), {
      uid: t,
      type: a,
      direction: n,
      amount: Ve(s),
      bucket: o,
      note: r,
      ref: i,
      createdAt: vt.serverTimestamp()
    });
  }
  function si(e, t, a, n, s = "info") {
    e.set(Tt.collection("users").doc(t).collection("notifications").doc(), {
      title: a,
      body: n,
      type: s,
      read: !1,
      createdAt: vt.serverTimestamp()
    });
  }
  function oi(e, t) {
    let a = {};
    for (let [n, s] of Object.entries(t)) a[n] = vt.increment(s);
    e.set(Tt.doc("stats/global"), a, { merge: !0 });
  }
  function ri(e, t, a, n = {}) {
    let s = Tt.collection("auditLogs").doc(), o = { actorUid: t, action: a, detail: n, at: vt.serverTimestamp() };
    e ? e.set(s, o) : s.set(o);
  }
  async function ii() {
    let e = await Tt.doc("settings/site").get();
    return e.exists ? e.data() : {};
  }
  fs.exports = {
    admin: Ot,
    db: Tt,
    FieldValue: vt,
    HttpsError: ze,
    REGION: zr,
    BUCKETS: ps,
    STAFF_ROLES: Yr,
    round2: Ve,
    bad: nt,
    authUid: Qa,
    requireVerified: Jr,
    requireRole: Xr,
    amountOf: Zr,
    str: Qr,
    assertActive: ei,
    planDebit: ti,
    applyDelta: ai,
    ledger: ni,
    notify: si,
    bumpStats: oi,
    audit: ri,
    siteSettings: ii
  };
});

// src/auth.js
var ws = R((Ut) => {
  "use strict";
  var ci = os(), { onCall: gs } = ne(), se = W(), { db: be, admin: en, FieldValue: st, HttpsError: tn, REGION: an } = se, hs = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", di = () => Array.from({ length: 8 }, () => hs[ye("crypto").randomInt(0, hs.length)]).join("");
  async function ia(e, t = "", a = "") {
    let n = be.doc(`users/${e}`);
    if ((await n.get()).exists) return;
    let s = null;
    for (let o = 0; o < 8 && !s; o++) {
      let r = di();
      try {
        await be.doc(`referralCodes/${r}`).create({ uid: e }), s = r;
      } catch (i) {
        if (i.code !== 6 && !/ALREADY_EXISTS/.test(String(i))) throw i;
      }
    }
    if (!s) throw new tn("internal", "Could not allocate referral code.");
    await be.runTransaction(async (o) => {
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
      }), se.bumpStats(o, { totalUsers: 1 }));
    });
  }
  Ut.onAuthCreate = ci.region(an).auth.user().onCreate((e) => ia(e.uid, e.email || "", e.displayName || ""));
  Ut.completeRegistration = gs({ region: an }, async (e) => {
    let t = se.authUid(e), a = e.data || {}, n = se.str(a.name, { min: 2, max: 60, label: "Name" }), s = se.str(a.username, { min: 3, max: 20, label: "Username", pattern: /^[A-Za-z0-9_]+$/ }).toLowerCase(), o = se.str(a.phone, { min: 8, max: 16, label: "Phone", pattern: /^\+?[0-9]{8,15}$/ }), r = typeof a.referralCode == "string" ? a.referralCode.trim().toUpperCase() : "", i = await en.auth().getUser(t);
    await ia(t, i.email || "", n);
    let c = "";
    if (r) {
      let d = await be.doc(`referralCodes/${r}`).get();
      if (!d.exists) throw se.bad("Referral code not found.");
      if (d.data().uid === t) throw se.bad("You cannot use your own referral code.");
      c = d.data().uid;
    }
    return await be.runTransaction(async (d) => {
      let u = be.doc(`users/${t}`);
      if ((await d.get(u)).data().profileComplete) return;
      let m = be.doc(`usernames/${s}`);
      if ((await d.get(m)).exists) throw new tn("already-exists", "Username is already taken.");
      d.set(m, { uid: t }), d.update(u, { name: n, username: s, phone: o, referredBy: c, profileComplete: !0 });
    }), await en.auth().updateUser(t, { displayName: n }), { ok: !0 };
  });
  Ut.bootstrap = gs({ region: an }, async (e) => {
    let t = se.authUid(e), a = await en.auth().getUser(t);
    await ia(t, a.email || "", a.displayName || "");
    let n = be.doc(`users/${t}`), s = await se.siteSettings(), o = se.round2(Number(s.welcomeBonus) || 0), r = se.round2(Number(s.referral?.signupReward) || 0);
    if ((await be.runTransaction(async (d) => {
      let l = (await d.get(n)).data();
      if (l.status !== "active") return { banned: !0 };
      let m = a.emailVerified && l.profileComplete && !l.signupRewardsGiven, p = null;
      m && l.referredBy && r > 0 && (p = await d.get(be.doc(`users/${l.referredBy}`)));
      let f = { lastLoginAt: st.serverTimestamp(), lastSeenAt: st.serverTimestamp() };
      if (m && (f.signupRewardsGiven = !0, o > 0 && (f["balances.main"] = st.increment(o), se.ledger(d, { uid: t, type: "bonus", direction: "in", amount: o, bucket: "main", note: "Welcome bonus" }), se.notify(d, t, "Welcome!", `${o} welcome bonus has been added to your wallet.`, "bonus")), p && p.exists && p.data().status === "active")) {
        let w = l.referredBy;
        d.update(be.doc(`users/${w}`), { "balances.referral": st.increment(r) }), se.ledger(d, { uid: w, type: "referral", direction: "in", amount: r, bucket: "referral", note: `Referral: ${l.username}` }), se.notify(d, w, "New referral", `${l.username} joined with your code. +${r}`, "referral"), d.set(be.doc(`referrals/${t}`), {
          referrerUid: w,
          referredUid: t,
          referredName: l.username,
          rewardAmount: r,
          commissionTotal: 0,
          createdAt: st.serverTimestamp()
        }), se.bumpStats(d, { totalReferrals: 1 });
      }
      return d.update(n, f), { banned: !1 };
    })).banned) throw new tn("permission-denied", "This account is banned.");
    let c = (e.rawRequest?.headers?.["x-forwarded-for"] || e.rawRequest?.ip || "").toString().split(",")[0].trim();
    return await be.collection("loginHistory").add({
      uid: t,
      at: st.serverTimestamp(),
      ip: c,
      ua: (e.rawRequest?.headers?.["user-agent"] || "").toString().slice(0, 300)
    }), { ok: !0, emailVerified: a.emailVerified };
  });
  Ut.ensureUserDoc = ia;
});

// src/payrot.js
var on = R((cd, vs) => {
  "use strict";
  var ot = W(), { db: Bt } = ot, bs = 864e5, ui = 25e3, As = 30, O = (e) => Number.isFinite(Number(e)) ? Number(e) : 0, nn = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 10), rt = (e) => O(e.cycleLimit) > 0, ca = (e) => O(e.cycleReceived), sn = (e) => O(e.cycleReserved), Ts = (e) => rt(e) ? Math.max(0, ot.round2(O(e.cycleLimit) - ca(e) - sn(e))) : 1 / 0, ys = (e, t) => O(e.priority) - O(t.priority) || O(e.lastActivatedAt) - O(t.lastActivatedAt) || O(e.createdAt) - O(t.createdAt) || String(e.id).localeCompare(String(t.id));
  function li(e, t = {}) {
    return {
      accountId: e.id,
      methodId: e.methodId,
      cycleNo: O(e.cycleNo) || 1,
      receivedAmount: ca(e),
      limit: O(e.cycleLimit),
      activatedAt: O(e.lastActivatedAt),
      limitReachedAt: O(e.limitReachedAt),
      cooldownStartedAt: O(e.cooldownStartedAt),
      cooldownEndsAt: O(e.cooldownUntil),
      ...t
    };
  }
  async function mi(e, t, a = {}) {
    let n = a.now || Date.now(), s = Math.max(1, O(a.min) || 1), o = await e.get(Bt.doc(`paymentMethods/${t}`)), r = await e.get(Bt.collection("paymentAccounts").where("methodId", "==", t)), i = o.exists ? o.data() : null, c = !i || i.autoRotation !== !1, u = (r.docs.length ? await e.getAll(...r.docs.map((h) => h.ref)) : []).filter((h) => h.exists).map((h) => ({ id: h.id, ref: h.ref, ...h.data() })), l = /* @__PURE__ */ new Map(), m = [], p = (h) => u.find((T) => T.id === h), f = (h, T) => {
      Object.assign(h, T), l.set(h.id, { ...l.get(h.id) || {}, ...T });
    }, w = (h, T) => {
      e.set(Bt.doc(`paymentCycles/${h.id}_${O(h.cycleNo) || 1}`), li(h, { endReason: T, closedAt: n }), { merge: !0 });
    }, y = a.settle;
    if (y) {
      let h = p(y.accountId);
      if (h) {
        let T = {};
        rt(h) && (T.cycleReserved = Math.max(0, ot.round2(sn(h) - y.amount)), y.outcome === "approve" && (T.cycleReceived = ot.round2(ca(h) + y.amount))), y.outcome === "release" && (h.usedTodayKey === nn(n) && (T.usedToday = Math.max(0, ot.round2(O(h.usedToday) - y.amount))), h.usedMonthKey === nn(n).slice(0, 7) && (T.usedMonth = Math.max(0, ot.round2(O(h.usedMonth) - y.amount))), T.totalCollected = Math.max(0, ot.round2(O(h.totalCollected) - y.amount)), T.totalDeposits = Math.max(0, O(h.totalDeposits) - 1)), f(h, T);
      }
    }
    let b = a.force || {};
    if (b.reset) {
      let h = p(b.reset);
      h && (w(h, "manual_reset"), f(h, { cycleReceived: 0, cycleNo: (O(h.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0, ...h.status === "cooldown" ? { status: "standby" } : {} }));
    }
    if (b.pause) {
      let h = p(b.pause);
      h && f(h, { status: "paused" });
    }
    if (b.resume) {
      let h = p(b.resume);
      h && h.status === "paused" && f(h, { status: "standby" });
    }
    if (b.activate) {
      let h = p(b.activate);
      if (h) {
        for (let T of u) T.id !== h.id && T.status === "active" && rt(T) && c && f(T, { status: "standby" });
        f(h, { status: "active", lastActivatedAt: n, cooldownStartedAt: 0, cooldownUntil: 0, limitReachedAt: 0 }), m.push({ old: "", next: h.id, reason: "manual" });
      }
    }
    for (let h of u)
      rt(h) && h.status === "cooldown" && O(h.cooldownUntil) && O(h.cooldownUntil) <= n && (e.set(Bt.doc(`paymentCycles/${h.id}_${O(h.cycleNo) || 1}`), { completedAt: n, endReason: "cooldown_ended" }, { merge: !0 }), f(h, { status: "standby", cycleReceived: 0, cycleNo: (O(h.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0 }));
    let _ = "", v = "";
    if (c) {
      for (let A of u)
        if (rt(A) && A.status === "active" && (_ = _ || A.id, O(A.cycleLimit) - ca(A) < s && sn(A) <= 0)) {
          let $ = O(A.cooldownDays) > 0 ? O(A.cooldownDays) : As;
          f(A, { status: "cooldown", limitReachedAt: n, cooldownStartedAt: n, cooldownUntil: n + $ * bs }), w(A, "limit_reached"), v = v || A.id;
        }
      let h = u.filter(rt), T = h.filter((A) => A.status === "active").sort((A, $) => O($.lastActivatedAt) - O(A.lastActivatedAt) || ys(A, $));
      for (let A of T.slice(1)) f(A, { status: "standby" });
      if (!T.length) {
        let A = h.filter(($) => $.status === "standby" && Ts($) >= s).sort(ys)[0];
        A ? (f(A, { status: "active", lastActivatedAt: n }), m.push({ old: v || _, next: A.id, reason: v ? "limit_reached" : a.reason || "no_active" })) : v && m.push({ old: v, next: "", reason: "limit_reached_no_standby" });
      }
    }
    for (let [h, T] of l) e.update(p(h).ref, { ...T, updatedAt: n });
    for (let h of m)
      !h.next && !h.old || e.set(Bt.collection("paymentRotationLogs").doc(), { methodId: t, oldAccountId: h.old || "", newAccountId: h.next || "", reason: h.reason, at: n });
    return { changed: [...l.keys()], activated: (m.find((h) => h.next) || {}).next || null, accounts: u };
  }
  vs.exports = { rotateTx: mi, cycleOn: rt, room: Ts, n0: O, dayKey: nn, DAY: bs, DEFAULT_LIMIT: ui, DEFAULT_COOLDOWN_DAYS: As };
});

// src/storage.js
var ma = R((la, Es) => {
  "use strict";
  var { onCall: dn } = ne(), Ae = W(), { HttpsError: it, REGION: un } = Ae, pi = () => globalThis.__ENV || process.env, ks = () => {
    let e = pi(), a = { endpoint: String(e.S3_ENDPOINT || "").replace(/\/+$/, ""), bucket: String(e.S3_BUCKET || ""), key: String(e.S3_ACCESS_KEY_ID || ""), secret: String(e.S3_SECRET_ACCESS_KEY || ""), region: String(e.S3_REGION || "auto") };
    return a.ok = !!(a.endpoint && /^https:\/\//.test(a.endpoint) && a.bucket && a.key && a.secret), a;
  }, ln = () => ks().ok, rn = new TextEncoder(), Ss = (e) => [...new Uint8Array(e)].map((t) => t.toString(16).padStart(2, "0")).join(""), cn = () => globalThis.crypto && globalThis.crypto.subtle || ye("node:crypto").webcrypto.subtle, fi = async (e) => Ss(await cn().digest("SHA-256", rn.encode(e))), Lt = async (e, t) => {
    let a = await cn().importKey("raw", typeof e == "string" ? rn.encode(e) : e, { name: "HMAC", hash: "SHA-256" }, !1, ["sign"]);
    return cn().sign("HMAC", a, rn.encode(t));
  }, da = (e) => encodeURIComponent(e).replace(/[!'()*]/g, (t) => "%" + t.charCodeAt(0).toString(16).toUpperCase());
  async function xt(e, t, { expires: a = 300, contentType: n = "", now: s = Date.now() } = {}) {
    let o = ks();
    if (!o.ok) throw new it("failed-precondition", "File storage is not set up yet.");
    let r = new URL(o.endpoint), i = r.host, d = `${r.pathname.replace(/\/+$/, "")}/${da(o.bucket)}/${t.split("/").map(da).join("/")}`, u = new Date(s).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), l = u.slice(0, 8), m = `${l}/${o.region}/s3/aws4_request`, p = n ? "content-type;host" : "host", f = { "X-Amz-Algorithm": "AWS4-HMAC-SHA256", "X-Amz-Credential": `${o.key}/${m}`, "X-Amz-Date": u, "X-Amz-Expires": String(a), "X-Amz-SignedHeaders": p }, w = Object.keys(f).sort().map((T) => `${da(T)}=${da(f[T])}`).join("&"), y = (n ? `content-type:${n}
` : "") + `host:${i}
`, b = [e, d, w, y, p, "UNSIGNED-PAYLOAD"].join(`
`), _ = ["AWS4-HMAC-SHA256", u, m, await fi(b)].join(`
`), v = await Lt("AWS4" + o.secret, l);
    v = await Lt(v, o.region), v = await Lt(v, "s3"), v = await Lt(v, "aws4_request");
    let h = Ss(await Lt(v, _));
    return `${r.protocol}//${i}${d}?${w}&X-Amz-Signature=${h}`;
  }
  var Cs = (...e) => (Ae.storageFetch || globalThis.fetch)(...e);
  async function _s(e) {
    let t = await Cs(await xt("HEAD", e, { expires: 60 }), { method: "HEAD" });
    if (t.status === 404) return { exists: !1 };
    if (!t.ok) throw new it("unavailable", "File storage did not answer. Please try again.");
    let a = (n) => (t.headers && t.headers.get ? t.headers.get(n) : "") || "";
    return { exists: !0, contentType: a("content-type"), size: Number(a("content-length")) || 0 };
  }
  async function Is(e) {
    try {
      await Cs(await xt("DELETE", e, { expires: 60 }), { method: "DELETE" });
    } catch {
    }
  }
  var mn = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }, ua = 3 * 1024 * 1024, $s = (e) => typeof e == "string" && e.length <= 220 && /^[A-Za-z0-9_\-/.]+$/.test(e) && !e.includes("..") && !e.startsWith("/");
  async function hi(e) {
    let t = await _s(e);
    if (!t.exists) throw new it("failed-precondition", "The screenshot upload was not found. Please upload again.");
    if (!mn[String(t.contentType).split(";")[0]] || t.size > ua)
      throw await Is(e), Ae.bad("Screenshot must be a JPG/PNG/WEBP image under 3 MB.");
    return t;
  }
  var Ns = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  };
  async function gi(e, t) {
    let a = Ae.authUid(e), n = Ns(e), s = t.split("/");
    if (s[0] === "deposits") return s[1] === a || ["super", "finance", "support"].includes(n);
    if (s[0] === "payouts") {
      if (["super", "finance"].includes(n)) return !0;
      if (n === "payout") {
        let o = await Ae.db.doc(`withdrawals/${s[1]}`).get();
        return o.exists && o.data().assignedTo === a;
      }
      return !1;
    }
    return s[0] === "staff" ? !!n && n !== "payout" : !1;
  }
  la.storageStatus = dn({ region: un }, async (e) => (Ae.authUid(e), { configured: ln(), maxBytes: ua, types: Object.keys(mn) }));
  la.storageUploadUrl = dn({ region: un }, async (e) => {
    let t = Ae.authUid(e), a = e.data || {}, n = Ns(e);
    if (!ln()) throw new it("failed-precondition", "File storage is not set up yet.");
    let s = String(a.contentType || ""), o = mn[s];
    if (!o) throw Ae.bad("Only JPG, PNG or WEBP images.");
    let r = Number(a.size) || 0;
    if (r <= 0 || r > ua) throw Ae.bad("Image must be under 3 MB.");
    let i = Math.random().toString(36).slice(2, 10), c = Date.now(), d;
    if (a.kind === "deposit") d = `deposits/${t}/${c}-${i}.${o}`;
    else if (a.kind === "payout") {
      let u = Ae.str(a.withdrawalId, { max: 80, label: "Withdrawal" }), l = await Ae.db.doc(`withdrawals/${u}`).get();
      if (!l.exists || l.data().assignedTo !== t || l.data().status !== "pending") throw new it("permission-denied", "This task is not assigned to you.");
      d = `payouts/${u}/${t}-${c}-${i}.${o}`;
    } else if (a.kind === "staff") {
      if (!n || n === "payout") throw new it("permission-denied", "Staff only.");
      d = `staff/${t}/${c}-${i}.${o}`;
    } else throw Ae.bad("Unknown upload type.");
    return { url: await xt("PUT", d, { expires: 300, contentType: s }), key: d, contentType: s, expiresIn: 300 };
  });
  la.storageViewUrl = dn({ region: un }, async (e) => {
    let t = e.data && e.data.key;
    if (!$s(t)) throw Ae.bad("Invalid file.");
    if (!await gi(e, t)) throw new it("permission-denied", "You cannot view this file.");
    return { url: await xt("GET", t, { expires: 300 }), expiresIn: 300 };
  });
  Es.exports.helpers = { presign: xt, headObject: _s, deleteObject: Is, verifyImage: hi, configured: ln, safeKey: $s, MAX_BYTES: ua };
});

// src/wdcore.js
var pn = R((dd, Rs) => {
  "use strict";
  var Ye = W(), { db: wi, FieldValue: yi } = Ye, Je = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  function bi(e = Date.now()) {
    let t = new Date(e + 216e5);
    return t.setUTCHours(0, 0, 0, 0), new Date(t.getTime() - 6 * 36e5);
  }
  function Ai(e) {
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
  function Ti(e, t, a, n, s, o, r = {}) {
    e.update(t, { status: n ? "approved" : "rejected", stage: n ? "done" : "rejected", note: o, reviewedAt: yi.serverTimestamp(), reviewedBy: s, ...r }), n ? (Ye.notify(e, a.uid, "Withdrawal approved", `${a.net} has been sent to ${a.accountNumber}.`, "withdraw"), Ye.ledger(e, { uid: a.uid, type: "withdraw", direction: "out", amount: 0, bucket: a.bucket, note: `Paid ${a.net} (fee ${a.fee})`, ref: t.id }), Ye.bumpStats(e, { totalWithdrawals: a.amount, feesCollected: a.fee, withdrawCount: 1, pendingWithdrawals: -1 })) : (Ye.applyDelta(e, wi.doc(`users/${a.uid}`), a.plan && Object.keys(a.plan).length ? a.plan : { [a.bucket]: a.amount }), Ye.ledger(e, { uid: a.uid, type: "withdraw_refund", direction: "in", amount: a.amount, bucket: a.bucket, note: "Withdrawal rejected", ref: t.id }), Ye.notify(e, a.uid, "Withdrawal rejected", o || "Your withdrawal was rejected and the amount was returned.", "withdraw"), Ye.bumpStats(e, { pendingWithdrawals: -1 }));
  }
  Rs.exports = { n0: Je, startOfDhakaDay: bi, withdrawSettings: Ai, finalize: Ti };
});

// src/wallet.js
var Ps = R((Xe) => {
  "use strict";
  var { onCall: ct } = ne(), g = W(), { db: P, admin: vi, FieldValue: je, HttpsError: q, REGION: dt } = g, pa = on(), Ms = (e, t) => e && e.enabled === !0 && [t, "both"].includes(e.type || "both"), fn = () => new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10), Ds = () => fn().slice(0, 7), ue = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  Xe.submitDeposit = ct({ region: dt }, async (e) => {
    let t = g.requireVerified(e), a = e.data || {}, n = g.str(a.methodId, { max: 80, label: "Method" }), s = a.accountId ? g.str(a.accountId, { max: 120, label: "Account" }) : "", o = g.amountOf(a.amount), r = g.str(a.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), i = typeof a.senderNumber == "string" ? a.senderNumber.trim().slice(0, 30) : "", c = typeof a.screenshotPath == "string" ? a.screenshotPath.trim().slice(0, 200) : "";
    if (c) {
      if (!c.startsWith(`deposits/${t}/`) || c.includes("..")) throw g.bad("Invalid screenshot path.");
      let A = ma().helpers;
      if (A.configured() && a.store === "s3") await A.verifyImage(c);
      else {
        let $ = vi.storage().bucket().file(c), [N] = await $.exists();
        if (!N) throw new q("failed-precondition", "Screenshot upload was not found. Please upload again.");
        let [I] = await $.getMetadata();
        if (!String(I.contentType || "").startsWith("image/")) throw g.bad("Screenshot must be an image.");
      }
    }
    let d = c && a.store === "s3" ? "s3" : "", l = (await g.siteSettings()).deposit || {}, m = ue(l.min) || 1, p = ue(l.max) || 1e7;
    if (o < m || o > p) throw g.bad(`Amount must be between ${m} and ${p}.`);
    if ((await P.collection("deposits").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= 5) throw new q("resource-exhausted", "Too many pending deposits. Please wait for review.");
    let w = new Date(Date.now() + 6 * 36e5);
    w.setUTCHours(0, 0, 0, 0);
    let y = new Date(w.getTime() - 6 * 36e5), _ = (await P.collection("deposits").where("uid", "==", t).where("createdAt", ">=", y).get()).docs.filter((A) => A.data().status !== "rejected").reduce((A, $) => A + ue($.data().amount), 0), h = (await P.doc(`users/${t}`).get()).data()?.dupTrx || {};
    if (h.blockedUntil && h.blockedUntil > Date.now()) throw new q("permission-denied", `Deposits are blocked until ${new Date(h.blockedUntil).toISOString().slice(0, 16).replace("T", " ")} UTC because of repeated duplicate transaction IDs.`);
    if ((await P.doc(`trxIndex/${n}_${r}`).get()).exists) {
      let A = h.lastAt && h.lastAt > Date.now() - 864e5 ? (h.count || 0) + 1 : 1, $ = { "dupTrx.count": A, "dupTrx.lastAt": Date.now() };
      throw A >= 2 && ($["dupTrx.blockedUntil"] = Date.now() + 864e5), await P.doc(`users/${t}`).update($), await P.doc("stats/global").set({ duplicateAttempts: je.increment(1) }, { merge: !0 }), g.audit(null, t, "duplicate_trx_attempt", { methodId: n, trxId: r, count: A }), new q("already-exists", A >= 2 ? "This transaction ID was already used. Deposits are blocked for 24 hours." : "This transaction ID was already used. Another attempt will block deposits for 24 hours.");
    }
    let T = P.collection("deposits").doc();
    return await P.runTransaction(async (A) => {
      let $ = [A.get(P.doc(`paymentMethods/${n}`)), A.get(P.doc(`users/${t}`)), A.get(P.doc(`trxIndex/${n}_${r}`))];
      s && $.push(A.get(P.doc(`paymentAccounts/${s}`)));
      let [N, I, H, ee] = await Promise.all($);
      g.assertActive(I.data());
      let j = N.data();
      if (!N.exists || !Ms(j, "deposit")) throw g.bad("This payment method is not available.");
      if (j.minAmount && o < j.minAmount) throw g.bad(`Minimum for ${j.name} is ${j.minAmount}.`);
      if (j.maxAmount && o > j.maxAmount) throw g.bad(`Maximum for ${j.name} is ${j.maxAmount}.`);
      let te = I.data().rg || {}, qe = te.pendingLimitAt && te.pendingLimitAt <= Date.now() ? ue(te.pendingLimit) : ue(te.dailyDepositLimit);
      if (qe > 0 && _ + o > qe) throw new q("failed-precondition", `Your daily deposit limit is ${qe}. Remaining today: ${Math.max(0, g.round2(qe - _))}.`);
      if (H.exists) throw new q("already-exists", "This transaction ID has already been submitted.");
      let ea = j.accountNumber || "", ta = "", Ka = "", Vn = "";
      if (s) {
        let ae = ee && ee.exists ? ee.data() : null;
        if (!ae || ae.status !== "active" || ae.methodId !== n) throw new q("failed-precondition", "This payment account is no longer available. Please choose again.");
        let zn = ae.usedTodayKey === fn() ? ue(ae.usedToday) : 0, Yn = ae.usedMonthKey === Ds() ? ue(ae.usedMonth) : 0;
        if (zn + o > ue(ae.dailyLimit) || Yn + o > ue(ae.monthlyLimit)) throw new q("failed-precondition", "This account reached its limit. Please choose again.");
        let $r = pa.cycleOn(ae) ? { cycleReserved: g.round2(ue(ae.cycleReserved) + o) } : {};
        if (pa.cycleOn(ae) && o > pa.room(ae)) throw new q("failed-precondition", "This payment number has reached its limit. Please try again shortly.");
        A.update(ee.ref, {
          usedToday: g.round2(zn + o),
          usedTodayKey: fn(),
          usedMonth: g.round2(Yn + o),
          usedMonthKey: Ds(),
          totalDeposits: je.increment(1),
          totalCollected: je.increment(o),
          lastUsedAt: Date.now(),
          ...$r
        }), ea = ae.accountNumber || "", ta = ae.holderName || "", Ka = ae.bankName || "", Vn = ae.branch || "";
      }
      A.set(P.doc(`trxIndex/${n}_${r}`), { uid: t, depositId: T.id }), A.set(T, {
        uid: t,
        username: I.data().username,
        methodId: n,
        methodName: j.name,
        accountId: s,
        accountNumber: ea,
        holderName: ta,
        ...Ka ? { bankName: Ka, branch: Vn } : {},
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
      let d = P.doc(`deposits/${n}`), u = await c.get(d);
      if (!u.exists) throw new q("not-found", "Deposit not found.");
      let l = u.data();
      if (l.status !== "pending") throw new q("failed-precondition", `Already ${l.status}.`);
      let m = P.doc(`users/${l.uid}`), p = await c.get(m), f = null, w = null;
      s && i > 0 && p.data().referredBy && (f = await c.get(P.doc(`users/${p.data().referredBy}`)), w = await c.get(P.doc(`referrals/${l.uid}`))), l.accountId && await pa.rotateTx(c, l.methodId, { now: Date.now(), min: Math.max(1, ue((r.deposit || {}).min) || 1), settle: { accountId: l.accountId, amount: l.amount, outcome: s ? "approve" : "release" } });
      let y = { status: s ? "approved" : "rejected", note: o, reviewedAt: je.serverTimestamp(), reviewedBy: t };
      if (c.update(d, y), s) {
        if (g.applyDelta(c, m, { main: l.amount }), g.ledger(c, { uid: l.uid, type: "deposit", direction: "in", amount: l.amount, bucket: "main", note: l.methodName, ref: n }), g.notify(c, l.uid, "Deposit approved", `${l.amount} has been added to your wallet.`, "deposit"), g.bumpStats(c, { totalDeposits: l.amount, depositCount: 1, pendingDeposits: -1 }), f && f.exists && f.data().status === "active") {
          let b = g.round2(l.amount * i / 100);
          b > 0 && (g.applyDelta(c, f.ref, { commission: b }), g.ledger(c, { uid: f.id, type: "commission", direction: "in", amount: b, bucket: "commission", note: `Deposit by ${p.data().username}`, ref: n }), g.notify(c, f.id, "Referral commission", `+${b} from ${p.data().username}'s deposit.`, "referral"), w && w.exists && c.update(w.ref, { commissionTotal: je.increment(b) }), g.bumpStats(c, { commissionPaid: b }));
        }
      } else
        c.delete(P.doc(`trxIndex/${l.methodId}_${l.trxId}`)), g.notify(c, l.uid, "Deposit rejected", o || "Your deposit request was rejected.", "deposit"), g.bumpStats(c, { pendingDeposits: -1 });
      g.audit(c, t, s ? "deposit_approved" : "deposit_rejected", { depositId: n, amount: l.amount, uid: l.uid });
    }), { ok: !0 };
  });
  Xe.markDepositProcessing = ct({ region: dt }, async (e) => {
    let t = g.requireRole(e, ["super", "finance"]), a = g.str((e.data || {}).depositId, { max: 80 });
    return await P.runTransaction(async (n) => {
      let s = P.doc(`deposits/${a}`), o = await n.get(s), r = o.exists ? o.data() : null;
      if (!r || r.status !== "pending") throw new q("failed-precondition", "Only a pending deposit can be marked processing.");
      r.stage !== "processing" && (n.update(s, { stage: "processing", processingAt: Date.now(), processingBy: t }), g.notify(n, r.uid, "Deposit processing", `Your deposit of ${r.amount} is being checked.`, "deposit"), g.audit(n, t, "deposit_processing", { depositId: a }));
    }), { ok: !0 };
  });
  Xe.refundDeposit = ct({ region: dt }, async (e) => {
    let t = g.requireRole(e, ["super", "finance"]), a = e.data || {}, n = g.str(a.depositId, { max: 80 }), s = g.str(a.note, { min: 3, max: 300, label: "Reason" });
    return await P.runTransaction(async (o) => {
      let r = P.doc(`deposits/${n}`), i = await o.get(r), c = i.exists ? i.data() : null;
      if (!c || c.status !== "approved") throw new q("failed-precondition", "Only an approved deposit can be refunded.");
      let d = P.doc(`users/${c.uid}`), u = await o.get(d), l = ue(u.data()?.balances?.main);
      if (l + 1e-9 < ue(c.amount)) throw new q("failed-precondition", `The player's main wallet has only ${g.round2(l)} \u2014 they already used part of this deposit.`);
      o.update(r, { status: "refunded", refundNote: s, refundedAt: je.serverTimestamp(), refundedBy: t }), g.applyDelta(o, d, { main: -ue(c.amount) }), g.ledger(o, { uid: c.uid, type: "deposit_refund", direction: "out", amount: c.amount, bucket: "main", note: s, ref: n }), g.notify(o, c.uid, "Deposit refunded", `${c.amount} was returned to you. ${s}`, "deposit"), g.bumpStats(o, { totalDeposits: -ue(c.amount), depositCount: -1, depositsRefunded: ue(c.amount) }), g.audit(o, t, "deposit_refunded", { depositId: n, amount: c.amount, uid: c.uid, note: s });
    }), { ok: !0 };
  });
  var fa = pn();
  Xe.requestWithdraw = ct({ region: dt }, async (e) => {
    let t = g.requireVerified(e), a = e.data || {}, n = g.str(a.methodId, { max: 80, label: "Method" }), s = a.bucket ? g.str(a.bucket, { max: 20, label: "Wallet" }) : "auto", o = g.amountOf(a.amount), r = g.str(a.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }), i = typeof a.holderName == "string" ? a.holderName.trim().slice(0, 60) : "", c = typeof a.bankName == "string" ? a.bankName.trim().slice(0, 60) : "", d = typeof a.branch == "string" ? a.branch.trim().slice(0, 60) : "", u = await g.siteSettings(), l = fa.withdrawSettings(u);
    if (!l.enabled) throw new q("failed-precondition", l.notice || "Withdrawals are paused right now. Please try again later.");
    let m = l.allowedBuckets;
    if (s !== "auto" && !m.includes(s)) throw g.bad("This wallet cannot be withdrawn from.");
    let p = g.round2(o * l.feePct / 100 + l.feeFlat);
    if (p >= o) throw g.bad("Amount is too small after fees.");
    if ((await P.collection("withdrawals").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= l.maxPending) throw new q("resource-exhausted", `You already have ${l.maxPending} pending withdrawal(s). Please wait until they are processed.`);
    if (l.dailyLimit > 0 || l.dailyCount > 0) {
      let b = (await P.collection("withdrawals").where("uid", "==", t).where("createdAt", ">=", fa.startOfDhakaDay()).get()).docs.filter((v) => v.data().status !== "rejected"), _ = b.reduce((v, h) => v + fa.n0(h.data().amount), 0);
      if (l.dailyCount > 0 && b.length >= l.dailyCount) throw new q("failed-precondition", `Daily limit reached: ${l.dailyCount} withdrawal(s) per day. Try again tomorrow.`);
      if (l.dailyLimit > 0 && _ + o > l.dailyLimit) throw new q("failed-precondition", `Daily withdraw limit is ${l.dailyLimit}. You can withdraw ${Math.max(0, g.round2(l.dailyLimit - _))} more today.`);
    }
    let w = P.collection("withdrawals").doc();
    return await P.runTransaction(async (y) => {
      let b = P.doc(`users/${t}/private/wdCards`), [_, v, h] = await Promise.all([y.get(P.doc(`paymentMethods/${n}`)), y.get(P.doc(`users/${t}`)), y.get(b)]);
      g.assertActive(v.data());
      let T = _.data();
      if (!_.exists || !Ms(T, "withdraw")) throw g.bad("This withdraw method is not available.");
      let A = h.exists && Array.isArray(h.data().list) ? h.data().list : [], $ = A.find((te) => te.methodId === n);
      if ($ && T.cardLock === !0 && String($.accountNumber).replace(/\s+/g, "") !== String(r).replace(/\s+/g, ""))
        throw new q("failed-precondition", '\u098F\u0987 \u09AE\u09C7\u09A5\u09A1\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C7\u09AD \u0995\u09B0\u09BE \u0995\u09BE\u09B0\u09CD\u09A1 \u0986\u099B\u09C7\u0964 \u0985\u09A8\u09CD\u09AF \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7 \u09A4\u09C1\u09B2\u09A4\u09C7 \u0995\u09BE\u09B0\u09CD\u09A1 \u09A5\u09C7\u0995\u09C7 "\u09A8\u09AE\u09CD\u09AC\u09B0 \u09AC\u09A6\u09B2\u09BE\u09A8" \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964 (Use the saved card or change its number.)');
      if (!$ && A.length < 6 && y.set(b, { list: [...A, { methodId: n, accountNumber: r, holderName: i, ...c ? { bankName: c, branch: d } : {}, savedAt: Date.now() }], updatedAt: Date.now() }), T.kind === "bank" && (c.length < 2 || d.length < 2 || i.length < 2)) throw g.bad("Bank name, branch and account holder name are required for a bank withdrawal.");
      let N = Math.max(l.min || 0, T.withdrawMin || 0), I = Math.min(l.max || 1 / 0, T.withdrawMax || 1 / 0);
      if (o < N || o > I) throw g.bad(`Amount must be between ${N} and ${I === 1 / 0 ? "\u221E" : I}.`);
      let H = s === "auto" ? m : [s], ee = g.planDebit(v.data().balances, o, H), j = {};
      for (let [te, qe] of Object.entries(ee)) j[te] = -qe;
      g.applyDelta(y, v.ref, j), g.ledger(y, { uid: t, type: "withdraw_hold", direction: "out", amount: o, bucket: Object.keys(ee)[0], note: T.name, ref: w.id }), g.notify(y, t, "Withdrawal requested", `${o} is waiting for approval (you receive ${g.round2(o - p)}).`, "withdraw"), y.set(w, {
        uid: t,
        username: v.data().username,
        methodId: n,
        methodName: T.name,
        bucket: Object.keys(ee)[0],
        plan: ee,
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
      if (!c.exists) throw new q("not-found", "Withdrawal not found.");
      let d = c.data();
      if (d.status !== "pending") throw new q("failed-precondition", `Already ${d.status}.`);
      if (d.stage === "paid_review") throw new q("failed-precondition", "An agent already paid this. Review it in Payout Review.");
      if (d.assignedTo && s) throw new q("failed-precondition", "This request is assigned to a payout agent. Unassign it first.");
      d.assignedTo && r.update(P.doc(`payoutAgents/${d.assignedTo}`), { openCount: je.increment(-1) }), fa.finalize(r, i, d, s, t, o), g.audit(r, t, s ? "withdraw_approved" : "withdraw_rejected", { withdrawalId: n, amount: d.amount, uid: d.uid });
    }), { ok: !0 };
  });
  Xe.saveWithdrawSettings = ct({ region: dt }, async (e) => {
    let t = g.requireRole(e, ["super", "finance"]), a = e.data || {}, n = (c, d, u, l) => {
      let m = Number(c);
      if (!Number.isFinite(m) || m < d || m > u) throw g.bad(`${l} must be between ${d} and ${u}.`);
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
var Us = R((ld, Os) => {
  "use strict";
  Os.exports = { onDocumentCreated: (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "trigger", a;
  } };
});

// src/admin.js
var Ls = R((kt) => {
  "use strict";
  var { onCall: ha } = ne(), { onDocumentCreated: ki } = Us(), B = W(), { db: _e, admin: ut, FieldValue: Si, HttpsError: Bs, REGION: Gt } = B;
  kt.adminAdjustBalance = ha({ region: Gt }, async (e) => {
    let t = B.requireRole(e, ["super", "finance"]), a = e.data || {}, n = B.str(a.uid, { max: 128 }), s = B.str(a.bucket, { max: 20 });
    if (!B.BUCKETS.includes(s)) throw B.bad("Invalid wallet.");
    let o = B.amountOf(Math.abs(Number(a.delta)), { min: 0.01, max: 1e7, label: "Amount" }) * (Number(a.delta) < 0 ? -1 : 1), r = B.str(a.reason, { min: 3, max: 200, label: "Reason" });
    return await _e.runTransaction(async (i) => {
      let c = _e.doc(`users/${n}`), d = await i.get(c);
      if (!d.exists) throw new Bs("not-found", "User not found.");
      if (B.round2((d.data().balances?.[s] || 0) + o) < 0) throw B.bad("Balance cannot go below zero.");
      B.applyDelta(i, c, { [s]: o }), B.ledger(i, { uid: n, type: "admin_adjust", direction: o > 0 ? "in" : "out", amount: Math.abs(o), bucket: s, note: r }), B.notify(i, n, "Balance updated", `${o > 0 ? "+" : ""}${o} (${r})`, "info"), B.audit(i, t, "balance_adjust", { uid: n, bucket: s, delta: o, reason: r });
    }), { ok: !0 };
  });
  kt.setUserStatus = ha({ region: Gt }, async (e) => {
    let t = B.requireRole(e, ["super", "support"]), a = e.data || {}, n = B.str(a.uid, { max: 128 }), s = a.banned === !0, o = typeof a.reason == "string" ? a.reason.trim().slice(0, 200) : "";
    if ((await ut.auth().getUser(n)).customClaims?.admin) throw new Bs("permission-denied", "Staff accounts cannot be banned here.");
    return await _e.doc(`users/${n}`).update({ status: s ? "banned" : "active", banReason: s ? o : "" }), await ut.auth().updateUser(n, { disabled: s }), s && await ut.auth().revokeRefreshTokens(n), B.audit(null, t, s ? "user_banned" : "user_unbanned", { uid: n, reason: o }), { ok: !0 };
  });
  kt.setStaffRole = ha({ region: Gt }, async (e) => {
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
  kt.adminNotify = ha({ region: Gt, timeoutSeconds: 300 }, async (e) => {
    let t = B.requireRole(e, ["super", "support"]), a = e.data || {}, n = B.str(a.title, { max: 80, label: "Title" }), s = B.str(a.body, { max: 400, label: "Message" }), o = (i) => ({ ref: _e.collection("users").doc(i).collection("notifications").doc(), data: { title: n, body: s, type: "announcement", read: !1, createdAt: Si.serverTimestamp() } }), r = 0;
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
        let u = _e.batch();
        d.docs.forEach((l) => {
          let m = o(l.id);
          u.set(m.ref, m.data);
        }), await u.commit(), r += d.size, i = d.docs[d.docs.length - 1];
      }
    }
    return B.audit(null, t, "notify", { title: n, recipients: r }), { ok: !0, recipients: r };
  });
  kt.pushOnNotification = ki({ document: "users/{uid}/notifications/{nid}", region: Gt }, async (e) => {
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
var js = R((pd, qs) => {
  "use strict";
  var xs = ye("crypto"), hn = {
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
  }, Ci = 0.99, gn = () => xs.randomInt(0, 2 ** 32) / 2 ** 32;
  function wn(e) {
    let t = [], a = 1;
    for (let n = 0; n <= e; n++)
      t.push(a / 2 ** e), a = a * (e - n) / (n + 1);
    return t;
  }
  var _i = { low: { base: 1, spread: 4, e: 2 }, medium: { base: 0.4, spread: 30, e: 3 }, high: { base: 0.15, spread: 300, e: 4.5 } };
  function Gs(e, t, a, n = 1e3) {
    let s = _i[t];
    if (!s) throw new Error("bad risk");
    let o = wn(e), r = o.map((c, d) => s.base + Math.pow(Math.abs(d - e / 2) / (e / 2), s.e) * s.spread), i = r.reduce((c, d, u) => c + d * o[u], 0);
    return r.map((c) => Math.min(n, Math.round(c * a / i * 100) / 100));
  }
  function Ii(e, t, a, n) {
    let s = Gs(e, t, a, n), o = wn(e);
    return s.reduce((r, i, c) => r + i * o[c], 0);
  }
  function $i(e) {
    let t = [];
    for (let a = 0; a < e; a++) t.push(xs.randomInt(0, 2));
    return { path: t, slot: t.reduce((a, n) => a + n, 0) };
  }
  function Ni(e) {
    let t = e.reduce((a, n) => a + n.weight, 0);
    return e.reduce((a, n) => a + n.mult * n.weight, 0) / t;
  }
  function Ei(e) {
    let t = e.reduce((n, s) => n + s.weight, 0), a = gn() * t;
    for (let n = 0; n < e.length; n++)
      if (a -= e[n].weight, a < 0) return n;
    return e.length - 1;
  }
  function Ri(e, t = 1e3) {
    let a = gn();
    return Math.min(t, Math.max(1, Math.floor(100 * e / (1 - a)) / 100));
  }
  var Di = (e, t) => Math.floor(Math.exp(t * e) * 100) / 100, Mi = (e, t) => Math.log(e) / t;
  function Pi(e = {}) {
    let t = { ...hn, ...e };
    for (let a of ["plinko", "wheel", "rocket"]) t[a] = { ...hn[a], ...e[a] || {} };
    return t;
  }
  qs.exports = {
    DEFAULTS: hn,
    MAX_RTP: Ci,
    binomProbs: wn,
    plinkoTable: Gs,
    plinkoRtp: Ii,
    plinkoDrop: $i,
    wheelRtp: Ni,
    wheelSpin: Ei,
    rocketCrashPoint: Ri,
    rocketMultiplierAt: Di,
    rocketCrashTimeMs: Mi,
    mergeConfig: Pi,
    randFloat: gn
  };
});

// src/games.js
var Hs = R((lt) => {
  "use strict";
  var { onCall: St } = ne(), L = W(), Ie = js(), { db: X, FieldValue: yn, HttpsError: ga, REGION: Ct } = L;
  async function wa() {
    let e = await X.doc("settings/games").get();
    return Ie.mergeConfig(e.exists ? e.data() : {});
  }
  function bn(e, t, a) {
    let n = e[t];
    if (!n.enabled) throw new ga("failed-precondition", "This game is currently disabled.");
    if (e.rtp > Ie.MAX_RTP) throw new ga("failed-precondition", "Game configuration is invalid.");
    if (a < n.minBet || a > n.maxBet) throw L.bad(`Bet must be between ${n.minBet} and ${n.maxBet}.`);
  }
  function An(e, t, a, n, s, o, r) {
    let i = L.planDebit(a.balances, s, ["main", "winning"]), c = {};
    for (let [d, u] of Object.entries(i)) c[d] = -u;
    L.applyDelta(e, t, c), L.ledger(e, { uid: n, type: "bet", direction: "out", amount: s, bucket: Object.keys(i)[0], note: o, ref: r }), L.bumpStats(e, { betVolume: s });
  }
  function Tn(e, t, a, n, s, o) {
    n <= 0 || (L.applyDelta(e, t, { winning: n }), L.ledger(e, { uid: a, type: "win", direction: "in", amount: n, bucket: "winning", note: s, ref: o }), L.bumpStats(e, { winPayout: n }));
  }
  lt.getGameConfig = St({ region: Ct }, async (e) => {
    L.authUid(e);
    let t = await wa(), a = {};
    for (let n of t.plinko.rows) {
      a[n] = {};
      for (let s of ["low", "medium", "high"]) a[n][s] = Ie.plinkoTable(n, s, t.rtp, t.plinko.maxMultiplier);
    }
    return { rtp: t.rtp, plinko: { ...t.plinko, tables: a }, wheel: t.wheel, rocket: t.rocket };
  });
  lt.playPlinko = St({ region: Ct }, async (e) => {
    let t = L.requireVerified(e), a = e.data || {}, n = await wa(), s = L.amountOf(a.bet, { label: "Bet" });
    bn(n, "plinko", s);
    let o = Number(a.rows), r = String(a.risk);
    if (!n.plinko.rows.includes(o) || !["low", "medium", "high"].includes(r)) throw L.bad("Invalid Plinko settings.");
    let i = Ie.plinkoTable(o, r, n.rtp, n.plinko.maxMultiplier), c = Ie.plinkoDrop(o), d = i[c.slot], u = L.round2(s * d), l = X.collection("gameHistory").doc();
    return await X.runTransaction(async (m) => {
      let p = X.doc(`users/${t}`), f = await m.get(p);
      L.assertActive(f.data()), An(m, p, f.data(), t, s, "plinko", l.id), Tn(m, p, t, u, "plinko", l.id), m.set(l, { uid: t, game: "plinko", bet: s, payout: u, multiplier: d, status: "settled", detail: { rows: o, risk: r, path: c.path, slot: c.slot }, at: yn.serverTimestamp() });
    }), { path: c.path, slot: c.slot, multiplier: d, payout: u, historyId: l.id };
  });
  lt.playWheel = St({ region: Ct }, async (e) => {
    let t = L.requireVerified(e), a = e.data || {}, n = await wa(), s = L.amountOf(a.bet, { label: "Bet" });
    bn(n, "wheel", s);
    let o = n.wheel.segments;
    if (!Array.isArray(o) || o.length < 2 || Ie.wheelRtp(o) > Ie.MAX_RTP) throw new ga("failed-precondition", "Wheel configuration is invalid.");
    let r = Ie.wheelSpin(o), i = o[r].mult, c = L.round2(s * i), d = X.collection("gameHistory").doc();
    return await X.runTransaction(async (u) => {
      let l = X.doc(`users/${t}`), m = await u.get(l);
      L.assertActive(m.data()), An(u, l, m.data(), t, s, "wheel", d.id), Tn(u, l, t, c, "wheel", d.id), u.set(d, { uid: t, game: "wheel", bet: s, payout: c, multiplier: i, status: "settled", detail: { segment: r, label: o[r].label }, at: yn.serverTimestamp() });
    }), { segment: r, label: o[r].label, multiplier: i, payout: c, historyId: d.id };
  });
  lt.rocketStart = St({ region: Ct }, async (e) => {
    let t = L.requireVerified(e), a = e.data || {}, n = await wa(), s = L.amountOf(a.bet, { label: "Bet" });
    bn(n, "rocket", s);
    let o = Ie.rocketCrashPoint(n.rtp, n.rocket.maxMultiplier), r = X.collection("rocketRounds").doc().id, i = Date.now();
    return await X.runTransaction(async (c) => {
      let d = X.doc(`users/${t}`), u = await c.get(d);
      L.assertActive(u.data()), An(c, d, u.data(), t, s, "rocket", r), c.set(X.doc(`rocketRounds/${r}`), { uid: t, bet: s, startedAt: i, status: "running", growth: n.rocket.growth }), c.set(X.doc(`rocketSecrets/${r}`), { crash: o }), c.set(X.doc(`gameHistory/${r}`), { uid: t, game: "rocket", bet: s, payout: 0, multiplier: 0, status: "running", detail: {}, at: yn.serverTimestamp() });
    }), { roundId: r, startedAt: i, growth: n.rocket.growth };
  });
  async function Fs(e, t, a) {
    return X.runTransaction(async (n) => {
      let s = X.doc(`rocketRounds/${t}`), [o, r] = await Promise.all([n.get(s), n.get(X.doc(`rocketSecrets/${t}`))]);
      if (!o.exists || o.data().uid !== e) throw new ga("not-found", "Round not found.");
      let i = o.data(), c = r.data().crash;
      if (i.status !== "running") return { status: i.status, crash: i.status === "running" ? void 0 : c, multiplier: i.cashedAt || null, payout: i.payout || 0 };
      let d = Date.now() - i.startedAt, u = Ie.rocketCrashTimeMs(c, i.growth), l = X.doc(`gameHistory/${t}`);
      if (d >= u)
        return n.update(s, { status: "crashed", payout: 0 }), n.update(l, { status: "settled", detail: { crash: c } }), { status: "crashed", crash: c, payout: 0 };
      let m = Ie.rocketMultiplierAt(d, i.growth);
      if (!a) return { status: "running", multiplier: m };
      let p = L.round2(i.bet * m);
      return Tn(n, X.doc(`users/${e}`), e, p, "rocket", t), n.update(s, { status: "cashed", payout: p, cashedAt: m }), n.update(l, { status: "settled", payout: p, multiplier: m, detail: { crash: c } }), { status: "cashed", multiplier: m, payout: p, crash: c };
    });
  }
  lt.rocketPoll = St({ region: Ct }, (e) => Fs(L.authUid(e), L.str((e.data || {}).roundId, { max: 80 }), !1));
  lt.rocketCashout = St({ region: Ct }, (e) => Fs(L.requireVerified(e), L.str((e.data || {}).roundId, { max: 80 }), !0));
});

// src/lotdraw.js
var ba = R((hd, zs) => {
  "use strict";
  var Ks = ye("crypto"), mt = W(), { db: Fe, FieldValue: Oi, HttpsError: vn } = mt, ya = (e) => Ks.createHash("sha256").update(String(e)).digest("hex"), Ws = (e, t, a) => parseInt(ya(`${e}:${t}:${a}`).slice(0, 12), 16) % a;
  async function Vs(e) {
    let t = Fe.doc(`lotteries/${e}/private/seed`), a = await t.get();
    if (a.exists) return a.data();
    let n = Ks.randomBytes(32).toString("hex"), s = ya(n);
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
  async function Ui(e, t) {
    if (!(await Fe.doc(`lotteries/${e}`).get()).exists) throw new vn("not-found", "Lottery not found.");
    return await Vs(e), Fe.runTransaction(async (n) => {
      let s = Fe.doc(`lotteries/${e}`), o = await n.get(s), r = o.data();
      if (!o.exists || !["open", "closed"].includes(r.status)) throw new vn("failed-precondition", "Lottery cannot be drawn.");
      let c = (await n.get(Fe.doc(`lotteries/${e}/private/seed`))).data().seed, d = await n.get(Fe.collection("lotteryTickets").where("lotteryId", "==", e).where("status", "==", "active"));
      if (d.empty) throw new vn("failed-precondition", "No tickets sold.");
      let u = d.docs.slice().sort((y, b) => (Number(y.data().number) || 0) - (Number(b.data().number) || 0)), l = u[Ws(c, e, u.length)], m = l.data(), p = mt.round2(r.prize), f = Fe.doc(`users/${m.uid}`), w = await n.get(f);
      return mt.applyDelta(n, f, { winning: p }), mt.ledger(n, { uid: m.uid, type: "lottery_win", direction: "in", amount: p, bucket: "winning", note: r.title, ref: e }), mt.notify(n, m.uid, "You won the lottery! \u{1F389}", `${r.title}: ${p} added to your winnings.`, "lottery"), n.update(l.ref, { status: "won" }), n.update(s, {
        status: "drawn",
        winnerUid: m.uid,
        winnerName: w.data().username || "",
        winnerTicket: m.number,
        drawnAt: Oi.serverTimestamp(),
        drawSeed: c,
        seedHash: ya(c),
        drawCount: u.length,
        drawBy: t === "auto" ? "auto" : "admin"
      }), mt.bumpStats(n, { lotteryPayout: p }), mt.audit(n, t === "auto" ? "system" : t, "lottery_drawn", { lotteryId: e, winner: m.uid, prize: p, auto: t === "auto" }), { winnerTicket: m.number, winnerUid: m.uid };
    });
  }
  zs.exports = { sha: ya, pickIndex: Ws, ensureSeed: Vs, drawLottery: Ui };
});

// src/engagement.js
var Xs = R((qt) => {
  "use strict";
  var gd = ye("crypto"), { onCall: Ta } = ne(), x = W(), { db: me, FieldValue: Aa, HttpsError: Le, REGION: va } = x;
  qt.buyLotteryTickets = Ta({ region: va }, async (e) => {
    let t = x.requireVerified(e), a = e.data || {}, n = x.str(a.lotteryId, { max: 80 }), s = Math.floor(x.amountOf(a.qty, { min: 1, max: 50, label: "Quantity" })), o = [];
    return (await me.doc(`lotteries/${n}`).get()).exists && await ba().ensureSeed(n), await me.runTransaction(async (r) => {
      let i = me.doc(`lotteries/${n}`), c = me.doc(`users/${t}`), [d, u] = await Promise.all([r.get(i), r.get(c)]);
      x.assertActive(u.data());
      let l = d.data();
      if (!d.exists || l.status !== "open") throw new Le("failed-precondition", "This lottery is closed.");
      if (l.endsAt && l.endsAt.toMillis() <= Date.now()) throw new Le("failed-precondition", "This lottery has ended.");
      if ((l.sold || 0) + s > l.totalTickets) throw new Le("failed-precondition", "Not enough tickets left.");
      let m = u.data().rg?.excludedUntil;
      if ((m?.toMillis ? m.toMillis() : Number(m) || 0) > Date.now()) throw new Le("failed-precondition", "You are on a self-exclusion break.");
      if (Number(l.maxPerUser) > 0 && (await r.get(me.collection("lotteryTickets").where("lotteryId", "==", n).where("uid", "==", t).count())).data().count + s > Number(l.maxPerUser))
        throw new Le("failed-precondition", `Maximum ${l.maxPerUser} tickets per player.`);
      let p = x.round2(l.price * s), f = x.planDebit(u.data().balances, p, ["main", "winning"]), w = {};
      for (let [y, b] of Object.entries(f)) w[y] = -b;
      x.applyDelta(r, c, w), x.ledger(r, { uid: t, type: "lottery", direction: "out", amount: p, bucket: Object.keys(f)[0], note: l.title, ref: n });
      for (let y = 1; y <= s; y++) {
        let b = (l.sold || 0) + y;
        o.push(b), r.set(me.collection("lotteryTickets").doc(), { lotteryId: n, lotteryTitle: l.title, uid: t, number: b, price: l.price, status: "active", createdAt: Aa.serverTimestamp() });
      }
      r.update(i, { sold: Aa.increment(s) }), x.bumpStats(r, { lotterySales: p });
    }), { ok: !0, numbers: o };
  });
  qt.adminDrawLottery = Ta({ region: va, timeoutSeconds: 120 }, async (e) => {
    let t = x.requireRole(e, ["super", "finance"]), a = x.str((e.data || {}).lotteryId, { max: 80 });
    return { ok: !0, winnerTicket: (await ba().drawLottery(a, t)).winnerTicket };
  });
  qt.adminCancelLottery = Ta({ region: va, timeoutSeconds: 300 }, async (e) => {
    let t = x.requireRole(e, ["super", "finance"]), a = x.str((e.data || {}).lotteryId, { max: 80 });
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
          let u = (await c.getAll(...i.map((m) => m.ref))).filter((m) => m.data().status === "active");
          if (!u.length) return;
          let l = x.round2(u.reduce((m, p) => m + p.data().price, 0));
          x.applyDelta(c, me.doc(`users/${r}`), { main: l }), x.ledger(c, { uid: r, type: "lottery_refund", direction: "in", amount: l, bucket: "main", note: "Lottery cancelled", ref: a }), x.notify(c, r, "Lottery cancelled", `${l} was refunded to your wallet.`, "lottery"), u.forEach((m) => c.update(m.ref, { status: "refunded" })), n += u.length;
        });
    }
    return x.audit(null, t, "lottery_cancelled", { lotteryId: a, refundedTickets: n }), { ok: !0, refundedTickets: n };
  });
  function Js(e, t) {
    let a = globalThis.crypto && globalThis.crypto.getRandomValues ? globalThis.crypto : ye("node:crypto").webcrypto, n = t - e + 1, s = new Uint32Array(1), o = Math.floor(4294967296 / n) * n, r;
    do
      a.getRandomValues(s), r = s[0];
    while (r >= o);
    return e + r % n;
  }
  function Bi(e) {
    let t = e.reduce((n, s) => n + s.weight, 0), a = Js(1, t);
    for (let n = 0; n < e.length; n++)
      if (a -= e[n].weight, a <= 0) return n;
    return e.length - 1;
  }
  var Li = (e) => (Array.isArray(e) ? e : []).map((t) => ({ amount: Math.round(Number(t && t.amount)), weight: Math.round(Number(t && t.weight)) })).filter((t) => t.amount > 0 && t.amount <= 1e6 && t.weight > 0 && t.weight <= 1e5).slice(0, 12), Ys = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 7);
  qt.claimBonus = Ta({ region: va }, async (e) => {
    let t = x.requireVerified(e), a = x.str((e.data || {}).bonusId, { max: 80 }), n = { once: 1 / 0, daily: 24 * 36e5, weekly: 168 * 36e5, monthly: 0 }, s = 0, o = -1;
    return await me.runTransaction(async (r) => {
      let [i, c, d] = await Promise.all([r.get(me.doc(`bonuses/${a}`)), r.get(me.doc(`users/${t}`)), r.get(me.doc(`bonusClaims/${t}_${a}`))]);
      x.assertActive(c.data());
      let u = i.data();
      if (!i.exists || !u.enabled) throw new Le("failed-precondition", "This bonus is not available.");
      let l = u.type in n ? u.type : "once";
      if (d.exists) {
        if (l === "once") throw new Le("already-exists", "You already claimed this bonus.");
        let p = d.data().lastClaimAt && d.data().lastClaimAt.toMillis ? d.data().lastClaimAt.toMillis() : Number(d.data().lastClaimMs) || 0;
        if (l === "monthly") {
          if (Ys(p) === Ys(Date.now())) throw new Le("failed-precondition", "Already claimed this month. Available again next month.");
        } else {
          let f = p + n[l] - Date.now();
          if (f > 0) throw new Le("failed-precondition", `Available again in ${Math.ceil(f / 6e4)} min.`);
        }
      }
      let m = Li(u.prizes);
      u.kind === "lucky" && m.length ? (o = Bi(m), s = m[o].amount) : u.kind === "random" && Number(u.maxAmount) > Number(u.amount) ? s = Js(Math.max(1, Math.round(u.amount)), Math.round(u.maxAmount)) : s = x.round2(u.amount), x.applyDelta(r, c.ref, { main: s }), x.ledger(r, { uid: t, type: "bonus", direction: "in", amount: s, bucket: "main", note: u.title, ref: a }), r.set(d.ref, { uid: t, bonusId: a, lastClaimAt: Aa.serverTimestamp(), lastClaimMs: Date.now(), lastAmount: s, count: Aa.increment(1) }, { merge: !0 }), x.bumpStats(r, { bonusPaid: s });
    }), { ok: !0, amount: s, prizeIndex: o };
  });
});

// src/ads.js
var Qs = R((Zs) => {
  "use strict";
  var { onCall: xi } = ne(), _t = W(), { db: ka, FieldValue: Sa } = _t;
  Zs.adEvent = xi({ region: _t.REGION }, async (e) => {
    let t = _t.authUid(e), a = e.data || {}, n = _t.str(a.adId, { max: 80, label: "Ad" }), s = a.type === "click" ? "click" : a.type === "view" ? "view" : "";
    if (!s) throw _t.bad("Invalid event.");
    let o = await ka.doc("settings/content").get();
    if (!(o.exists && Array.isArray(o.data().ads) ? o.data().ads : []).some((i) => i && i.id === n)) throw _t.bad("Unknown ad.");
    return await ka.runTransaction(async (i) => {
      let c = ka.doc(`adSeen/${n}_${t}`), d = await i.get(c), u = d.exists ? d.data() : {}, l = { updatedAt: Date.now() };
      s === "view" ? (l.views = Sa.increment(1), u.viewedAt || (l.uniqueViews = Sa.increment(1))) : (l.clicks = Sa.increment(1), u.clickedAt || (l.uniqueClicks = Sa.increment(1))), i.set(ka.doc(`stats/ad_${n}`), l, { merge: !0 }), i.set(c, { uid: t, [s === "view" ? "viewedAt" : "clickedAt"]: Date.now() }, { merge: !0 });
    }), { ok: !0 };
  });
});

// supa/shims/functions-scheduler.js
var Ca = R((bd, eo) => {
  "use strict";
  eo.exports = { onSchedule: (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "schedule", a;
  } };
});

// supa/shims/firebase-admin-firestore.js
var ao = R((Ad, to) => {
  "use strict";
  var { AggregateField: Gi, FieldValue: qi } = Pt();
  to.exports = { AggregateField: Gi, FieldValue: qi };
});

// src/ag/errors.js
var It = R((Td, so) => {
  "use strict";
  var _a = {
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
  }, no = (e) => _a[e] || { msg: "Unknown error", en: "Something went wrong. Please try again.", bn: "\u0995\u09BF\u099B\u09C1 \u098F\u0995\u099F\u09BE \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" }, ji = (e) => !!(_a[e] && _a[e].retry), kn = class extends Error {
    constructor(t, a = "") {
      super(`${t} ${no(t).msg}${a ? ` \u2014 ${a}` : ""}`), this.code = t, this.detail = a;
    }
  };
  so.exports = { CODES: _a, info: no, isRetryable: ji, AgError: kn };
});

// src/ag/config.js
var $a = R((vd, io) => {
  "use strict";
  var { db: oo } = W(), { AgError: Fi } = It(), Hi = 30 * 1e3, Ia = null, Sn = 0, ro = {
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
  async function Ki({ fresh: e = !1, requireSecret: t = !0 } = {}) {
    if (!e && Ia && Date.now() - Sn < Hi) return Ia;
    let [a, n] = await Promise.all([oo.doc("adminConfig/gameApi").get(), oo.doc("adminPrivate/gameApi").get()]), s = { ...ro, ...a.exists ? a.data() : {}, secretKey: n.exists ? String(n.data().secretKey || "") : "" };
    if (s.terminalType = s.terminalType === "PC" ? "PC" : "PHONE", Ia = s, Sn = Date.now(), t && (!s.baseUrl || !s.merchantCode || !s.secretKey)) throw new Fi("C20001", "Game API is not configured (base URL, merchant code, secret key).");
    return s;
  }
  function Wi() {
    Ia = null, Sn = 0;
  }
  io.exports = { loadConfig: Ki, clearConfigCache: Wi, DEFAULTS: ro };
});

// src/ag/sign.js
var In = R((kd, mo) => {
  "use strict";
  var Cn = ye("crypto"), Na = "HmacSHA256", Vi = {
    merchant: "x-merchant-code",
    timestamp: "x-timestamp",
    nonce: "x-nonce",
    sign: "x-sign",
    signType: "x-content-processing-type"
  };
  function co(e, t, a, n, s) {
    let o = s == null ? "" : Buffer.isBuffer(s) ? s.toString("utf8") : String(s);
    return String(e) + String(t) + String(a) + String(n) + o;
  }
  function _n(e, t, a, n, s, o = Na) {
    if (!e) throw new Error("Secret key missing");
    return Cn.createHmac("sha256", Buffer.from(String(e), "utf8")).update(Buffer.from(co(t, a, n, o, s), "utf8")).digest("hex");
  }
  function uo(e, t) {
    let a = String(e || "").toLowerCase(), n = String(t || "").toLowerCase();
    return !/^[0-9a-f]+$/.test(a) || a.length !== n.length ? !1 : Cn.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(n, "utf8"));
  }
  function zi(e, t, a, n, s, o, r = Na) {
    return uo(_n(e, t, a, n, s, r), o);
  }
  var lo = () => Cn.randomBytes(16).toString("hex");
  function Yi(e, t, a) {
    let n = Date.now().toString(), s = lo();
    return {
      "X-MERCHANT-CODE": t,
      "X-TIMESTAMP": n,
      "X-NONCE": s,
      "X-SIGN": _n(e, t, n, s, a),
      "X-CONTENT-PROCESSING-TYPE": Na
    };
  }
  function Ji(e, t) {
    if (!e) return "";
    if (typeof e.get == "function") return e.get(t) || "";
    let a = e[t] ?? e[t.toLowerCase()] ?? e[t.toUpperCase()];
    return Array.isArray(a) ? String(a[0]) : a == null ? "" : String(a);
  }
  mo.exports = { SIGN_TYPE: Na, HEADERS: Vi, rawString: co, sign: _n, verify: zi, safeEqualHex: uo, newNonce: lo, signedHeaders: Yi, header: Ji };
});

// src/ag/client.js
var Nn = R((Sd, wo) => {
  "use strict";
  var Xi = ye("crypto"), Ze = In(), po = It(), { db: Zi, FieldValue: Qi } = W(), $n = 12e3, ec = [400, 1200, 2500], tc = 30, fo = () => "TRACE_" + Xi.randomBytes(10).toString("hex").toUpperCase(), $e = class extends Error {
    /** kind: timeout | network | http | badjson | badsign | provider */
    constructor(t, a, n = {}) {
      super(a), this.kind = t, Object.assign(this, n);
    }
  }, ho = (e) => e instanceof $e && ["timeout", "network"].includes(e.kind) || e instanceof $e && e.kind === "http" && e.status >= 500 || e instanceof $e && e.kind === "provider" && po.isRetryable(e.code), ac = (e) => new Promise((t) => setTimeout(t, e)), go = (e) => e && e.success !== !1 && (e.code === "C10000" || e.code == null && e.success === !0);
  async function nc(e, t, a, n) {
    let s = { "Content-Type": "application/json", ...Ze.signedHeaders(e.secretKey, e.merchantCode, a) }, o = new AbortController(), r = setTimeout(() => o.abort(), $n), i, c;
    try {
      i = await n(e.baseUrl.replace(/\/+$/, "") + t, { method: "POST", headers: s, body: a, signal: o.signal }), c = await i.text();
    } catch (m) {
      throw new $e(
        m.name === "AbortError" ? "timeout" : "network",
        m.name === "AbortError" ? `Provider timed out after ${$n / 1e3}s` : `Could not reach provider: ${m.cause?.code || m.message}`
      );
    } finally {
      clearTimeout(r);
    }
    if (!i.ok) throw new $e("http", `Provider returned HTTP ${i.status}`, { status: i.status, body: String(c).slice(0, 300) });
    let d = Ze.header(i.headers, "X-SIGN"), u = e.verifyResponseSign || "auto";
    if (u !== "off" && (d || u === "strict") && !(d && Ze.verify(
      e.secretKey,
      Ze.header(i.headers, "X-MERCHANT-CODE") || e.merchantCode,
      Ze.header(i.headers, "X-TIMESTAMP"),
      Ze.header(i.headers, "X-NONCE"),
      c,
      d,
      Ze.header(i.headers, "X-CONTENT-PROCESSING-TYPE") || Ze.SIGN_TYPE
    )))
      throw new $e("badsign", "Provider response signature is invalid");
    let l;
    try {
      l = JSON.parse(c);
    } catch {
      throw new $e("badjson", "Provider returned a non-JSON response", { body: String(c).slice(0, 300) });
    }
    if (!go(l)) throw new $e("provider", `${l.code || "ERROR"}: ${l.msg || po.info(l.code).msg}`, { code: l.code || "C10001", providerMsg: l.msg });
    return l;
  }
  async function sc(e, t, a = {}, n = {}) {
    let s = n.fetchImpl || fetch, o = n.retries ?? 2, r = { reqTraceId: fo(), ...a }, i = JSON.stringify(r), c = Date.now(), d = 0, u = null, l = null;
    for (; d <= o; d++)
      try {
        l = await nc(e, t, i, s), u = null;
        break;
      } catch (m) {
        if (u = m, !ho(m) || d === o) break;
        await ac(ec[d] || 2500);
      }
    if (n.log !== !1) {
      let m = {
        endpoint: t,
        reqTraceId: r.reqTraceId,
        attempts: Math.min(d + 1, o + 1),
        ok: !u,
        code: u ? u.code || u.kind : l.code,
        message: u ? u.message : "",
        latencyMs: Date.now() - c,
        request: i.slice(0, 2e3),
        at: Qi.serverTimestamp(),
        expireAt: new Date(Date.now() + tc * 864e5)
      };
      Zi.collection("agApiLogs").add(m).catch(() => {
      });
    }
    if (u) throw u;
    return l;
  }
  wo.exports = { call: sc, trace: fo, ClientError: $e, isSuccess: go, transient: ho, TIMEOUT_MS: $n };
});

// src/ag/engine.js
var Eo = R((Cd, No) => {
  "use strict";
  var jt = ye("crypto"), { AgError: U } = It(), G = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, Ft = (e) => G(Math.max(0, e)).toFixed(2), oc = /^[A-Za-z0-9_\-.]{1,128}$/, Ao = 10;
  function oe(e, t, a = 128) {
    let n = e[t];
    if (n == null || String(n).trim() === "") throw new U(t === "playerId" ? "G20001" : "C10002", `${t} is required`);
    let s = String(n).trim();
    if (s.length > a) throw new U("C10002", `${t} too long`);
    return s;
  }
  function Ea(e, t) {
    let a = e[t];
    if (a == null || a === "") throw new U("C10002", `${t} is required`);
    if (typeof a != "number" && !/^\d+(\.\d+)?$/.test(String(a).trim())) throw new U("C10002", `${t} must be a non-negative decimal`);
    let n = Number(a);
    if (!Number.isFinite(n) || n < 0 || n > 1e12) throw new U("C10002", `${t} out of range`);
    return G(n);
  }
  function yo(e, t, a) {
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
  function bo(e, t) {
    let a = e[t];
    if (a == null || a === "") throw new U("C10002", `${t} is required`);
    let n = Number(a);
    if (!Number.isFinite(n) || n < 0) throw new U("C10002", `${t} must be a Unix ms timestamp`);
    return n;
  }
  function Ht(e) {
    let t = oe(e, "playerId");
    if (!oc.test(t)) throw new U("G20006", "playerId has an invalid format");
    return t;
  }
  function Kt(e, t) {
    let a = oe(e, "currencyCode", 16);
    if (t.currencyCode && a !== t.currencyCode) throw new U("G20005", `wallet currency is ${t.currencyCode}, got ${a}`);
    return a;
  }
  function pt(e) {
    let t = String(e);
    return /^[A-Za-z0-9_\-.:]{1,200}$/.test(t) && !/^\.+$/.test(t) && !t.startsWith("__") ? t : "h_" + jt.createHash("sha256").update(t).digest("hex");
  }
  function To(e) {
    let t = Object.keys(e || {}).filter((a) => a !== "reqTraceId").sort();
    return jt.createHash("sha256").update(JSON.stringify(t.map((a) => [a, e[a]]))).digest("hex");
  }
  var Qe = (e) => G((Number(e?.main) || 0) + (Number(e?.winning) || 0));
  function En(e, t) {
    if (Qe(e) + 1e-9 < t) return null;
    let a = G(t), n = {};
    for (let s of ["main", "winning"]) {
      let o = G(Math.min(Math.max(Number(e?.[s]) || 0, 0), a));
      o > 0 && (n[s] = o, a = G(a - o));
    }
    return a > 0 ? null : n;
  }
  function Rn(e, t, a) {
    let { db: n, FieldValue: s } = e, o = {}, r = {}, i = s.serverTimestamp();
    return {
      delta(c, d) {
        o[c] = G((o[c] || 0) + d);
      },
      stat(c, d) {
        r[c] = G((r[c] || 0) + d);
      },
      ledger(c, d, u, l, m, p, f) {
        l > 0 && t.set(n.collection("transactions").doc(), { uid: c, type: d, direction: u, amount: G(l), bucket: m, note: p, ref: f, createdAt: i });
      },
      flush() {
        let c = {};
        for (let [u, l] of Object.entries(o)) l !== 0 && (c[`balances.${u}`] = s.increment(l));
        Object.keys(c).length && t.update(a, c);
        let d = {};
        for (let [u, l] of Object.entries(r)) l !== 0 && (d[u] = s.increment(l));
        Object.keys(d).length && t.set(n.doc(`statsShards/ag_${jt.randomInt(0, Ao)}`), d, { merge: !0 });
      },
      after(c) {
        let d = { ...c || {} };
        for (let [u, l] of Object.entries(o)) d[u] = G((Number(d[u]) || 0) + l);
        return d;
      }
    };
  }
  function vo(e) {
    return "MB" + jt.createHash("sha1").update(String(e) + jt.randomBytes(4).toString("hex")).digest("hex").slice(0, 18).toUpperCase();
  }
  function ko(e, t, a) {
    if (e.status !== "active") throw new U("G30001", `account is ${e.status}`);
    let n = e.rg?.excludedUntil;
    if ((n?.toMillis ? n.toMillis() : Number(n) || 0) > a) throw new U("G30001", "player is self-excluded");
    if (t && t.status === "forced") throw new U("G30001", "session was force-logged-out");
  }
  async function Dn(e, t, a, n, s) {
    let { db: o, FieldValue: r } = e, i = To(a);
    return o.runTransaction(async (c) => {
      let d = o.doc(`agTransactions/${t}`), u = await c.get(d);
      if (u.exists) {
        let p = u.data();
        if (p.requestHash !== i) throw new U("G300016", `transactionId already used with a different payload (${t})`);
        return { data: p.response, replay: !0 };
      }
      let { data: l, record: m } = await s(c);
      return c.set(d, { ...n, ...m, requestHash: i, response: l, createdAt: r.serverTimestamp(), at: e.now }), { data: l, replay: !1 };
    });
  }
  async function So(e, t) {
    let a = Ht(t);
    Kt(t, e.cfg);
    let n = await e.db.doc(`users/${a}`).get();
    if (!n.exists) throw new U("G20006", a);
    return { balance: Ft(Qe(n.data().balances)) };
  }
  async function Co(e, t) {
    let a = Ht(t);
    Kt(t, e.cfg);
    let n = await e.db.doc(`users/${a}`).get();
    if (!n.exists) throw new U("G20006", a);
    let s = n.data(), o = String(e.cfg.siteUrl || "").replace(/\/+$/, ""), r = /^https:\/\//.test(s.photoURL || "") ? s.photoURL : e.cfg.defaultAvatarUrl || (o ? `${o}/icons/icon-192.png` : "");
    return { nickName: String(s.username || s.name || "Player").slice(0, 32), avatarUrl: r };
  }
  async function _o(e, t) {
    let a = Ht(t), n = Kt(t, e.cfg), s = oe(t, "gameCode"), o = oe(t, "roundId"), r = oe(t, "betId"), i = oe(t, "transactionId"), c = Ea(t, "betAmount"), d = oe(t, "timestamp", 40), { db: u } = e;
    return Dn(e, `bet_${pt(i)}`, t, { kind: "bet", transactionId: i, betId: r, roundId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: c, providerTime: d }, async (l) => {
      let m = u.doc(`users/${a}`), p = u.doc(`agBets/${pt(r)}`), f = u.doc(`agSessions/${a}`), [w, y, b] = await Promise.all([l.get(m), l.get(p), l.get(f)]);
      if (!w.exists) throw new U("G20006", a);
      let _ = w.data();
      ko(_, b.exists ? b.data() : null, e.now);
      let v = y.exists ? y.data() : null;
      if (v && v.status === "cancelled") throw new U("C10002", `bet ${r} was already cancelled`);
      if (v && v.uid !== a) throw new U("C10002", `bet ${r} belongs to another player`);
      let h = En(_.balances, c);
      if (!h) throw new U("G30003", `needs ${c}, has ${Qe(_.balances)}`);
      let T = Rn(e, l, m);
      for (let [I, H] of Object.entries(h)) T.delta(I, -H);
      T.ledger(a, "game_bet", "out", c, Object.keys(h)[0] || "main", s, r), T.stat("agBetVolume", c), T.stat("agBetCount", 1);
      let A = v?.merchantBetId || vo(r), $ = v?.debitPlan || {};
      l.set(p, {
        betId: r,
        merchantBetId: A,
        uid: a,
        playerId: a,
        gameCode: s,
        roundId: o,
        currencyCode: n,
        betAmount: G((v?.betAmount || 0) + c),
        debitPlan: { main: G(($.main || 0) + (h.main || 0)), winning: G(($.winning || 0) + (h.winning || 0)) },
        winAmount: v?.winAmount || 0,
        winReversed: v?.winReversed || 0,
        betRefunded: !1,
        status: v?.status === "settled" ? "settled" : "placed",
        isFree: !1,
        createdAt: v?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: v?.at || e.now
      }, { merge: !0 }), T.flush();
      let N = { merchantBetId: A, balance: Ft(Qe(T.after(_.balances))) };
      return { data: N, record: { merchantBetId: A, balanceAfter: N.balance, debitPlan: h } };
    });
  }
  async function Io(e, t) {
    let a = Ht(t), n = Kt(t, e.cfg), s = oe(t, "gameCode"), o = oe(t, "roundId"), r = oe(t, "betId"), i = oe(t, "transactionId"), c = Ea(t, "betAmount"), d = Ea(t, "winAmount"), u = yo(t, "isFree", !1), l = yo(t, "isEnd"), m = bo(t, "betTime"), p = bo(t, "settledTime"), f = oe(t, "type", 16);
    if (!["win", "bet_win"].includes(f)) throw new U("C10002", "type must be win or bet_win");
    let { db: w } = e;
    return Dn(e, `win_${pt(i)}`, t, { kind: "win", type: f, transactionId: i, betId: r, roundId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: c, winAmount: d, isFree: u, isEnd: l, betTime: m, settledTime: p }, async (y) => {
      let b = w.doc(`users/${a}`), _ = w.doc(`agBets/${pt(r)}`), v = w.doc(`agSessions/${a}`), [h, T, A] = await Promise.all([y.get(b), y.get(_), y.get(v)]);
      if (!h.exists) throw new U("G20006", a);
      let $ = h.data(), N = T.exists ? T.data() : null;
      if (N && N.uid !== a) throw new U("C10002", `bet ${r} belongs to another player`);
      if (N && N.status === "cancelled") throw new U("C10002", `bet ${r} was cancelled`);
      let I = Rn(e, y, b), H = {}, ee = f === "bet_win" && !u && c > 0;
      if (ee) {
        if (ko($, A.exists ? A.data() : null, e.now), H = En($.balances, c), !H) throw new U("G30003", `needs ${c}, has ${Qe($.balances)}`);
        for (let [ea, ta] of Object.entries(H)) I.delta(ea, -ta);
        I.ledger(a, "game_bet", "out", c, Object.keys(H)[0] || "main", s, r), I.stat("agBetVolume", c), I.stat("agBetCount", 1);
      }
      d > 0 && (I.delta("winning", d), I.ledger(a, "game_win", "in", d, "winning", s + (u ? " (free spin)" : ""), r), I.stat("agWinPayout", d)), !N && f === "win" && I.stat("agOrphanWins", 1);
      let j = N?.merchantBetId || vo(r), te = N?.debitPlan || {};
      y.set(_, {
        betId: r,
        merchantBetId: j,
        uid: a,
        playerId: a,
        gameCode: s,
        roundId: o,
        currencyCode: n,
        betAmount: G((N?.betAmount || 0) + (ee ? c : 0)),
        declaredBetAmount: c,
        debitPlan: { main: G((te.main || 0) + (H.main || 0)), winning: G((te.winning || 0) + (H.winning || 0)) },
        winAmount: G((N?.winAmount || 0) + d),
        winReversed: N?.winReversed || 0,
        betRefunded: N?.betRefunded || !1,
        isFree: u,
        isEnd: l,
        status: l ? "settled" : N?.status || "placed",
        betTime: m,
        settledTime: l ? p : N?.settledTime || null,
        createdAt: N?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: N?.at || e.now
      }, { merge: !0 }), I.flush();
      let qe = { merchantBetId: j, balance: Ft(Qe(I.after($.balances))) };
      return { data: qe, record: { merchantBetId: j, balanceAfter: qe.balance, debitPlan: H } };
    });
  }
  async function $o(e, t) {
    let a = Ht(t), n = Kt(t, e.cfg), s = oe(t, "gameCode"), o = oe(t, "betId"), r = oe(t, "merchantBetId"), i = Ea(t, "betAmount"), c = oe(t, "cancelType", 8).toUpperCase(), d = oe(t, "transactionId");
    if (!["BET", "WIN"].includes(c)) throw new U("C10002", "cancelType must be BET or WIN");
    let { db: u } = e;
    return Dn(e, `cancel_${pt(d)}`, t, { kind: "cancel", cancelType: c, transactionId: d, betId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: i, merchantBetId: r }, async (l) => {
      let m = u.doc(`users/${a}`), p = u.doc(`agBets/${pt(o)}`), [f, w] = await Promise.all([l.get(m), l.get(p)]);
      if (!f.exists) throw new U("G20006", a);
      let y = f.data(), b = Rn(e, l, m), _ = w.exists ? w.data() : null;
      if (_ && _.uid !== a) throw new U("C10002", `bet ${o} belongs to another player`);
      let v = 0, h = 0, T = "", A = e.FieldValue.serverTimestamp();
      if (!_)
        l.set(p, {
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
          for (let H of ["main", "winning"]) I[H] > 0 && b.delta(H, I[H]);
          v = G((I.main || 0) + (I.winning || 0)), b.ledger(a, "game_refund", "in", v, "main", `${s} bet cancelled`, o), b.stat("agBetVolume", -v), b.stat("agCancelCount", 1), Math.abs(v - i) > 1e-3 && (T = `refunded the ${v} actually debited (request said ${i})`);
        }
        l.set(p, { status: "cancelled", betRefunded: !0, cancelledAt: A, updatedAt: A }, { merge: !0 });
      } else {
        let I = G((_.winAmount || 0) - (_.winReversed || 0));
        if (I > 0) {
          let H = y.balances || {}, ee = G(Math.min(Math.max(Number(H.winning) || 0, 0), I)), j = G(Math.min(Math.max(Number(H.main) || 0, 0), G(I - ee))), te = G(I - ee - j);
          ee + te > 0 && b.delta("winning", -(ee + te)), j > 0 && b.delta("main", -j), h = I, b.ledger(a, "game_win_reversal", "out", h, "winning", `${s} win cancelled`, o), b.stat("agWinPayout", -h), b.stat("agCancelCount", 1), te > 0 && (T = `player balance short by ${te}; recorded as negative winning balance`, b.stat("agDebt", te));
        } else T = "nothing to reverse";
        l.set(p, { winReversed: G((_.winReversed || 0) + h), winCancelledAt: A, updatedAt: A }, { merge: !0 });
      }
      b.flush();
      let N = { merchantBetId: _?.merchantBetId || r, betId: o, balance: Ft(Qe(b.after(y.balances))), currencyCode: n };
      return { data: N, record: { refunded: v, reversed: h, note: T, balanceAfter: N.balance } };
    });
  }
  var rc = {
    "/wallet/balance": (e, t) => So(e, t),
    "/player/info": (e, t) => Co(e, t),
    "/wallet/bet": async (e, t) => (await _o(e, t)).data,
    "/wallet/win": async (e, t) => (await Io(e, t)).data,
    "/wallet/cancel": async (e, t) => (await $o(e, t)).data
  };
  No.exports = { ROUTES: rc, STAT_SHARDS: Ao, balance: So, playerInfo: Co, bet: _o, win: Io, cancel: $o, planDebit: En, safeId: pt, requestHash: To, playable: Qe, round2: G, money: Ft };
});

// src/ag/callbacks.js
var Po = R((_d, Mo) => {
  "use strict";
  var ic = ye("crypto"), He = In(), pe = It(), { ROUTES: Ro, requestHash: cc } = Eo(), dc = 24 * 36e5, uc = 90;
  function Ra(e, t = null, a) {
    return { success: e === "C10000", code: e, msg: a || pe.info(e).msg, data: e === "C10000" ? t : null };
  }
  function Do(e) {
    let t = String(e || "").split("?")[0].replace(/\/+$/, "");
    return Object.keys(Ro).find((a) => t === a || t.endsWith(a)) || null;
  }
  function lc(e, t) {
    let a = He.header(e, "x-forwarded-for");
    return (a ? a.split(",")[0] : t || "").trim();
  }
  var Mn = Va(), mc = (e, t) => Mn.run(() => pc(e, t));
  async function pc(e, t) {
    let a = Date.now(), n = Do(t.path), s = Buffer.isBuffer(t.rawBody) ? t.rawBody.toString("utf8") : String(t.rawBody ?? ""), o = null, r, i = "";
    try {
      if (t.method !== "POST") throw new pe.AgError("C10003", "POST required");
      if (!n) throw new pe.AgError("C10002", `unknown endpoint ${t.path}`);
      let m = t.headers || {}, p = He.header(m, "X-MERCHANT-CODE"), f = He.header(m, "X-TIMESTAMP"), w = He.header(m, "X-NONCE"), y = He.header(m, "X-SIGN"), b = He.header(m, "X-CONTENT-PROCESSING-TYPE");
      if (!p || !f || !w || !y || !b) throw new pe.AgError("C10003", "missing signature headers");
      if (w.length > 64 || y.length > 256) throw new pe.AgError("C10003", "header too long");
      if (!e.cfg.merchantCode || !e.cfg.secretKey) throw new pe.AgError("C20001", "merchant not configured on our side");
      if (p !== e.cfg.merchantCode) throw new pe.AgError("C20001", `unknown merchant ${p}`);
      if (b !== He.SIGN_TYPE) throw new pe.AgError("C10003", `unsupported signType ${b}`);
      let _ = Number(f), v = (Number(e.cfg.timestampToleranceSec) || 300) * 1e3;
      if (!/^\d{10,16}$/.test(f) || !Number.isFinite(_) || Math.abs(e.now - _) > v) throw new pe.AgError("C10003", "timestamp outside allowed window");
      if (!He.verify(e.cfg.secretKey, p, f, w, s, y, b)) throw new pe.AgError("C10004");
      let h = Array.isArray(e.cfg.callbackIpWhitelist) ? e.cfg.callbackIpWhitelist.filter(Boolean) : [];
      if (h.length && !h.includes(t.ip)) throw new pe.AgError("C10003", `IP ${t.ip} not allowed`);
      try {
        o = JSON.parse(s || "{}");
      } catch {
        throw new pe.AgError("C10002", "body is not valid JSON");
      }
      if (!o || typeof o != "object" || Array.isArray(o)) throw new pe.AgError("C10002", "body must be a JSON object");
      let T = e.db.doc(`agNonces/${ic.createHash("sha256").update(p + ":" + w).digest("hex")}`), A = cc(o);
      try {
        await T.create({ route: n, bodyHash: A, at: e.now, expireAt: new Date(e.now + dc) });
      } catch (N) {
        if (!(N.code === 6 || /ALREADY_EXISTS/i.test(String(N.message || N)))) throw N;
        let I = await T.get();
        if (!I.exists || I.data().bodyHash !== A) throw new pe.AgError("C10003", "nonce already used (replay)");
        i = "identical retry (same nonce + payload)";
      }
      let $ = await Ro[n](e, o);
      r = Ra("C10000", $);
    } catch (m) {
      m instanceof pe.AgError ? (r = Ra(m.code), i = m.detail || i) : (r = Ra("C10001"), i = String(m && m.stack || m).slice(0, 500));
    }
    Mn.mark("done");
    let c = Mn.summary();
    c && Date.now() - a > 1500 && (i = (i ? i + " | " : "") + "timing " + c);
    let d = JSON.stringify(r), u = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
    e.cfg.secretKey && e.cfg.merchantCode && Object.assign(u, He.signedHeaders(e.cfg.secretKey, e.cfg.merchantCode, d));
    let l = {
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
      expireAt: new Date(e.now + uc * 864e5)
    };
    return { status: t.method === "POST" ? 200 : 405, headers: u, body: d, log: l };
  }
  Mo.exports = { handle: mc, wrap: Ra, routeOf: Do, clientIp: lc };
});

// src/ag/platform.js
var Un = R((re) => {
  "use strict";
  var Uo = ye("net"), { onCall: Ne, onRequest: fc, HttpsError: et } = ne(), { onSchedule: Bo } = Ca(), { AggregateField: $t } = ao(), S = W(), { db: D, admin: hc, FieldValue: Z, REGION: he } = S, Nt = It(), { loadConfig: Ke, clearConfigCache: gc, DEFAULTS: Lo } = $a(), fe = Nn(), Oo = Po(), wc = ["slots", "live", "sports", "fishing", "lottery", "cards", "crash"], yc = (e = "", t = "", a = "") => {
    let n = `${e} ${t} ${a}`.toUpperCase();
    return /LIVE|BACCARAT|ROULETTE/.test(n) ? "live" : /SPORT/.test(n) ? "sports" : /FISH/.test(n) ? "fishing" : /LOTT|KENO|BINGO/.test(n) ? "lottery" : /CARD|POKER|RUMMY|TEEN|ANDAR|TABLE/.test(n) ? "cards" : /CRASH|AVIATOR|ROCKET/.test(n) ? "crash" : "slots";
  }, Pn = (e) => String(e).replace(/[\/\s]/g, "_").slice(0, 400), bc = ["BR_BRL", "GB_GBP", "DK_DKK", "DE_EUR", "ES_EUR", "FI_EUR", "FR_EUR", "ID_IDR", "IT_EUR", "NL_EUR", "NO_NOK", "PL_PLN", "PT_EUR", "TH_THB", "TR_TRY", "VN_VND", "MM_MMK", "SG_SGD", "NG_NGN", "US_USD", "PK_PKR", "CO_COP", "PH_PHP", "MX_MXN", "AR_ARS", "KE_KES", "CL_CLP", "ZA_ZAR", "BD_BDT", "IN_INR", "LK_LKR"], xo = ["en", "ar", "az", "bg", "bn", "cs", "da", "de", "el", "en-stkus", "es", "et", "fa", "fi", "fr", "hi", "hu", "hy", "id", "it", "ja", "ko", "lo", "lt", "mn", "my", "ms", "nl", "no", "pl", "pt", "pt-br", "ro", "ru", "sh", "si", "sk", "sq", "sv", "th", "tr", "uk", "ur", "uz", "vi"];
  function On(e, t = "Game service error") {
    if (e instanceof et) return e;
    if (e instanceof Nt.AgError || e instanceof fe.ClientError && e.kind === "provider") {
      let a = e.code || "C10001", n = Nt.info(a);
      return new et("failed-precondition", n.en, { agCode: a, bn: n.bn, providerMsg: e.providerMsg || e.detail || "", retry: Nt.isRetryable(a) });
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
  var xe = (e) => async (t) => {
    try {
      return await e(t);
    } catch (a) {
      throw On(a);
    }
  }, Ac = (e) => {
    let a = String(e.rawRequest?.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || String(e.rawRequest?.ip || "").replace(/^::ffff:/, "");
    return Uo.isIP(a) ? a : "";
  }, ft = (e, t, a, n) => {
    let s = Number(e);
    if (!Number.isInteger(s) || s < t || s > a) throw S.bad(`${n} must be a whole number ${t}-${a}.`);
    return s;
  }, Ma = (e, t) => {
    let a = S.str(e, { max: 40, label: t }), n = Date.parse(a);
    if (!Number.isFinite(n)) throw S.bad(`${t} must be an ISO-8601 date/time.`);
    return { s: new Date(n).toISOString(), ms: n };
  }, Da = /^[A-Za-z0-9-]{1,50}$/, Wt = /^[A-Za-z0-9_\-.]{1,128}$/;
  re.agCallback = fc({ region: he, timeoutSeconds: 30, memory: "256MiB", minInstances: 0, concurrency: 80, invoker: "public" }, async (e, t) => {
    let a;
    try {
      a = await Ke({ requireSecret: !1 });
    } catch {
      a = { ...Lo };
    }
    let n = await Oo.handle({ db: D, FieldValue: Z, cfg: a, now: Date.now() }, {
      method: e.method,
      path: e.path || e.url,
      headers: e.headers,
      rawBody: e.rawBody || Buffer.from(""),
      ip: Oo.clientIp(e.headers, e.ip)
    });
    D.collection("agCallbackLogs").add({ ...n.log, at: Z.serverTimestamp(), atMs: n.log.at }).catch((s) => console.error("log", s.message)), n.log.code === "C10001" && console.error("agCallback internal error", n.log.detail), t.status(n.status).set(n.headers).send(n.body);
  });
  re.adminSaveGameApiConfig = Ne({ region: he }, xe(async (e) => {
    let t = S.requireRole(e, ["super"]), a = e.data || {}, n = S.str(a.baseUrl, { max: 200, label: "Base URL", pattern: /^https:\/\/[^\s]+$/ }).replace(/\/+$/, ""), s = S.str(a.currencyCode || "BD_BDT", { max: 20, label: "Currency" });
    if (!bc.includes(s)) throw S.bad("Unsupported currency code (see PDF \xA72.7).");
    let o = S.str(a.lang || "bn", { max: 10, label: "Language" });
    if (!xo.includes(o)) throw S.bad("Unsupported language (see PDF \xA72.8).");
    let r = S.str(a.subMerchantCode || "site", { max: 50, label: "Sub-merchant code", pattern: Da }), i = a.siteUrl ? S.str(a.siteUrl, { max: 200, label: "Site URL", pattern: /^https:\/\/[^\s/]+(\/[^\s]*)?$/ }).replace(/\/+$/, "") : "", c = (Array.isArray(a.callbackIpWhitelist) ? a.callbackIpWhitelist : String(a.callbackIpWhitelist || "").split(/[\s,]+/)).map((l) => String(l).trim()).filter(Boolean);
    if (c.some((l) => !Uo.isIP(l))) throw S.bad("IP allow-list contains an invalid IP address.");
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
    let u = typeof a.secretKey == "string" && a.secretKey.trim().length > 0;
    return u && await D.doc("adminPrivate/gameApi").set({ secretKey: a.secretKey.trim(), rotatedAt: Z.serverTimestamp() }), await D.doc("adminConfig/gameApiStatus").set({ ok: !1, testedAt: null, message: "Configuration changed \u2014 run the connection test." }), gc(), S.audit(null, t, "game_api_config", { baseUrl: n, merchantCode: d.merchantCode, env: d.env, secretChanged: u }), { ok: !0 };
  }));
  re.adminGetGameApiConfig = Ne({ region: he }, xe(async (e) => {
    S.requireRole(e, ["super"]);
    let [t, a, n, s] = await Promise.all([D.doc("adminConfig/gameApi").get(), D.doc("adminPrivate/gameApi").get(), D.doc("adminConfig/gameApiStatus").get(), D.doc("adminConfig/agMerchant").get()]), o = String((globalThis.__ENV || process.env).SUPABASE_URL || "").replace(/\/+$/, ""), r = { ...Lo, ...t.exists ? t.data() : {} };
    return delete r.updatedAt, {
      config: r,
      secretSet: a.exists && !!a.data().secretKey,
      status: n.exists ? { ...n.data(), testedAt: n.data().testedAt?.toMillis?.() || null } : null,
      merchant: s.exists ? { ...s.data(), syncedAt: s.data().syncedAt?.toMillis?.() || null } : null,
      callbackUrls: [o ? `${o}/functions/v1/api/agw` : null].filter(Boolean)
    };
  }));
  re.adminTestGameApi = Ne({ region: he, timeoutSeconds: 60 }, async (e) => {
    S.requireRole(e, ["super"]);
    let t = Date.now(), a;
    try {
      let n = await Ke({ fresh: !0 }), o = ((await fe.call(n, "/game/v5/providers", {}, { retries: 0 })).data?.providers || []).length;
      a = { ok: !0, latencyMs: Date.now() - t, message: `Connected \u2014 ${o} provider(s) returned.`, providerCount: o };
    } catch (n) {
      let s = On(n);
      a = { ok: !1, latencyMs: Date.now() - t, message: n.message || s.message, agCode: s.details?.agCode || null, kind: n.kind || s.details?.kind || "config", httpStatus: n.status || null };
    }
    return await D.doc("adminConfig/gameApiStatus").set({ ...a, testedAt: Z.serverTimestamp() }), a;
  });
  re.adminSyncGames = Ne({ region: he, timeoutSeconds: 540, memory: "512MiB" }, xe(async (e) => {
    let t = S.requireRole(e, ["super", "content"]), a = await Ke({ fresh: !0 }), s = ((await fe.call(a, "/game/v5/providers", {})).data?.providers || []).map((u) => typeof u == "string" ? { name: u, code: u } : u);
    await D.doc("adminConfig/agProviders").set({ providers: s, syncedAt: Z.serverTimestamp() });
    let o = (await fe.call(a, "/game/v5/categories", { currencyCode: a.currencyCode, lang: a.lang })).data?.categoryDataList || [], r = 0, i = [], c = /* @__PURE__ */ new Set();
    for (let u of o) {
      let l = u.categoryCode || u.code;
      if (!l) continue;
      let m = (a.categoryMap || {})[l] || yc(l, u.categoryName), p = 0;
      for (let f = 1; f <= 200; f++) {
        let w = await fe.call(a, "/game/v5/games", { categoryCode: l, currencyCode: a.currencyCode, lang: a.lang, pageIndex: f }), y = w.data?.gameItemList || w.data?.gameltemList || [];
        if (!y.length) break;
        let b = D.batch();
        for (let v of y) {
          let h = v.gameCode;
          if (!h) continue;
          let T = Number.isInteger(Number(v.status)) ? Number(v.status) : 1;
          b.set(D.doc(`games/${Pn(h)}`), {
            gameCode: String(h),
            name: v.gameName || v.name || String(h),
            gameType: v.gameType || "",
            status: T,
            imageUrl: v.imageUrl || v.gameIcon || v.iconUrl || "",
            provider: v.providerCode || v.provider || "",
            categoryCode: l,
            categoryName: u.categoryName || l,
            lobbyCategory: m,
            syncedAt: Z.serverTimestamp()
          }, { merge: !0 }), c.add(String(h)), r++, p++;
        }
        await b.commit();
        let _ = Number(w.data?.totalSize) || 0;
        if (_ && p >= _) break;
      }
      i.push({ code: l, name: u.categoryName || l, lobby: m, count: p });
    }
    let d = D.batch();
    return i.forEach((u) => d.set(D.doc(`gameCategories/${Pn(u.code)}`), { ...u, syncedAt: Z.serverTimestamp() }, { merge: !0 })), await d.commit(), S.audit(null, t, "games_synced", { providers: s.length, categories: i.length, games: r, unique: c.size }), { ok: !0, providers: s.length, categories: i.length, games: c.size };
  }));
  function Tc(e, t) {
    let a = String(e.rawRequest?.headers?.origin || "").replace(/\/+$/, ""), n = [t.siteUrl, String((globalThis.__ENV || process.env).SITE_URL || "").replace(/\/+$/, "")].filter(Boolean);
    if (a && (n.includes(a) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(a))) return a;
    if (t.siteUrl) return t.siteUrl;
    throw new et("failed-precondition", "Set the Site URL in Admin \u2192 Game API (needed for the game exit page).");
  }
  re.launchGame = Ne({ region: he, timeoutSeconds: 30 }, xe(async (e) => {
    let t = S.requireVerified(e), a = e.data || {}, n = S.str(a.gameCode, { max: 120, label: "Game" }), [s, o, r] = await Promise.all([D.doc(`games/${Pn(n)}`).get(), D.doc(`users/${t}`).get(), Ke()]), i = o.data();
    S.assertActive(i);
    let c = i.rg?.excludedUntil;
    if ((c?.toMillis ? c.toMillis() : Number(c) || 0) > Date.now()) throw new et("failed-precondition", "You are on a self-exclusion break. Games are unavailable until it ends.");
    if (!s.exists || s.data().enabled === !1) throw new Nt.AgError("G20002");
    if (s.data().status === 0) throw new Nt.AgError("G20003");
    if (s.data().status === 2) throw new Nt.AgError("G20010");
    let d = Ac(e);
    if (!d) throw new et("failed-precondition", "Could not determine your IP address.");
    let u = a.terminalType === "PC" ? "PC" : a.terminalType === "PHONE" ? "PHONE" : r.terminalType, l = Tc(e, r), m = {
      gameCode: s.data().gameCode,
      playerId: t,
      currencyCode: r.currencyCode,
      language: xo.includes(a.language) ? a.language : r.lang,
      terminalType: u,
      returnUrl: `${l}/exitGame.html?game=${encodeURIComponent(s.data().gameCode)}`,
      ipAddress: d,
      subMerchantCode: r.subMerchantCode || "site",
      nickName: String(i.username || i.name || "Player").slice(0, 32)
    };
    /^https:\/\//.test(i.photoURL || "") && (m.avatarUrl = i.photoURL);
    let p = await fe.call(r, "/game/v5/game/url", m), f = p.data?.gameUrl || p.data?.url;
    if (!f || !/^https?:\/\//.test(f)) throw new et("unavailable", "The game provider did not return a game URL.");
    return await D.doc(`agSessions/${t}`).set({
      uid: t,
      status: "active",
      gameCode: s.data().gameCode,
      gameName: s.data().name || "",
      terminalType: u,
      ip: d,
      expireTime: p.data?.expireTime || null,
      launchedAt: Z.serverTimestamp(),
      launchedAtMs: Date.now(),
      closedAt: null,
      forcedAt: null
    }, { merge: !0 }), await D.collection("gameHistory").add({ uid: t, game: s.data().gameCode, provider: "ag", status: "launched", at: Z.serverTimestamp() }), { gameUrl: f, gameCode: s.data().gameCode, gameName: s.data().name || "", expireTime: p.data?.expireTime || null };
  }));
  re.agExitGame = Ne({ region: he }, xe(async (e) => {
    let t = S.authUid(e), a = D.doc(`agSessions/${t}`);
    return await D.runTransaction(async (n) => {
      let s = await n.get(a);
      s.exists && s.data().status === "active" && n.update(a, { status: "closed", closedAt: Z.serverTimestamp() });
    }), { ok: !0 };
  }));
  async function Go(e, t, a, { revokeTokens: n = !1, reason: s = "" } = {}) {
    let o = "SKIPPED", r = "";
    try {
      let i = await fe.call(e, "/game/v5/player/force/logout", { playerId: t });
      o = i.data?.logoutStatus || "SUCCESS", r = i.data?.message || "";
    } catch (i) {
      o = "FAILED", r = On(i).message;
    }
    return await D.doc(`agSessions/${t}`).set({ uid: t, status: "forced", forcedAt: Z.serverTimestamp(), forcedBy: a, forceReason: s, providerLogout: o }, { merge: !0 }), n && (await hc.auth().revokeRefreshTokens(t), await D.doc(`users/${t}`).set({ sessionsRevokedAt: Z.serverTimestamp() }, { merge: !0 })), await D.collection("users").doc(t).collection("notifications").add({
      title: "Signed out of games",
      body: s || "Your game session was ended by support.",
      type: "security",
      read: !1,
      createdAt: Z.serverTimestamp()
    }), { playerId: t, logoutStatus: o, message: r };
  }
  re.adminForceLogout = Ne({ region: he, timeoutSeconds: 300 }, xe(async (e) => {
    let t = S.requireRole(e, ["super", "support"]), a = e.data || {}, n = await Ke(), s = typeof a.reason == "string" ? a.reason.trim().slice(0, 200) : "", o = [];
    a.all === !0 ? o = (await D.collection("agSessions").where("status", "==", "active").limit(200).get()).docs.map((c) => c.id) : o = [S.str(a.uid, { max: 128, label: "Player", pattern: Wt })];
    let r = [];
    for (let i of o) r.push(await Go(n, i, t, { revokeTokens: a.revokeTokens === !0, reason: s }));
    return S.audit(null, t, "ag_force_logout", { count: r.length, all: a.all === !0, revokeTokens: a.revokeTokens === !0, failed: r.filter((i) => i.logoutStatus === "FAILED").length }), { ok: !0, results: r };
  }));
  re.forceLogoutOne = Go;
  re.adminAgRtp = Ne({ region: he, timeoutSeconds: 60 }, xe(async (e) => {
    let t = S.requireRole(e, ["super", "finance"]), a = e.data || {}, n = await Ke(), s = n.currencyCode, o, r = null;
    switch (a.action) {
      case "subMerchant": {
        let i = S.str(a.subMerchantCode || n.subMerchantCode, { max: 50, label: "Sub-merchant", pattern: Da }), c = ft(a.rtp, 1, 100, "RTP");
        o = await fe.call(n, "/game/v5/set/sub/merchant/rtp", { subMerchantCode: i, rtp: c, currencyCode: s }), r = { scope: "SUB_MERCHANT", subMerchantCode: i, rtp: c, changed: o.data?.changedRtpValue };
        break;
      }
      case "player": {
        let i = S.str(a.playerId, { max: 128, label: "Player", pattern: Wt }), c = ft(a.rtp, 1, 100, "RTP");
        o = await fe.call(n, "/game/v5/set/player/rtp", { currencyCode: s, rtp: c, playerId: i }), r = { scope: "PLAYER", playerId: i, rtp: c, changed: o.data?.changedRtpValue };
        break;
      }
      case "batch": {
        let i = [...new Set((Array.isArray(a.playerIds) ? a.playerIds : []).map((d) => String(d).trim()).filter(Boolean))];
        if (!i.length || i.length > 50) throw S.bad("Provide 1-50 player IDs.");
        if (i.some((d) => !Wt.test(d))) throw S.bad("One of the player IDs is invalid.");
        let c = ft(a.rtp, 1, 100, "RTP");
        o = await fe.call(n, "/game/v5/batch/set/player/rtp", { currencyCode: s, rtp: c, playerIds: i }), r = { scope: "BATCH", playerIds: i, rtp: c, accepted: !0 };
        break;
      }
      case "effective": {
        let i = { currencyCode: s };
        a.subMerchantCode && (i.subMerchantCode = S.str(a.subMerchantCode, { max: 50, pattern: Da, label: "Sub-merchant" })), a.playerId && (i.playerId = S.str(a.playerId, { max: 128, pattern: Wt, label: "Player" })), o = await fe.call(n, "/game/v5/rtp/effective", i);
        break;
      }
      case "history": {
        let i = Ma(a.startTime, "Start time"), c = Ma(a.endTime, "End time");
        if (i.ms >= c.ms) throw S.bad("Start time must be before end time.");
        if (i.ms < Date.now() - 31 * 864e5) throw S.bad("Only the past month can be queried (PDF \xA75.4.4).");
        let d = { currencyCode: s, startTime: i.s, endTime: c.s, pageSize: ft(a.pageSize ?? 20, 1, 100, "Page size") };
        a.cursor && (d.cursor = S.str(a.cursor, { max: 200, label: "Cursor" })), a.subMerchantCode && (d.subMerchantCode = S.str(a.subMerchantCode, { max: 50, pattern: Da, label: "Sub-merchant" })), a.playerId && (d.playerId = S.str(a.playerId, { max: 128, pattern: Wt, label: "Player" })), Array.isArray(a.playerIds) && a.playerIds.length && (d.playerIds = a.playerIds.slice(0, 50).map(String)), o = await fe.call(n, "/game/v5/rtp/change/history", d);
        break;
      }
      default:
        throw S.bad("Unknown RTP action.");
    }
    return r && (await D.collection("agRtpChanges").add({ ...r, currencyCode: s, by: t, at: Z.serverTimestamp() }), S.audit(null, t, "ag_rtp_change", r)), { ok: !0, data: o.data ?? {} };
  }));
  async function qo(e, { startIso: t, endIso: a, pageNum: n, pageSize: s, sort: o }) {
    let i = (await fe.call(e, "/game/v5/game/record", { pageNum: n, pageSize: s, reqData: { startTime: t, endTime: a, sort: o } })).data?.gameRecordList || [];
    if (i.length) {
      let c = D.batch();
      for (let d of i) {
        if (d.orderNo === void 0 || d.orderNo === null) continue;
        let u = d.playerId || d.playerUniqueId || "", l = Number(d.betAmount) || 0, m = Number(d.winAmount) || 0;
        c.set(D.doc(`agGameRecords/${String(d.orderNo)}`), {
          orderNo: String(d.orderNo),
          playerId: u,
          uid: u,
          betAmount: l,
          winAmount: m,
          ggr: Math.round((l - m) * 100) / 100,
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
  re.adminAgGameRecords = Ne({ region: he, timeoutSeconds: 120 }, xe(async (e) => {
    S.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = await Ke(), n = Ma(t.startTime, "Start time"), s = Ma(t.endTime, "End time");
    if (n.ms >= s.ms) throw S.bad("Start time must be before end time.");
    let o = await qo(a, { startIso: n.s, endIso: s.s, pageNum: ft(t.pageNum ?? 1, 1, 1e5, "Page"), pageSize: ft(t.pageSize ?? 20, 1, 100, "Page size"), sort: t.sort !== !1 });
    return { ok: !0, records: o, hasMore: o.length >= (Number(t.pageSize) || 20) };
  }));
  async function jo(e) {
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
  re.adminAgMerchantInfo = Ne({ region: he, timeoutSeconds: 60 }, xe(async (e) => (S.requireRole(e, ["super", "finance"]), { ok: !0, merchant: { ...await jo(await Ke({ fresh: !0 })), syncedAt: Date.now() } })));
  re.adminAgReport = Ne({ region: he, timeoutSeconds: 60 }, xe(async (e) => {
    S.requireRole(e, ["super", "finance"]);
    let t = e.data || {}, a = Number(t.from) || Date.now() - 864e5, n = Number(t.to) || Date.now();
    if (a >= n || n - a > 400 * 864e5) throw S.bad("Invalid date range.");
    let s = D.collection("agBets").where("at", ">=", a).where("at", "<", n), [o, r, i, c] = await Promise.all([
      s.aggregate({ bets: $t.sum("betAmount"), wins: $t.sum("winAmount"), reversed: $t.sum("winReversed"), n: $t.count() }).get(),
      s.where("status", "==", "cancelled").aggregate({ refunded: $t.sum("betAmount"), n: $t.count() }).get(),
      D.collection("statsShards").get(),
      D.collection("agSessions").where("status", "==", "active").count().get()
    ]), d = o.data(), u = r.data(), l = (d.bets || 0) - (u.refunded || 0), m = (d.wins || 0) - (d.reversed || 0), p = {};
    return i.docs.filter((f) => f.id.startsWith("ag_")).forEach((f) => {
      for (let [w, y] of Object.entries(f.data())) p[w] = Math.round(((p[w] || 0) + (Number(y) || 0)) * 100) / 100;
    }), {
      ok: !0,
      range: { from: a, to: n },
      betCount: d.n || 0,
      cancelledCount: u.n || 0,
      turnover: Math.round(l * 100) / 100,
      payout: Math.round(m * 100) / 100,
      ggr: Math.round((l - m) * 100) / 100,
      rtpActual: l > 0 ? Math.round(m / l * 1e4) / 100 : null,
      activeSessions: c.data().count,
      lifetime: p
    };
  }));
  re.agScheduledSync = Bo({ region: he, schedule: "every 30 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    let e;
    try {
      e = await Ke({ fresh: !0 });
    } catch {
      return;
    }
    try {
      await jo(e);
    } catch (a) {
      console.error("merchant sync", a.message);
    }
    try {
      let a = /* @__PURE__ */ new Date(), n = new Date(a.getTime() - 40 * 6e4);
      for (let s = 1; s <= 50 && !((await qo(e, { startIso: n.toISOString(), endIso: a.toISOString(), pageNum: s, pageSize: 100, sort: !1 })).length < 100); s++)
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
  re.agCleanup = Bo({ region: he, schedule: "every day 04:10", timeZone: "Asia/Dhaka", timeoutSeconds: 540 }, async () => {
    let e = /* @__PURE__ */ new Date();
    for (let t of ["agNonces", "agCallbackLogs", "agApiLogs"])
      for (let a = 0; a < 40; a++) {
        let n = await D.collection(t).where("expireAt", "<", e).limit(400).get();
        if (n.empty) break;
        let s = D.batch();
        n.docs.forEach((o) => s.delete(o.ref)), await s.commit();
      }
  });
  re.LOBBY = wc;
});

// src/account.js
var Fo = R((Vt) => {
  "use strict";
  var { onCall: Oa } = ne(), Te = W(), { db: ht, admin: Bn, FieldValue: Pa, HttpsError: vc, REGION: Ua } = Te;
  Vt.setResponsibleGaming = Oa({ region: Ua }, async (e) => {
    let t = Te.authUid(e), a = e.data || {}, n = ht.doc(`users/${t}`), s = {};
    if (await ht.runTransaction(async (o) => {
      let r = await o.get(n);
      Te.assertActive(r.data());
      let i = { ...r.data().rg || {} }, c = Date.now();
      if (i.pendingLimitAt && i.pendingLimitAt <= c && (i.dailyDepositLimit = i.pendingLimit, delete i.pendingLimit, delete i.pendingLimitAt), a.dailyDepositLimit !== void 0) {
        let d = Number(a.dailyDepositLimit) || 0;
        if (d < 0 || d > 1e8) throw Te.bad("Invalid limit.");
        let u = Number(i.dailyDepositLimit) || 0;
        d > 0 && (u === 0 || d < u) ? (i.dailyDepositLimit = Te.round2(d), delete i.pendingLimit, delete i.pendingLimitAt, s.applied = "now") : d !== u && (i.pendingLimit = Te.round2(d), i.pendingLimitAt = c + 24 * 36e5, s.applied = "in24h");
      }
      if (a.excludeDays !== void 0) {
        let d = Number(a.excludeDays);
        if (![1, 7, 30, 90, 180, 365].includes(d)) throw Te.bad("Choose 1, 7, 30, 90, 180 or 365 days.");
        let u = c + d * 864e5, l = i.excludedUntil?.toMillis ? i.excludedUntil.toMillis() : Number(i.excludedUntil) || 0;
        i.excludedUntil = Math.max(l, u), s.excludedUntil = i.excludedUntil, o.set(ht.doc(`agSessions/${t}`), { uid: t, status: "forced", forcedAt: Pa.serverTimestamp(), forceReason: "self-exclusion" }, { merge: !0 });
      }
      o.update(n, { rg: i }), s.rg = i;
    }), s.excludedUntil)
      try {
        let { loadConfig: o } = $a();
        await Nn().call(await o(), "/game/v5/player/force/logout", { playerId: t }, { retries: 1 });
      } catch (o) {
        console.warn("self-exclusion provider logout", o.message);
      }
    return { ok: !0, ...s };
  });
  Vt.revokeMySessions = Oa({ region: Ua }, async (e) => {
    let t = Te.authUid(e);
    return await Bn.auth().revokeRefreshTokens(t), await ht.doc(`users/${t}`).set({ sessionsRevokedAt: Pa.serverTimestamp() }, { merge: !0 }), await ht.collection("loginHistory").add({ uid: t, event: "logout_all", at: Pa.serverTimestamp() }), { ok: !0 };
  });
  Vt.adminListStaff = Oa({ region: Ua }, async (e) => (Te.requireRole(e, ["super"]), { staff: (await ht.collection("users").where("role", "in", Te.STAFF_ROLES).limit(100).get()).docs.map((a) => ({ uid: a.id, name: a.data().name || "", username: a.data().username || "", email: a.data().email || "", role: a.data().role, status: a.data().status })) }));
  Vt.adminSignOutUser = Oa({ region: Ua, timeoutSeconds: 60 }, async (e) => {
    let t = Te.requireRole(e, ["super", "support"]), a = Te.str((e.data || {}).uid, { max: 128, label: "User" });
    if (!await Bn.auth().getUser(a).catch(() => null)) throw new vc("not-found", "User not found.");
    await Bn.auth().revokeRefreshTokens(a), await ht.doc(`users/${a}`).set({ sessionsRevokedAt: Pa.serverTimestamp() }, { merge: !0 });
    try {
      let { loadConfig: s } = $a(), { forceLogoutOne: o } = Un();
      await o(await s(), a, t, { reason: "Signed out by support" });
    } catch (s) {
      console.warn("provider logout", s.message);
    }
    return Te.audit(null, t, "user_signed_out", { uid: a }), { ok: !0 };
  });
});

// src/fswrite.js
var Jo = R((Yo) => {
  "use strict";
  var { onCall: kc } = ne(), gt = W(), { db: Ho, HttpsError: Wo, REGION: Sc } = gt, { merge: Ko, setPath: Cc, plain: _c } = Pt(), ve = (e) => typeof e == "number" && Number.isFinite(e), We = (e) => typeof e == "string", Vo = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  }, Ee = (e, t) => t.includes(Vo(e)), zo = (e) => new Wo("permission-denied", e || "You do not have permission."), Ic = (e, t) => [.../* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])].filter((n) => JSON.stringify((e || {})[n]) !== JSON.stringify((t || {})[n])), Ba = (e, t, a) => Ic(e, t).every((n) => a.includes(n)), E = (e, t) => {
    if (!e) throw zo(t);
  };
  function $c(e, t, a, n, s, o) {
    let r = a.split("/"), i = Vo(e) !== null;
    if (r[0] === "users" && r.length === 2) {
      E(n === "update" && t === r[1], "Not allowed."), E(Ba(s, o, ["name", "phone", "photoURL", "lastSeenAt"]), "You cannot change that field."), E(We(o.name) && o.name.length >= 2 && o.name.length <= 60, "Name must be 2-60 characters."), E(We(o.phone) && /^\+?[0-9]{8,15}$/.test(o.phone), "Invalid phone number."), E(We(o.photoURL) && o.photoURL.length < 600, "Invalid photo.");
      return;
    }
    if (r[0] === "users" && r[2] === "notifications" && r.length === 4) {
      if (E(t === r[1], "Not allowed."), n === "delete") return;
      E(n === "update" && Ba(s, o, ["read"]) && typeof o.read == "boolean", "Not allowed.");
      return;
    }
    if (r[0] === "users" && r[2] === "devices" && r.length === 4) {
      if (E(t === r[1], "Not allowed."), n === "delete") return;
      E(Object.keys(o).every((c) => ["platform", "updatedAt"].includes(c)) && We(o.platform), "Invalid device.");
      return;
    }
    if (r[0] === "users" && r[2] === "private" && r[3] === "withdrawAccounts" && r.length === 4) {
      if (E(t === r[1], "Not allowed."), n === "delete") return;
      E(Object.keys(o).every((c) => ["list", "updatedAt"].includes(c)) && Array.isArray(o.list) && o.list.length <= 6, "Invalid saved accounts.");
      return;
    }
    if (r[0] === "paymentMethods" && r.length === 2) {
      if (E(Ee(e, ["super", "finance"])), n === "delete") return;
      E(We(o.name) && o.name.length > 0 && o.name.length <= 60 && typeof o.enabled == "boolean", "Invalid payment method."), E(o.type === void 0 || ["deposit", "withdraw", "both"].includes(o.type), "Invalid type."), E(o.minAmount === void 0 || ve(o.minAmount) && o.minAmount >= 0, "Invalid minimum."), E(o.cardChangeFee === void 0 || ve(o.cardChangeFee) && o.cardChangeFee >= 0 && o.cardChangeFee <= 1e5, "Invalid card change fee."), E(o.cardLock === void 0 || typeof o.cardLock == "boolean", "Invalid card lock."), E(["logo", "cardBg"].every((c) => o[c] === void 0 || We(o[c]) && o[c].length <= 300), "Invalid logo.");
      return;
    }
    if (r[0] === "paymentAccounts" && r.length === 2) {
      if (E(Ee(e, ["super", "finance"])), n === "delete") return;
      E(We(o.methodId) && We(o.accountNumber) && ["active", "standby", "cooldown", "paused", "disabled", "maintenance", "locked", "archived"].includes(o.status) && ve(o.dailyLimit) && ve(o.monthlyLimit), "Invalid payment account."), E(["bankName", "branch"].every((c) => o[c] === void 0 || typeof o[c] == "string" && o[c].length <= 60), "Invalid bank details."), E(o.cycleLimit === void 0 || ve(o.cycleLimit) && o.cycleLimit >= 0 && o.cycleLimit <= 1e8, "Invalid cycle limit."), E(o.cooldownDays === void 0 || ve(o.cooldownDays) && o.cooldownDays >= 0 && o.cooldownDays <= 365, "Invalid cooldown.");
      return;
    }
    if (r[0] === "paymentAccounts" && r[2] === "private" && r.length === 4) {
      E(Ee(e, ["super", "finance"]));
      return;
    }
    if ((r[0] === "banners" || r[0] === "legal") && r.length === 2) {
      E(Ee(e, ["super", "content"]));
      return;
    }
    if (r[0] === "bonuses" && r.length === 2) {
      if (E(Ee(e, ["super", "content", "finance"])), n === "delete") return;
      E(We(o.title) && ve(o.amount) && o.amount > 0 && o.amount <= 1e6 && ["once", "daily", "weekly", "monthly"].includes(o.type) && typeof o.enabled == "boolean", "Invalid bonus."), E(o.kind === void 0 || ["fixed", "random", "lucky"].includes(o.kind), "Invalid bonus kind."), E(o.maxAmount === void 0 || ve(o.maxAmount) && o.maxAmount >= o.amount && o.maxAmount <= 1e6, "Maximum must be \u2265 minimum (up to 1,000,000)."), E(o.prizes === void 0 || Array.isArray(o.prizes) && o.prizes.length <= 12 && o.prizes.every((c) => c && ve(c.amount) && c.amount > 0 && c.amount <= 1e6 && ve(c.weight) && c.weight > 0 && c.weight <= 1e5), "Invalid prizes (max 12)."), E(o.kind !== "lucky" || Array.isArray(o.prizes) && o.prizes.length >= 2, "A lucky draw needs at least 2 prizes.");
      return;
    }
    if (r[0] === "lotteries" && r.length === 2) {
      if (E(Ee(e, ["super", "content"])), n === "delete") {
        E(s && s.sold === 0, "Tickets were already sold.");
        return;
      }
      if (!s) {
        E(o.sold === 0 && o.status === "open" && ve(o.price) && ve(o.prize) && ve(o.totalTickets), "Invalid lottery.");
        return;
      }
      E(Ba(s, o, ["title", "price", "prize", "endsAt", "totalTickets", "maxPerUser", "imageUrl", "status", "autoDraw"]), "You cannot change that field."), E(["open", "closed"].includes(o.status) && ["open", "closed"].includes(s.status) && o.totalTickets >= s.sold, "Invalid lottery.");
      return;
    }
    if (r[0] === "games" && r.length === 2) {
      E(n === "update" && Ee(e, ["super", "content"]) && Ba(s, o, ["enabled", "featured", "sort", "lobbyCategory", "name", "imageUrl"]), "Not allowed.");
      return;
    }
    if (r[0] === "settings" && r.length === 2) {
      let c = r[1];
      E(c === "support" && Ee(e, ["super", "support"]) || c === "content" && Ee(e, ["super", "content", "support"]) || c === "site" && Ee(e, ["super", "finance"]) || !["support", "content", "site"].includes(c) && Ee(e, ["super"]), "Not allowed.");
      return;
    }
    throw zo("Not allowed.");
  }
  Yo.fsWrite = kc({ region: Sc }, async (e) => {
    let t = gt.authUid(e), a = (e.data || {}).ops;
    if (!Array.isArray(a) || !a.length || a.length > 400) throw gt.bad("Invalid request.");
    return await Ho.runTransaction(async (n) => {
      let s = [];
      for (let o of a) {
        let r = gt.str(o.path, { max: 300, label: "Path" });
        if (!/^[A-Za-z0-9_\-./]+$/.test(r) || r.includes("..") || r.split("/").length % 2 !== 0) throw gt.bad("Invalid path.");
        let i = Ho.doc(r), c = await n.get(i), d = c.exists ? c.data() : void 0, u = o.op === "create" ? "set" : o.op;
        if (!["set", "update", "delete"].includes(u)) throw gt.bad("Invalid operation.");
        let l;
        if (u === "delete") l = void 0;
        else {
          let m = _c(o.data || {});
          if (typeof m != "object" || Array.isArray(m)) throw gt.bad("Invalid data.");
          if (u === "update") {
            if (!d) throw new Wo("not-found", "Document not found.");
            l = JSON.parse(JSON.stringify(d));
            for (let [p, f] of Object.entries(m)) Cc(l, p, f);
          } else l = o.merge && d ? Ko(JSON.parse(JSON.stringify(d)), m) : Ko({}, m);
        }
        $c(e, t, r, u === "delete" ? "delete" : d ? "update" : "create", d, l), s.push({ ref: i, type: u, data: o.data, merge: !!o.merge });
      }
      for (let o of s)
        o.type === "delete" ? n.delete(o.ref) : o.type === "update" ? n.update(o.ref, o.data) : n.set(o.ref, o.data, { merge: o.merge });
    }), { ok: !0 };
  });
});

// src/rotation.js
var er = R((zt) => {
  "use strict";
  var { onCall: xn } = ne(), { onSchedule: Nc } = Ca(), ke = W(), La = on(), { db: Re, FieldValue: Ec, HttpsError: Ln, REGION: xa } = ke, Ga = La.n0, Xo = async () => {
    let e = await ke.siteSettings();
    return Math.max(1, Ga((e.deposit || {}).min) || 1);
  }, Zo = (e) => e && typeof e.toMillis == "function" ? e.toMillis() : Ga(e);
  async function Qo(e = Date.now()) {
    let t = await Xo(), a = await Re.collection("paymentMethods").get(), n = 0;
    for (let i of a.docs)
      (await Re.runTransaction((d) => La.rotateTx(d, i.id, { now: e, min: t, reason: "tick" }))).changed.length && n++;
    let s = await ke.siteSettings(), o = Ga((s.deposit || {}).expireHours), r = 0;
    if (o > 0) {
      let i = await Re.collection("deposits").where("status", "==", "pending").limit(200).get();
      for (let c of i.docs) {
        let d = c.data();
        if (!d.createdAt || Zo(d.createdAt) > e - o * 36e5) continue;
        await Re.runTransaction(async (l) => {
          let m = await l.get(c.ref);
          return !m.exists || m.data().status !== "pending" ? !1 : (d.accountId && await La.rotateTx(l, d.methodId, { now: e, min: t, settle: { accountId: d.accountId, amount: d.amount, outcome: "release" } }), l.update(c.ref, { status: "expired", note: "Expired: not reviewed in time", reviewedAt: Ec.serverTimestamp(), reviewedBy: "system" }), ke.notify(l, d.uid, "Deposit expired", "Your deposit request expired. Please contact support if you already paid.", "deposit"), ke.bumpStats(l, { pendingDeposits: -1 }), ke.audit(l, "system", "deposit_expired", { depositId: c.id, amount: d.amount }), !0);
        }) && r++;
      }
    }
    return { rotated: n, expired: r };
  }
  zt.paymentRotationTick = Nc({ region: xa, schedule: "every 10 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    await Qo();
  });
  zt.paymentSync = xn({ region: xa }, async (e) => {
    let t = ke.authUid(e), a = e.auth.token.admin === !0 && ["super", "finance"].includes(e.auth.token.role), n = Re.doc("system/paymentTick"), s = await n.get(), o = s.exists ? Ga(s.data().at) : 0;
    return !(a && (e.data || {}).force) && Date.now() - o < 45e3 ? { ok: !0, skipped: !0 } : (await n.set({ at: Date.now(), by: t }, { merge: !0 }), { ok: !0, ...await Qo() });
  });
  var Rc = ["activate", "pause", "resume", "reset"];
  zt.paymentAccountAction = xn({ region: xa }, async (e) => {
    let t = ke.requireRole(e, ["super", "finance"]), a = e.data || {}, n = ke.str(a.accountId, { max: 120, label: "Account" }), s = a.action;
    if (!Rc.includes(s)) throw ke.bad("Invalid action.");
    let o = await Xo(), i = await Re.doc(`paymentAccounts/${n}`).get();
    if (!i.exists) throw new Ln("not-found", "Account not found.");
    let c = i.data().methodId;
    return await Re.runTransaction(async (d) => {
      let l = (await La.rotateTx(d, c, { now: Date.now(), min: o, force: { [s]: n }, reason: "manual" })).accounts.find((m) => m.id === n);
      if (!l) throw new Ln("not-found", "Account not found.");
      ke.audit(d, t, `payment_account_${s}`, { accountId: n, number: l.accountNumber || "", methodId: c });
    }).catch((d) => {
      throw d;
    }), { ok: !0 };
  });
  zt.paymentAccountHistory = xn({ region: xa }, async (e) => {
    ke.requireRole(e, ["super", "finance"]);
    let t = ke.str((e.data || {}).accountId, { max: 120, label: "Account" }), a = await Re.doc(`paymentAccounts/${t}`).get();
    if (!a.exists) throw new Ln("not-found", "Account not found.");
    let [n, s, o] = await Promise.all([
      Re.collection("paymentCycles").where("accountId", "==", t).get(),
      Re.collection("deposits").where("accountId", "==", t).limit(200).get(),
      Re.collection("paymentRotationLogs").where("methodId", "==", a.data().methodId).limit(200).get()
    ]), r = (i) => JSON.parse(JSON.stringify(i));
    return {
      cycles: n.docs.map((i) => r(i.data())).sort((i, c) => c.cycleNo - i.cycleNo),
      deposits: s.docs.map((i) => ({ id: i.id, amount: i.data().amount, status: i.data().status, trxId: i.data().trxId, username: i.data().username, at: Zo(i.data().createdAt) })).sort((i, c) => c.at - i.at).slice(0, 100),
      logs: o.docs.map((i) => r(i.data())).filter((i) => i.oldAccountId === t || i.newAccountId === t).sort((i, c) => c.at - i.at).slice(0, 50)
    };
  });
});

// src/payout.js
var ar = R((Ce) => {
  "use strict";
  var { onCall: De } = ne(), C = W(), Gn = pn(), Yt = ma().helpers, { db: V, FieldValue: ie, HttpsError: le, REGION: Me } = C, J = Gn.n0, ge = (e) => V.doc(`payoutAgents/${e}`), Rt = ["super", "finance"], Et = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0;
  async function qn(e) {
    let t = C.requireRole(e, ["payout"]), a = await ge(t).get();
    if (!a.exists || a.data().active === !1) throw new le("permission-denied", "Your payout access is turned off.");
    return t;
  }
  var Dc = (e, t) => ({
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
    let t = await qn(e), n = (await V.collection("withdrawals").where("assignedTo", "==", t).limit(300).get()).docs.map((r) => Dc(r.id, r.data())), s = (await ge(t).get()).data() || {}, o = Gn.startOfDhakaDay().getTime();
    return {
      open: n.filter((r) => r.status === "pending" && r.stage === "assigned").sort((r, i) => r.assignedAt - i.assignedAt),
      review: n.filter((r) => r.status === "pending" && r.stage === "paid_review").sort((r, i) => i.paidAt - r.paidAt),
      done: n.filter((r) => r.status === "approved").sort((r, i) => i.paidAt - r.paidAt).slice(0, 50),
      today: n.filter((r) => r.status === "approved" && r.paidAt >= o).reduce((r, i) => ({ count: r.count + 1, total: C.round2(r.total + J(i.amount)) }), { count: 0, total: 0 }),
      me: { name: s.name || "", methods: s.methods || [], ...qa(s) },
      storage: Yt.configured()
    };
  });
  function qa(e) {
    let t = J(e.floatGiven), a = J(e.floatReturned), n = J(e.paidTotal), s = J(e.reviewTotal);
    return { floatGiven: t, floatReturned: a, paidTotal: n, paidCount: J(e.paidCount), reviewTotal: s, reviewCount: J(e.reviewCount), remaining: C.round2(t - a - n - s), openCount: Math.max(0, J(e.openCount)) };
  }
  Ce.payoutMarkPaid = De({ region: Me }, async (e) => {
    let t = await qn(e), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = C.str(a.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), o = typeof a.fromNumber == "string" ? a.fromNumber.replace(/[^0-9+]/g, "").slice(0, 20) : "", r = typeof a.proofKey == "string" ? a.proofKey.trim() : "";
    if (Yt.configured()) {
      if (!r) throw C.bad("Please upload the payment screenshot.");
      if (!Yt.safeKey(r) || !r.startsWith(`payouts/${n}/${t}-`)) throw C.bad("Invalid screenshot.");
      await Yt.verifyImage(r);
    }
    return await V.runTransaction(async (i) => {
      let c = V.doc(`withdrawals/${n}`), d = await i.get(c), u = d.exists ? d.data() : null;
      if (!u || u.assignedTo !== t) throw new le("permission-denied", "This task is not assigned to you.");
      if (u.status !== "pending" || u.stage !== "assigned") throw new le("failed-precondition", "This task is not waiting for payment.");
      i.update(c, { stage: "paid_review", paidBy: t, paidAt: Date.now(), payTrxId: s, fromNumber: o, proofKey: r, reviewNote: "" }), i.update(ge(t), { reviewTotal: ie.increment(J(u.net)), reviewCount: ie.increment(1), openCount: ie.increment(-1), lastPaidAt: Date.now() }), C.audit(i, t, "payout_paid", { withdrawalId: n, net: u.net, trx: s });
    }), { ok: !0 };
  });
  Ce.payoutReturn = De({ region: Me }, async (e) => {
    let t = await qn(e), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = C.str(a.reason, { min: 3, max: 200, label: "Reason" });
    return await V.runTransaction(async (o) => {
      let r = V.doc(`withdrawals/${n}`), i = await o.get(r), c = i.exists ? i.data() : null;
      if (!c || c.assignedTo !== t) throw new le("permission-denied", "This task is not assigned to you.");
      if (c.status !== "pending" || c.stage !== "assigned") throw new le("failed-precondition", "You can only return a task you have not paid yet.");
      o.update(r, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null, returnReason: s, returnedBy: t, returnedAt: Date.now() }), o.update(ge(t), { openCount: ie.increment(-1), returnedCount: ie.increment(1) }), C.audit(o, t, "payout_returned", { withdrawalId: n, reason: s });
    }), { ok: !0 };
  });
  async function tr(e, t, a) {
    await V.runTransaction(async (n) => {
      let s = V.doc(`withdrawals/${e}`), [o, r] = await Promise.all([n.get(s), n.get(ge(t))]), i = o.exists ? o.data() : null;
      if (!r.exists || r.data().active === !1) throw new le("failed-precondition", "That agent is not active.");
      if (!i || i.status !== "pending") throw new le("failed-precondition", "This request is no longer pending.");
      if (i.stage === "paid_review") throw new le("failed-precondition", "Already paid \u2014 waiting for review.");
      i.assignedTo !== t && (i.assignedTo && n.update(ge(i.assignedTo), { openCount: ie.increment(-1) }), n.update(s, { stage: "assigned", assignedTo: t, assignedName: r.data().name || "", assignedAt: Date.now(), assignedBy: a }), n.update(ge(t), { openCount: ie.increment(1) }), C.notify(n, t, "New payout task", `Send ${i.net} by ${i.methodName}.`, "payout"));
    });
  }
  Ce.payoutAssign = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, Rt), a = e.data || {}, n = Array.isArray(a.withdrawalIds) ? a.withdrawalIds.slice(0, 100).map((r) => C.str(r, { max: 80 })) : [];
    if (!n.length) throw C.bad("Pick at least one request.");
    let s = C.str(a.agentUid, { max: 80, label: "Agent" }), o = { ok: 0, failed: [] };
    for (let r of n)
      try {
        await tr(r, s, t), o.ok++;
      } catch (i) {
        o.failed.push({ id: r, error: i.message });
      }
    return C.audit(null, t, "payout_assign", { agentUid: s, count: o.ok }), o;
  });
  Ce.payoutAutoAssign = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, Rt), a = e.data || {}, n = a.mode === "method" ? "method" : "equal", s = Array.isArray(a.agentUids) && a.agentUids.length ? new Set(a.agentUids.map(String)) : null, o = (await V.collection("payoutAgents").where("active", "==", !0).get()).docs.map((c) => ({ uid: c.id, methods: c.data().methods || [], load: Math.max(0, J(c.data().openCount)) })).filter((c) => !s || s.has(c.uid));
    if (!o.length) throw new le("failed-precondition", "No active payout agents.");
    let r = (await V.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.filter((c) => !c.data().assignedTo && c.data().stage !== "paid_review").sort((c, d) => Et(c.data().createdAt) - Et(d.data().createdAt)), i = { ok: 0, skipped: 0, failed: [] };
    for (let c of r) {
      let d = n === "method" ? o.filter((l) => !l.methods.length || l.methods.includes(c.data().methodId)) : o;
      if (!d.length) {
        i.skipped++;
        continue;
      }
      let u = d.reduce((l, m) => m.load < l.load ? m : l, d[0]);
      try {
        await tr(c.id, u.uid, t), u.load++, i.ok++;
      } catch (l) {
        i.failed.push({ id: c.id, error: l.message });
      }
    }
    return C.audit(null, t, "payout_auto_assign", { mode: n, count: i.ok }), i;
  });
  Ce.payoutUnassign = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, Rt), a = C.str((e.data || {}).withdrawalId, { max: 80 });
    return await V.runTransaction(async (n) => {
      let s = V.doc(`withdrawals/${a}`), o = await n.get(s), r = o.exists ? o.data() : null;
      if (!r || r.status !== "pending" || !r.assignedTo) throw new le("failed-precondition", "Nothing to unassign.");
      if (r.stage === "paid_review") throw new le("failed-precondition", "Already paid \u2014 review it instead.");
      n.update(s, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null }), n.update(ge(r.assignedTo), { openCount: ie.increment(-1) }), C.audit(n, t, "payout_unassign", { withdrawalId: a });
    }), { ok: !0 };
  });
  Ce.payoutReview = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, Rt), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = a.action;
    if (!["approve", "send_back"].includes(s)) throw C.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "";
    if (s === "send_back" && o.length < 3) throw C.bad("Write why it is sent back.");
    return await V.runTransaction(async (r) => {
      let i = V.doc(`withdrawals/${n}`), c = await r.get(i), d = c.exists ? c.data() : null;
      if (!d || d.status !== "pending" || d.stage !== "paid_review") throw new le("failed-precondition", "This payment is not waiting for review.");
      if (d.paidBy === t) throw new le("permission-denied", "You cannot approve a payment you made yourself.");
      let u = J(d.net);
      s === "approve" ? (Gn.finalize(r, i, d, !0, t, o, { approvedBy: t }), r.update(ge(d.paidBy), { reviewTotal: ie.increment(-u), reviewCount: ie.increment(-1), paidTotal: ie.increment(u), paidCount: ie.increment(1) })) : (r.update(i, { stage: "assigned", reviewNote: o, sentBackAt: Date.now(), sentBackBy: t }), r.update(ge(d.paidBy), { reviewTotal: ie.increment(-u), reviewCount: ie.increment(-1), openCount: ie.increment(1) }), C.notify(r, d.paidBy, "Payout sent back", o, "payout")), C.audit(r, t, s === "approve" ? "payout_approved" : "payout_sent_back", { withdrawalId: n, net: u, agent: d.paidBy });
    }), { ok: !0 };
  });
  Ce.payoutAgents = De({ region: Me }, async (e) => {
    C.requireRole(e, Rt);
    let t = await V.collection("payoutAgents").limit(50).get(), a = (await V.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.map((o) => ({ id: o.id, ...o.data() })), n = t.docs.map((o) => {
      let r = o.data(), i = a.filter((c) => c.assignedTo === o.id);
      return {
        uid: o.id,
        name: r.name || "",
        email: r.email || "",
        active: r.active !== !1,
        methods: r.methods || [],
        ...qa(r),
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
    return { agents: n, queue: s, storage: Yt.configured() };
  });
  Ce.payoutAgentSave = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, ["super"]), a = e.data || {}, n = C.str(a.agentUid, { max: 80 }), s = ge(n);
    if (!(await s.get()).exists) throw new le("not-found", "Agent not found.");
    let r = {};
    return typeof a.active == "boolean" && (r.active = a.active), Array.isArray(a.methods) && (r.methods = a.methods.slice(0, 20).map((i) => C.str(i, { max: 80 }))), await s.update(r), C.audit(null, t, "payout_agent_save", { uid: n, ...r }), { ok: !0 };
  });
  Ce.payoutFloat = De({ region: Me }, async (e) => {
    let t = C.requireRole(e, ["super"]), a = e.data || {}, n = C.str(a.agentUid, { max: 80 }), s = C.amountOf(a.amount, { max: 1e8 }), o = a.direction === "take" ? "take" : "give", r = typeof a.note == "string" ? a.note.trim().slice(0, 200) : "";
    return await V.runTransaction(async (i) => {
      let c = await i.get(ge(n));
      if (!c.exists) throw new le("not-found", "Agent not found.");
      if (o === "take" && s > qa(c.data()).remaining + 1e-9) throw C.bad("Cannot take back more than the agent has left.");
      i.update(ge(n), o === "give" ? { floatGiven: ie.increment(s) } : { floatReturned: ie.increment(s) }), i.set(V.collection("payoutFloat").doc(), { agentUid: n, amount: s, direction: o, note: r, by: t, at: Date.now() }), C.audit(i, t, "payout_float", { uid: n, amount: s, dir: o });
    }), { ok: !0 };
  });
  Ce.payoutReport = De({ region: Me }, async (e) => {
    C.requireRole(e, Rt);
    let t = e.data || {}, a = C.str(t.agentUid, { max: 80 }), n = J(t.from), s = J(t.to) || Date.now() + 864e5, o = await ge(a).get();
    if (!o.exists) throw new le("not-found", "Agent not found.");
    let r = (await V.collection("withdrawals").where("paidBy", "==", a).limit(1e3).get()).docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => J(d.paidAt) >= n && J(d.paidAt) <= s).map((d) => ({ id: d.id, methodName: d.methodName, accountNumber: d.accountNumber, net: d.net, status: d.status, stage: d.stage, payTrxId: d.payTrxId || "", fromNumber: d.fromNumber || "", proofKey: d.proofKey || "", paidAt: J(d.paidAt), approvedBy: d.approvedBy || d.reviewedBy || "" })).sort((d, u) => u.paidAt - d.paidAt), i = (await V.collection("payoutFloat").where("agentUid", "==", a).limit(300).get()).docs.map((d) => d.data()).sort((d, u) => u.at - d.at), c = {};
    for (let d of r.filter((u) => u.status === "approved")) {
      let u = d.accountNumber;
      c[u] = c[u] || { accountNumber: u, methodName: d.methodName, count: 0, total: 0 }, c[u].count++, c[u].total = C.round2(c[u].total + J(d.net));
    }
    return { agent: { uid: a, name: o.data().name || "", ...qa(o.data()) }, rows: r, float: i, byNumber: Object.values(c).sort((d, u) => u.total - d.total) };
  });
});

// src/community.js
var cr = R((Dt) => {
  "use strict";
  var { onCall: Zt } = ne(), z = W(), { db: Q, FieldValue: nr, HttpsError: jn, REGION: Qt } = z, or = 24 * 36e5, Mc = 6 * 36e5, sr = (e) => new Date(e + Mc).toISOString().slice(0, 10), Xt = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0, F = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, Pc = ["super", "finance", "support"];
  async function rr() {
    let e = await Q.doc("settings/content").get();
    return e.exists ? e.data() : {};
  }
  var Oc = (e) => (Array.isArray(e) ? e : []).slice(0, 7).map((t) => Math.max(0, Math.min(1e5, Math.round(F(t)))));
  function ir(e, t, a) {
    let n = Oc(e && e.rewards), s = !!(e && e.enabled) && n.some((l) => l > 0), o = sr(a), r = sr(a - or), i = t ? F(t.streak) : 0, c = t ? t.lastDay : "", d = c === o;
    !d && c !== r && (i = 0);
    let u = i % 7;
    return { enabled: s, rewards: n, streak: i, claimedToday: d, today: o, nextIndex: u, lastDay: c || "" };
  }
  Dt.checkinStatus = Zt({ region: Qt }, async (e) => {
    let t = z.authUid(e), [a, n] = await Promise.all([rr(), Q.doc(`bonusClaims/${t}_checkin`).get()]), s = ir(a.checkin, n.exists ? n.data() : null, Date.now());
    return { enabled: s.enabled, rewards: s.rewards, streak: s.streak, claimedToday: s.claimedToday, nextIndex: s.nextIndex };
  });
  Dt.claimCheckin = Zt({ region: Qt }, async (e) => {
    let t = z.requireVerified(e), a = 0, n = 0, s = 0;
    return await Q.runTransaction(async (o) => {
      let [r, i, c] = await Promise.all([o.get(Q.doc("settings/content")), o.get(Q.doc(`users/${t}`)), o.get(Q.doc(`bonusClaims/${t}_checkin`))]);
      z.assertActive(i.data());
      let d = Date.now(), u = ir((r.exists ? r.data() : {}).checkin, c.exists ? c.data() : null, d);
      if (!u.enabled) throw new jn("failed-precondition", "Daily check-in is not available right now.");
      if (u.claimedToday) throw new jn("failed-precondition", "You already checked in today. Come back tomorrow.");
      n = u.nextIndex, s = u.streak + 1, a = z.round2(u.rewards[n] || 0), a > 0 && (z.applyDelta(o, i.ref, { main: a }), z.ledger(o, { uid: t, type: "bonus", direction: "in", amount: a, bucket: "main", note: `Daily check-in \xB7 day ${n + 1}`, ref: "checkin" }), z.bumpStats(o, { bonusPaid: a })), o.set(c.ref, { uid: t, bonusId: "checkin", lastDay: u.today, streak: s, best: Math.max(s, F(c.exists ? c.data().best : 0)), lastClaimAt: nr.serverTimestamp(), lastClaimMs: d, lastAmount: a, count: nr.increment(1) }, { merge: !0 });
    }), { ok: !0, amount: a, day: n, streak: s };
  });
  var Uc = (e) => {
    let t = String(e || "").trim();
    return t ? t.slice(0, Math.min(2, t.length)) + "***" : "Player";
  }, Jt = { at: 0, data: null };
  Dt.publicBoard = Zt({ region: Qt }, async (e) => {
    z.authUid(e);
    let t = (await rr()).board || {};
    if (!t.enabled) return { enabled: !1, weekly: [], latest: [] };
    if (Jt.data && Date.now() - Jt.at < 6e4 && Jt.min === F(t.minShow)) return Jt.data;
    let a = Math.max(0, F(t.minShow)), n = Date.now() - 7 * or, o = (await Q.collection("transactions").where("type", "in", ["win", "game_win"]).where("createdAt", ">=", n).orderBy("createdAt", "desc").limit(4e3).get()).docs.map((m) => m.data()).filter((m) => F(m.amount) >= a && F(m.amount) > 0), r = /* @__PURE__ */ new Map();
    for (let m of o) {
      let p = r.get(m.uid);
      (!p || F(m.amount) > p.amount) && r.set(m.uid, { uid: m.uid, amount: F(m.amount), game: m.note || "" });
    }
    let i = [...r.values()].sort((m, p) => p.amount - m.amount).slice(0, 10), c = o.slice(0, 20), d = [.../* @__PURE__ */ new Set([...i.map((m) => m.uid), ...c.map((m) => m.uid)])], u = /* @__PURE__ */ new Map();
    await Promise.all(d.map(async (m) => {
      let p = await Q.doc(`users/${m}`).get(), f = p.exists ? p.data() : {};
      u.set(m, Uc(f.username || f.name));
    }));
    let l = {
      enabled: !0,
      weekly: i.map((m) => ({ name: u.get(m.uid), amount: m.amount, game: m.game })),
      latest: c.map((m) => ({ name: u.get(m.uid), amount: F(m.amount), game: m.note || "", at: Xt(m.createdAt) }))
    };
    return Jt = { at: Date.now(), data: l, min: F(t.minShow) }, l;
  });
  var Ge = ["main", "winning", "referral", "commission"];
  Dt.adminReconcile = Zt({ region: Qt, timeoutSeconds: 120 }, async (e) => {
    z.requireRole(e, ["super", "finance"]);
    let t = 6e4, [a, n] = await Promise.all([Q.collection("users").limit(2e4).get(), Q.collection("transactions").orderBy("createdAt", "desc").limit(t).get()]), s = /* @__PURE__ */ new Map();
    for (let d of n.docs) {
      let u = d.data();
      if (!u.uid) continue;
      let l = F(u.amount) * (u.direction === "out" ? -1 : 1), m = Ge.includes(u.bucket) ? u.bucket : "main", p = s.get(u.uid) || { main: 0, winning: 0, referral: 0, commission: 0 };
      p[m] += l, s.set(u.uid, p);
    }
    let o = n.docs.length >= t, r = { main: 0, winning: 0, referral: 0, commission: 0 }, i = [];
    for (let d of a.docs) {
      let u = d.data(), l = u.balances || {};
      for (let w of Ge) r[w] += F(l[w]);
      let m = s.get(d.id) || { main: 0, winning: 0, referral: 0, commission: 0 }, p = {}, f = !1;
      for (let w of Ge)
        p[w] = z.round2(F(l[w]) - m[w]), Math.abs(p[w]) >= 0.01 && (f = !0);
      f && i.push({ uid: d.id, name: u.username || u.name || u.email || d.id, balances: Ge.reduce((w, y) => ({ ...w, [y]: z.round2(F(l[y])) }), {}), ledger: Ge.reduce((w, y) => ({ ...w, [y]: z.round2(m[y]) }), {}), diff: p });
    }
    i.sort((d, u) => Math.max(...Ge.map((l) => Math.abs(u.diff[l]))) - Math.max(...Ge.map((l) => Math.abs(d.diff[l]))));
    let c = (await Q.doc("stats/global").get()).data() || {};
    return {
      at: Date.now(),
      users: a.size,
      ledgerRows: n.size,
      partial: o,
      totals: Ge.reduce((d, u) => ({ ...d, [u]: z.round2(r[u]) }), {}),
      allBalances: z.round2(Ge.reduce((d, u) => d + r[u], 0)),
      deposits: F(c.totalDeposits),
      withdrawals: F(c.totalWithdrawals),
      bonusPaid: F(c.bonusPaid),
      mismatched: i.length,
      diffs: i.slice(0, 50)
    };
  });
  Dt.adminUserOverview = Zt({ region: Qt }, async (e) => {
    z.requireRole(e, Pc);
    let t = z.str((e.data || {}).uid, { max: 128, label: "User" }), a = await Q.doc(`users/${t}`).get();
    if (!a.exists) throw new jn("not-found", "User not found.");
    let n = a.data(), [s, o, r, i, c, d] = await Promise.all([
      Q.collection("transactions").where("uid", "==", t).orderBy("createdAt", "desc").limit(25).get(),
      Q.collection("deposits").where("uid", "==", t).orderBy("createdAt", "desc").limit(200).get(),
      Q.collection("withdrawals").where("uid", "==", t).orderBy("createdAt", "desc").limit(200).get(),
      Q.collection("loginHistory").where("uid", "==", t).orderBy("at", "desc").limit(10).get(),
      Q.collection("referrals").where("referrerUid", "==", t).limit(500).get(),
      Q.doc(`bonusClaims/${t}_checkin`).get()
    ]), u = (p, f) => p.filter((w) => f(w.data())).reduce((w, y) => w + F(y.data().amount), 0), l = o.docs, m = r.docs;
    return {
      user: { uid: t, name: n.name || "", username: n.username || "", email: n.email || "", phone: n.phone || "", status: n.status || "active", role: n.role || "user", createdAt: Xt(n.createdAt), lastLoginAt: Xt(n.lastLoginAt), referredBy: n.referredBy || "" },
      balances: Ge.reduce((p, f) => ({ ...p, [f]: z.round2(F((n.balances || {})[f])) }), {}),
      totals: {
        deposited: z.round2(u(l, (p) => p.status === "approved")),
        depositCount: l.filter((p) => p.data().status === "approved").length,
        withdrawn: z.round2(u(m, (p) => p.status === "approved" || p.status === "paid")),
        withdrawCount: m.filter((p) => ["approved", "paid"].includes(p.data().status)).length,
        pendingDeposits: l.filter((p) => p.data().status === "pending").length,
        pendingWithdraws: m.filter((p) => p.data().status === "pending").length,
        referrals: c.size,
        checkinStreak: d.exists ? F(d.data().streak) : 0
      },
      ledger: s.docs.map((p) => {
        let f = p.data();
        return { type: f.type, direction: f.direction, amount: F(f.amount), bucket: f.bucket, note: f.note || "", at: Xt(f.createdAt) };
      }),
      logins: i.docs.map((p) => {
        let f = p.data();
        return { at: Xt(f.at), ok: f.success !== !1, device: f.device || f.ua || "", ip: f.ip || "" };
      })
    };
  });
});

// src/growth.js
var br = R((ce) => {
  "use strict";
  var { onCall: Se } = ne(), { onSchedule: Bc } = Ca(), k = W(), Lc = ba(), { db: M, FieldValue: dr, HttpsError: Pe, REGION: we } = k, Y = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, ja = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0, Hn = (e) => (e = String(e || ""), e ? e.slice(0, 2) + "***" : "***"), wt = () => globalThis.__ENV || process.env;
  async function lr() {
    let e = await M.doc("settings/content").get();
    return e.exists ? e.data() : {};
  }
  function mr(e) {
    let t = e && e.refMs || {}, a = (Array.isArray(t.steps) ? t.steps : []).map((s) => ({ count: Math.round(Y(s && s.count)), reward: k.round2(Y(s && s.reward)) })).filter((s) => s.count >= 1 && s.count <= 1e5 && s.reward > 0 && s.reward <= 1e6).sort((s, o) => s.count - o.count).slice(0, 20), n = a.filter((s, o) => o === 0 || s.count !== a[o - 1].count);
    return { enabled: !!t.enabled && n.length > 0, minDeposit: Math.max(0, Y(t.minDeposit)), bucket: t.bucket === "main" ? "main" : "referral", steps: n };
  }
  async function pr(e) {
    let a = (await M.collection("users").where("referredBy", "==", e).limit(3e3).get()).docs.map((n) => ({ uid: n.id, username: n.data().username || "", at: ja(n.data().createdAt), deposited: 0 }));
    for (let n = 0; n < a.length; n += 100) {
      let s = a.slice(n, n + 100), o = s.map((c) => c.uid), r = await M.collection("deposits").where("uid", "in", o).where("status", "==", "approved").get(), i = {};
      r.docs.forEach((c) => {
        let d = c.data();
        i[d.uid] = (i[d.uid] || 0) + Y(d.amount);
      }), s.forEach((c) => {
        c.deposited = k.round2(i[c.uid] || 0);
      });
    }
    return a;
  }
  var fr = (e, t) => e.filter((a) => t.minDeposit > 0 ? a.deposited >= t.minDeposit : a.deposited > 0 || t.minDeposit === 0).length;
  ce.refProgress = Se({ region: we }, async (e) => {
    let t = k.authUid(e), a = mr(await lr()), n = await pr(t), s = fr(n, a), o = await M.doc(`bonusClaims/${t}_refms`).get(), r = o.exists && Array.isArray(o.data().claimed) ? o.data().claimed : [];
    return {
      enabled: a.enabled,
      minDeposit: a.minDeposit,
      steps: a.steps,
      total: n.length,
      active: s,
      claimed: r,
      friends: n.sort((i, c) => c.at - i.at).slice(0, 100).map((i) => ({ name: Hn(i.username), at: i.at, active: a.minDeposit > 0 ? i.deposited >= a.minDeposit : !0, deposited: i.deposited > 0 }))
    };
  });
  ce.claimRefMilestone = Se({ region: we }, async (e) => {
    let t = k.requireVerified(e), a = Math.round(Y((e.data || {}).count)), n = mr(await lr());
    if (!n.enabled) throw new Pe("failed-precondition", "Invite rewards are off.");
    let s = n.steps.find((r) => r.count === a);
    if (!s) throw k.bad("Unknown reward step.");
    let o = fr(await pr(t), n);
    if (o < s.count) throw new Pe("failed-precondition", `\u0986\u09B0\u0993 ${s.count - o} \u099C\u09A8 \u09B8\u0995\u09CD\u09B0\u09BF\u09AF\u09BC \u09AC\u09A8\u09CD\u09A7\u09C1 \u09A6\u09B0\u0995\u09BE\u09B0\u0964`);
    return await M.runTransaction(async (r) => {
      let i = M.doc(`bonusClaims/${t}_refms`), c = M.doc(`users/${t}`), [d, u] = await Promise.all([r.get(i), r.get(c)]);
      k.assertActive(u.data());
      let l = d.exists && Array.isArray(d.data().claimed) ? d.data().claimed : [];
      if (l.includes(s.count)) throw new Pe("already-exists", "\u098F\u0987 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u0986\u0997\u09C7\u0987 \u09A8\u09C7\u0993\u09AF\u09BC\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964");
      k.applyDelta(r, c, { [n.bucket]: s.reward }), k.ledger(r, { uid: t, type: "referral", direction: "in", amount: s.reward, bucket: n.bucket, note: `Invite reward \xB7 ${s.count} friends`, ref: "refms" }), k.notify(r, t, "Invite reward \u{1F389}", `${s.count} friends joined. +${s.reward}`, "referral"), r.set(i, { uid: t, kind: "refms", claimed: [...l, s.count], updatedAt: Date.now() }), k.bumpStats(r, { bonusPaid: s.reward });
    }), { ok: !0, reward: s.reward };
  });
  var ur = { mobile: /^01[3-9]\d{8}$/, bank: /^[0-9A-Za-z\- ]{6,30}$/, crypto: /^[0-9A-Za-z]{20,100}$/ };
  ce.wdCardList = Se({ region: we }, async (e) => {
    let t = k.authUid(e), a = await M.doc(`users/${t}/private/wdCards`).get(), n = a.exists && Array.isArray(a.data().list) ? a.data().list : [], s = await Promise.all(n.map((o) => M.doc(`paymentMethods/${o.methodId}`).get()));
    return { cards: n.map((o, r) => ({ ...o, index: r, fee: s[r].exists ? Math.max(0, Y(s[r].data().cardChangeFee)) : 0, lock: s[r].exists ? s[r].data().cardLock === !0 : !1 })) };
  });
  ce.wdCardChange = Se({ region: we }, async (e) => {
    let t = k.requireVerified(e), a = e.data || {}, n = Math.round(Y(a.index));
    if (n < 0 || n > 5) throw k.bad("Invalid card.");
    let s = k.str(a.methodId, { max: 80, label: "Method" }), o = k.str(a.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }).replace(/\s+/g, " "), r = k.str(a.holderName, { min: 2, max: 60, label: "Name" }), i = typeof a.bankName == "string" ? a.bankName.trim().slice(0, 60) : "", c = typeof a.branch == "string" ? a.branch.trim().slice(0, 60) : "", d = 0;
    return await M.runTransaction(async (u) => {
      let l = M.doc(`users/${t}/private/wdCards`), m = M.doc(`users/${t}`), [p, f, w] = await Promise.all([u.get(l), u.get(m), u.get(M.doc(`paymentMethods/${s}`))]);
      k.assertActive(f.data());
      let y = p.exists && Array.isArray(p.data().list) ? p.data().list.slice() : [], b = y[n];
      if (!b) throw new Pe("not-found", "Card not found.");
      let _ = await u.get(M.doc(`paymentMethods/${b.methodId}`)), v = w.data();
      if (!w.exists || v.enabled !== !0 || !["withdraw", "both"].includes(v.type || "both")) throw k.bad("This method is not available.");
      let h = v.kind || "mobile", T = h === "mobile" ? o.replace(/\s/g, "") : o;
      if (ur[h] && !ur[h].test(T)) throw k.bad(h === "mobile" ? "\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F, 01 \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B6\u09C1\u09B0\u09C1\u0964" : "\u09B8\u09A0\u09BF\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09BF\u09A8\u0964");
      if (h === "bank" && (i.length < 2 || c.length < 2)) throw k.bad("\u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7\u09B0 \u09A8\u09BE\u09AE \u0993 \u09B6\u09BE\u0996\u09BE \u09A6\u09BF\u09A8\u0964");
      if (y.some((A, $) => $ !== n && A.methodId === s)) throw k.bad("\u098F\u0987 \u09AE\u09C7\u09A5\u09A1\u09C7 \u0986\u0997\u09C7\u0987 \u0986\u09B0\u09C7\u0995\u099F\u09BE \u0995\u09BE\u09B0\u09CD\u09A1 \u0986\u099B\u09C7\u0964");
      if (b.methodId === s && b.accountNumber === T && (b.holderName || "") === r && (b.bankName || "") === i && (b.branch || "") === c) throw k.bad("\u0995\u09BF\u099B\u09C1 \u09AC\u09A6\u09B2\u09BE\u09AF\u09BC\u09A8\u09BF\u0964");
      if (d = _.exists ? Math.min(1e5, Math.max(0, k.round2(Y(_.data().cardChangeFee)))) : 0, d > 0) {
        let A = k.planDebit(f.data().balances, d, ["main", "winning", "referral", "commission"]), $ = {};
        for (let [N, I] of Object.entries(A)) $[N] = -I;
        k.applyDelta(u, m, $);
        for (let [N, I] of Object.entries(A)) k.ledger(u, { uid: t, type: "fee", direction: "out", amount: I, bucket: N, note: "Card number change", ref: "wdcard" });
        k.bumpStats(u, { feesCollected: d });
      }
      y[n] = { methodId: s, accountNumber: T, holderName: r, ...i ? { bankName: i, branch: c } : {}, savedAt: b.savedAt || Date.now(), changedAt: Date.now() }, u.set(l, { list: y, updatedAt: Date.now() }), k.notify(u, t, "Card updated", d > 0 ? `Withdraw card changed. Fee ${d}.` : "Withdraw card changed.", "withdraw"), k.audit(u, t, "wd_card_changed", { index: n, from: b.methodId, to: s, fee: d });
    }), { ok: !0, fee: d };
  });
  var Fn = /* @__PURE__ */ new Map();
  async function xc(e) {
    let t = Fn.get(e);
    if (t && t.at > Date.now() - 15e3) return t.v;
    let n = (await M.collection("lotteryTickets").where("lotteryId", "==", e).limit(3e3).get()).docs.map((i) => i.data()).filter((i) => i.status === "active" || i.status === "won").sort((i, c) => Y(i.number) - Y(c.number)), s = [...new Set(n.map((i) => i.uid))], o = {};
    for (let i = 0; i < s.length; i += 50)
      (await Promise.all(s.slice(i, i + 50).map((d) => M.doc(`users/${d}`).get()))).forEach((d) => {
        d.exists && (o[d.id] = d.data().username || "");
      });
    let r = { players: s.length, entries: n.slice(0, 600).map((i) => ({ t: i.number, n: Hn(o[i.uid]), uid: i.uid })) };
    return Fn.set(e, { at: Date.now(), v: r }), r;
  }
  async function hr(e, t) {
    if (!t || t.autoDraw !== !0 || t.status !== "open" || !ja(t.endsAt) || ja(t.endsAt) > Date.now() || !(Y(t.sold) > 0)) return !1;
    try {
      return await Lc.drawLottery(e, "auto"), Fn.delete(e), !0;
    } catch {
      return !1;
    }
  }
  ce.lotteryLive = Se({ region: we }, async (e) => {
    let t = k.authUid(e), a = k.str((e.data || {}).lotteryId, { max: 80 }), n = await M.doc(`lotteries/${a}`).get();
    if (!n.exists) throw new Pe("not-found", "Lottery not found.");
    await hr(a, n.data()) && (n = await M.doc(`lotteries/${a}`).get());
    let s = n.data(), o = await xc(a);
    return {
      id: a,
      title: s.title || "",
      prize: Y(s.prize),
      price: Y(s.price),
      sold: Y(s.sold),
      total: Y(s.totalTickets),
      status: s.status,
      endsAt: ja(s.endsAt),
      now: Date.now(),
      autoDraw: s.autoDraw === !0,
      seedHash: s.seedHash || "",
      drawSeed: s.status === "drawn" && s.drawSeed || "",
      drawCount: Y(s.drawCount),
      winnerTicket: s.winnerTicket || null,
      winnerName: s.status === "drawn" ? Hn(s.winnerName) : "",
      winnerIsMe: s.status === "drawn" && s.winnerUid === t,
      players: o.players,
      mine: o.entries.filter((r) => r.uid === t).map((r) => r.t),
      entries: o.entries.map((r) => ({ t: r.t, n: r.n }))
    };
  });
  async function gr() {
    let e = await M.collection("lotteries").where("status", "==", "open").limit(100).get(), t = 0;
    for (let a of e.docs) await hr(a.id, a.data()) && t++;
    return t;
  }
  ce.lotteryTick = Bc({ region: we, schedule: "every 1 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 120 }, async () => {
    await gr();
  });
  ce.lotteryAutoCheck = Se({ region: we }, async (e) => (k.authUid(e), { drawn: await gr() }));
  var Gc = ["deposit", "withdraw", "account", "game", "other"], qc = { deposit: "\u09A1\u09BF\u09AA\u09CB\u099C\u09BF\u099F", withdraw: "\u0989\u0987\u09A5\u09A1\u09CD\u09B0", account: "\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F", game: "\u0997\u09C7\u09AE", other: "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF" }, wr = { fetch: (...e) => fetch(...e) };
  async function Mt(e, t) {
    let a = wt().TELEGRAM_BOT_TOKEN;
    if (!a) return null;
    try {
      return await (await wr.fetch(`https://api.telegram.org/bot${a}/${e}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(t) })).json();
    } catch {
      return null;
    }
  }
  async function Kn(e, t, a, n = {}) {
    let s = M.doc(`supportThreads/${e}`), o = Date.now();
    await M.collection(`supportThreads/${e}/msgs`).doc().set({ from: t, text: a, at: o, ...n });
    let r = { lastAt: o, lastText: a.slice(0, 120), lastFrom: t };
    t === "user" ? (r.unreadStaff = dr.increment(1), r.status = "open") : (r.unreadUser = dr.increment(1), r.unreadStaff = 0), await s.set(r, { merge: !0 });
  }
  ce.supportSend = Se({ region: we }, async (e) => {
    let t = k.authUid(e), a = e.data || {}, n = k.str(a.text, { min: 1, max: 1e3, label: "Message" }), s = Gc.includes(a.topic) ? a.topic : "other", o = (await M.doc(`users/${t}`).get()).data() || {}, r = M.doc(`supportThreads/${t}`), i = await r.get(), c = i.exists ? i.data() : {}, d = Math.floor(Date.now() / 36e5), u = c.rateHour === d ? Y(c.rateCount) : 0;
    if (u >= 30) throw new Pe("resource-exhausted", "\u0985\u09A8\u09C7\u0995 \u09AE\u09C7\u09B8\u09C7\u099C \u09AA\u09BE\u09A0\u09BF\u09AF\u09BC\u09C7\u099B\u09C7\u09A8, \u098F\u0995\u099F\u09C1 \u09AA\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u09B2\u09BF\u0996\u09C1\u09A8\u0964");
    i.exists || await r.set({ uid: t, username: o.username || "", createdAt: Date.now(), unreadUser: 0, unreadStaff: 0 }), await r.set({ rateHour: d, rateCount: u + 1, topic: s, username: o.username || "" }, { merge: !0 }), await Kn(t, "user", n, { topic: s });
    let l = wt().TELEGRAM_CHAT_ID;
    if (l) {
      let m = await Mt("sendMessage", { chat_id: l, text: `\u{1F198} ${o.username || "player"} \xB7 ${qc[s]}

${n}

#U${t.slice(0, 8)} \u2014 \u098F\u0987 \u09AE\u09C7\u09B8\u09C7\u099C\u09C7 Reply \u09A6\u09BF\u09B2\u09C7 \u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0 \u09B8\u09BE\u0987\u099F\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09AA\u09BE\u09AC\u09C7` });
      m && m.ok && m.result && await M.doc(`tgMap/${m.result.message_id}`).set({ uid: t, at: Date.now() });
    }
    return { ok: !0 };
  });
  ce.supportMine = Se({ region: we }, async (e) => {
    let t = k.authUid(e), a = await M.collection(`supportThreads/${t}/msgs`).orderBy("at", "desc").limit(60).get(), n = await M.doc(`supportThreads/${t}`).get();
    return n.exists && Y(n.data().unreadUser) && await M.doc(`supportThreads/${t}`).update({ unreadUser: 0 }), { msgs: a.docs.map((s) => {
      let o = s.data();
      return { from: o.from, text: o.text, at: o.at, via: o.via || "" };
    }).reverse() };
  });
  ce.adminSupportList = Se({ region: we }, async (e) => (k.requireRole(e, ["super", "support"]), {
    threads: (await M.collection("supportThreads").orderBy("lastAt", "desc").limit(100).get()).docs.map((a) => {
      let n = a.data();
      return { uid: a.id, username: n.username || "", lastAt: n.lastAt || 0, lastText: n.lastText || "", lastFrom: n.lastFrom || "", unread: Y(n.unreadStaff), topic: n.topic || "" };
    }),
    telegram: !!(wt().TELEGRAM_BOT_TOKEN && wt().TELEGRAM_CHAT_ID)
  }));
  ce.adminSupportThread = Se({ region: we }, async (e) => {
    k.requireRole(e, ["super", "support"]);
    let t = k.str((e.data || {}).uid, { max: 80 }), a = await M.collection(`supportThreads/${t}/msgs`).orderBy("at", "desc").limit(100).get(), n = await M.doc(`supportThreads/${t}`).get();
    return n.exists && Y(n.data().unreadStaff) && await M.doc(`supportThreads/${t}`).update({ unreadStaff: 0 }), { username: n.exists && n.data().username || "", msgs: a.docs.map((s) => {
      let o = s.data();
      return { from: o.from, text: o.text, at: o.at, via: o.via || "" };
    }).reverse() };
  });
  ce.adminSupportReply = Se({ region: we }, async (e) => {
    let t = k.requireRole(e, ["super", "support"]), a = e.data || {}, n = k.str(a.uid, { max: 80 }), s = k.str(a.text, { min: 1, max: 1e3, label: "Message" });
    if (!(await M.doc(`supportThreads/${n}`).get()).exists) throw new Pe("not-found", "Chat not found.");
    return await Kn(n, "staff", s, { by: t, via: "panel" }), await M.runTransaction(async (o) => {
      k.notify(o, n, "Support replied", s.slice(0, 140), "support");
    }), { ok: !0 };
  });
  ce.adminSupportClose = Se({ region: we }, async (e) => {
    k.requireRole(e, ["super", "support"]);
    let t = k.str((e.data || {}).uid, { max: 80 });
    return await M.doc(`supportThreads/${t}`).set({ status: "closed", unreadStaff: 0 }, { merge: !0 }), { ok: !0 };
  });
  ce.adminTelegramSetup = Se({ region: we }, async (e) => {
    k.requireRole(e, ["super"]);
    let t = wt();
    if (!t.TELEGRAM_BOT_TOKEN) throw new Pe("failed-precondition", "Supabase Secrets \u098F TELEGRAM_BOT_TOKEN \u09A8\u09C7\u0987\u0964");
    if (!t.TELEGRAM_WEBHOOK_SECRET) throw new Pe("failed-precondition", "Supabase Secrets \u098F TELEGRAM_WEBHOOK_SECRET \u09A8\u09C7\u0987\u0964");
    let a = await Mt("getMe", {});
    if (!a || !a.ok) throw new Pe("failed-precondition", "\u09AC\u099F\u09C7\u09B0 \u099F\u09CB\u0995\u09C7\u09A8 \u0995\u09BE\u099C \u0995\u09B0\u099B\u09C7 \u09A8\u09BE\u0964");
    let n = `${String(t.SUPABASE_URL || "").replace(/\/+$/, "")}/functions/v1/api/tg`, s = await Mt("setWebhook", { url: n, secret_token: t.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ["message"] });
    if (!s || !s.ok) throw new Pe("failed-precondition", "Webhook \u09B8\u09C7\u099F \u09B9\u09AF\u09BC\u09A8\u09BF: " + (s && s.description || "unknown"));
    return t.TELEGRAM_CHAT_ID && await Mt("sendMessage", { chat_id: t.TELEGRAM_CHAT_ID, text: "\u2705 DEEMBD \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u09AC\u099F \u099A\u09BE\u09B2\u09C1 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" }), { ok: !0, bot: a.result.username, chat: !!t.TELEGRAM_CHAT_ID };
  });
  async function yr(e) {
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
    let o = await M.doc(`tgMap/${s.message_id}`).get();
    if (!o.exists) return;
    let r = o.data().uid, i = t.from && (t.from.first_name || t.from.username) || "Support";
    await Kn(r, "staff", n.slice(0, 1e3), { via: "telegram", by: `tg:${i}` }), await M.runTransaction(async (c) => {
      k.notify(c, r, "Support replied", n.slice(0, 140), "support");
    }), await Mt("sendMessage", { chat_id: a, text: "\u2713 \u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0\u0995\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09AF\u09BC\u09C7\u099B\u09C7", reply_to_message_id: t.message_id });
  }
  yr.__kind = "hook";
  ce.telegramHook = yr;
  ce.__net = wr;
});

// src/index.js
var Ar = R((yt) => {
  "use strict";
  Object.assign(
    yt,
    ws(),
    Ps(),
    Ls(),
    Hs(),
    Xs(),
    Qs(),
    Un(),
    Fo(),
    Jo(),
    er(),
    ar(),
    ma(),
    cr(),
    br()
  );
  delete yt.ensureUserDoc;
  delete yt.LOBBY;
  delete yt.forceLogoutOne;
  delete yt.helpers;
  delete yt.__net;
});

// supa/handler.js
var Sr = R((Od, kr) => {
  "use strict";
  var de = ra(), { HttpsError: Tr } = ne(), jc = {
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
  }, Fc = (e) => String(e).toUpperCase().replace(/-/g, "_"), Hc = null, Fa = () => Hc ||= Ar();
  function vr(e) {
    return {
      "access-control-allow-origin": de.env.ALLOWED_ORIGIN || "*",
      "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-max-age": "86400",
      vary: "origin",
      ...e
    };
  }
  var Oe = (e, t, a) => ({ status: e, headers: vr({ "content-type": "application/json", "cache-control": "no-store", ...a || {} }), body: JSON.stringify(t) }), Kc = (e) => e instanceof Tr || e && e.name === "HttpsError" ? Oe(jc[e.code] || 500, { error: { status: Fc(e.code), code: e.code, message: e.message, details: e.details === void 0 ? null : e.details } }) : (console.error("unhandled", e && e.stack || e), Oe(500, { error: { status: "INTERNAL", code: "internal", message: "Something went wrong on the server. Please try again.", details: null } })), Ha = de.tokenCache = /* @__PURE__ */ new Map();
  async function Wc(e) {
    if (de.verifyToken) return de.verifyToken(e);
    let t = Ha.get(e);
    if (t && t.exp > Date.now()) return t.user;
    let a = String(de.env.SUPABASE_URL || "").replace(/\/$/, "") + "/auth/v1/user", n = await de.fetch(a, { headers: { apikey: de.env.SUPABASE_ANON_KEY || de.env.SUPABASE_SERVICE_ROLE_KEY || "", authorization: "Bearer " + e } });
    if (!n.ok) return null;
    let s = await n.json();
    if (!s || !s.id) return null;
    let o = { uid: s.id, email: s.email || "", confirmed: !!s.email_confirmed_at, app: s.app_metadata || {}, lastSignIn: s.last_sign_in_at };
    return Ha.set(e, { user: o, exp: Date.now() + (Number(de.env.TOKEN_CACHE_MS) >= 0 && de.env.TOKEN_CACHE_MS !== void 0 && de.env.TOKEN_CACHE_MS !== "" ? Number(de.env.TOKEN_CACHE_MS) : 3e3) }), Ha.size > 500 && Ha.clear(), o;
  }
  var Vc = (e) => e && {
    uid: e.uid,
    token: { uid: e.uid, email: e.email, email_verified: e.confirmed || !de.requireVerified(), admin: e.app.admin === !0, role: e.app.role || null, auth_time: e.lastSignIn ? Math.floor(Date.parse(e.lastSignIn) / 1e3) : void 0 }
  }, Wn = (e) => e == null ? Buffer.alloc(0) : Buffer.from(e), zc = (e) => {
    let t = {};
    for (let [a, n] of Object.entries(e || {})) t[String(a).toLowerCase()] = n;
    return t;
  };
  async function Yc(e) {
    let t = zc(e.headers), a = String(e.method || "GET").toUpperCase();
    if (a === "OPTIONS") return { status: 204, headers: vr(), body: "" };
    let s = new URL(e.url, "http://x").pathname, o = s.indexOf("/api/");
    o >= 0 ? s = s.slice(o + 4) : s.endsWith("/api") && (s = "/"), s = s.replace(/\/+$/, "") || "/";
    try {
      if (s === "/health") return Oe(200, { ok: !0, time: Date.now() });
      if (s === "/agw" || s.startsWith("/agw/")) {
        let f = Fa().agCallback, w = { status: 200, headers: {}, body: "" }, y = { status(b) {
          return w.status = b, y;
        }, set(b) {
          return Object.assign(w.headers, b), y;
        }, send(b) {
          return w.body = b, y;
        } };
        return await f({ method: a, path: s, url: s, headers: t, rawBody: Wn(e.body), ip: t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : "" }, y), { status: w.status, headers: { "cache-control": "no-store", ...w.headers }, body: typeof w.body == "string" ? w.body : JSON.stringify(w.body) };
      }
      if (s === "/tg") {
        if (!de.env.TELEGRAM_WEBHOOK_SECRET || t["x-telegram-bot-api-secret-token"] !== de.env.TELEGRAM_WEBHOOK_SECRET) return Oe(401, { ok: !1 });
        let f = null;
        try {
          f = JSON.parse(Wn(e.body).toString("utf8") || "{}");
        } catch {
          f = null;
        }
        try {
          await Fa().telegramHook(f);
        } catch {
        }
        return Oe(200, { ok: !0 });
      }
      if (s.startsWith("/_cron/")) {
        if (!de.env.CRON_SECRET || t["x-cron-secret"] !== de.env.CRON_SECRET) return Oe(401, { error: { code: "unauthenticated", message: "bad secret" } });
        let f = Fa()[s.slice(7)];
        return !f || f.__kind !== "schedule" ? Oe(404, { error: { code: "not-found", message: "unknown job" } }) : (await f(), Oe(200, { ok: !0 }));
      }
      if (a !== "POST") return Oe(405, { error: { code: "invalid-argument", message: "POST only" } });
      let r = s.slice(1), i = Fa()[r];
      if (!i || i.__kind !== "call") return Oe(404, { error: { status: "NOT_FOUND", code: "not-found", message: "Unknown function." } });
      let c = null, d = /^Bearer\s+(.+)$/i.exec(t.authorization || "");
      if (d) {
        let f = await Wc(d[1]).catch(() => null);
        f && (c = Vc(f));
      }
      let u = {}, l = Wn(e.body).toString("utf8");
      if (l)
        try {
          let f = JSON.parse(l);
          u = f && f.data !== void 0 ? f.data : f;
        } catch {
          throw new Tr("invalid-argument", "Bad JSON.");
        }
      let m = t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : t["cf-connecting-ip"] || "", p = await i({ data: u, auth: c, rawRequest: { headers: t, ip: m } });
      return Oe(200, { result: p === void 0 ? null : p });
    } catch (r) {
      return Kc(r);
    }
  }
  kr.exports = { handle: Yc };
});

// supa/entry-deno.mjs
var Cr = Xn(ra(), 1), _r = Xn(Sr(), 1);
import Jc from "npm:postgres@3.4.4";
var Ir = {};
for (let e of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET", "REQUIRE_VERIFIED", "ALLOWED_ORIGIN", "SITE_URL", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_REGION"]) Ir[e] = Deno.env.get(e) || "";
var Xc = Deno.env.get("DB_URL") || Deno.env.get("SUPABASE_DB_URL"), Zc = Jc(Xc, { max: 4, prepare: !1, idle_timeout: 20, connect_timeout: 10, onnotice() {
} });
Cr.default.configure({ sql: Zc, env: Ir });
Deno.serve(async (e) => {
  let t = {};
  e.headers.forEach((s, o) => {
    t[o] = s;
  });
  let a = e.method === "GET" || e.method === "HEAD" || e.method === "OPTIONS" ? void 0 : new Uint8Array(await e.arrayBuffer()), n = await (0, _r.handle)({ method: e.method, url: e.url, headers: t, body: a });
  return new Response(n.status === 204 ? null : n.body, { status: n.status, headers: n.headers });
});
