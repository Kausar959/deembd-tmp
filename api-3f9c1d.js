// @ts-nocheck
import { createRequire as __cr } from "node:module";
import { Buffer as __Buf } from "node:buffer";
import __proc from "node:process";
const require = __cr("file:///src/index.ts");
globalThis.Buffer = globalThis.Buffer || __Buf;
globalThis.process = globalThis.process || __proc;
var nr = Object.create;
var hn = Object.defineProperty;
var ar = Object.getOwnPropertyDescriptor;
var rr = Object.getOwnPropertyNames;
var sr = Object.getPrototypeOf, or = Object.prototype.hasOwnProperty;
var me = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, {
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
var ir = (e, t, n, a) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let r of rr(t))
      !or.call(e, r) && r !== n && hn(e, r, { get: () => t[r], enumerable: !(a = ar(t, r)) || a.enumerable });
  return e;
};
var gn = (e, t, n) => (n = e != null ? nr(sr(e)) : {}, ir(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  t || !e || !e.__esModule ? hn(n, "default", { value: e, enumerable: !0 }) : n,
  e
));

// supa/pgdb.js
var Ye = O((Zs, yn) => {
  "use strict";
  var cr = me("crypto"), dr = {
    increment: (e) => ({ __op: "inc", n: e }),
    serverTimestamp: () => ({ __op: "ts" })
  }, lr = {
    count: () => ({ aggregateType: "count" }),
    sum: (e) => ({ aggregateType: "sum", _field: e })
  }, ur = (e) => Object.defineProperties({ __ts: e }, {
    toMillis: { value: () => e },
    toDate: { value: () => new Date(e) },
    seconds: { value: Math.floor(e / 1e3) },
    nanoseconds: { value: e % 1e3 * 1e6 }
  });
  function ct(e) {
    if (Array.isArray(e)) return e.map(ct);
    if (e && typeof e == "object") {
      if (typeof e.__ts == "number" && Object.keys(e).length === 1) return ur(e.__ts);
      let t = {};
      for (let [n, a] of Object.entries(e)) t[n] = ct(a);
      return t;
    }
    return e;
  }
  function ye(e) {
    if (e instanceof Date) return { __ts: e.getTime() };
    if (Array.isArray(e)) return e.map(ye);
    if (e && typeof e == "object") {
      if (e.__op) return e;
      if (typeof e.toMillis == "function" && typeof e.__ts == "number") return { __ts: e.__ts };
      let t = {};
      for (let [n, a] of Object.entries(e)) a !== void 0 && (t[n] = ye(a));
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
  function wn(e, t, n) {
    let a = t.split("."), r = e;
    for (let o = 0; o < a.length - 1; o++)
      (typeof r[a[o]] != "object" || r[a[o]] === null) && (r[a[o]] = {}), r = r[a[o]];
    let s = a[a.length - 1];
    r[s] = dt(r[s], n);
  }
  function Ke(e, t) {
    for (let [n, a] of Object.entries(t))
      a && typeof a == "object" && !a.__op && !Array.isArray(a) && typeof a.__ts != "number" && e[n] && typeof e[n] == "object" && !Array.isArray(e[n]) && typeof e[n].__ts != "number" ? Ke(e[n], a) : e[n] = dt(e[n], a);
    return e;
  }
  var mr = (e) => {
    let t = e.lastIndexOf("/");
    return { collection: e.slice(0, t), id: e.slice(t + 1) };
  }, Be = class {
    constructor(t, n) {
      this.ref = t, this.id = t.id, this._d = n, this.exists = n !== void 0;
    }
    data() {
      return this._d === void 0 ? void 0 : ct(JSON.parse(JSON.stringify(this._d)));
    }
  }, fr = (e) => {
    let t = new Error("ALREADY_EXISTS " + e);
    return t.code = 6, t;
  }, pr = (e) => {
    let t = new Error("NOT_FOUND " + e);
    return t.code = 5, t;
  }, Ot = class {
    /** @param sql a `postgres` (porsager) client */
    constructor(t) {
      this.sql = t;
    }
    doc(t) {
      return new Le(this, t);
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
          await this.sql.begin(async (a) => {
            for (let r of t) await this._apply(a, r);
          });
        }
      };
      return n;
    }
    async _lockRead(t, n) {
      await t`select pg_advisory_xact_lock(hashtextextended(${n}, 0))`;
      let a = await t`select data from public.docs where path = ${n}`;
      return a.length ? a[0].data : void 0;
    }
    async _apply(t, n) {
      let a = await this._lockRead(t, n.path), { collection: r, id: s } = mr(n.path);
      if (n.type === "delete") {
        await t`delete from public.docs where path = ${n.path}`;
        return;
      }
      let o;
      if (n.type === "create") {
        if (a !== void 0) throw fr(n.path);
        o = Ke({}, ye(n.data));
      } else if (n.type === "set") o = n.merge && a ? Ke(JSON.parse(JSON.stringify(a)), ye(n.data)) : Ke({}, ye(n.data));
      else if (n.type === "update") {
        if (a === void 0) throw pr(n.path);
        o = JSON.parse(JSON.stringify(a));
        for (let [i, d] of Object.entries(ye(n.data))) wn(o, i, d);
      } else throw new Error("bad op " + n.type);
      await t`insert into public.docs (path, collection, id, data) values (${n.path}, ${r}, ${s}, ${t.json(o)}::jsonb)
            on conflict (path) do update set data = excluded.data`;
    }
    async _one(t) {
      return this.sql.begin((n) => this._apply(n, t));
    }
    /** Reads first, writes buffered and applied atomically (retried on deadlock / serialization failure like Firestore). */
    async runTransaction(t) {
      for (let n = 0; ; n++)
        try {
          return await this.sql.begin(async (a) => {
            let r = [], s = {
              get: async (i) => i instanceof Le ? new Be(i, await this._lockRead(a, i.path)) : i._exec(a),
              getAll: async (...i) => Promise.all(i.map(async (d) => new Be(d, await this._lockRead(a, d.path)))),
              set: (i, d, c = {}) => (r.push({ type: "set", path: i.path, data: d, merge: !!c.merge }), s),
              update: (i, d) => (r.push({ type: "update", path: i.path, data: d }), s),
              create: (i, d) => (r.push({ type: "create", path: i.path, data: d }), s),
              delete: (i) => (r.push({ type: "delete", path: i.path }), s)
            }, o = await t(s);
            for (let i of r) await this._apply(a, i);
            return o;
          });
        } catch (a) {
          if ((a.code === "40P01" || a.code === "40001") && n < 4) {
            await new Promise((r) => setTimeout(r, 30 * (n + 1) + Math.random() * 40));
            continue;
          }
          throw a;
        }
    }
  }, Le = class {
    constructor(t, n) {
      this.db = t, this.path = n, this.id = n.split("/").pop();
    }
    async get() {
      let t = await this.db.sql`select data from public.docs where path = ${this.path}`;
      return new Be(this, t.length ? t[0].data : void 0);
    }
    set(t, n = {}) {
      return this.db._one({ type: "set", path: this.path, data: t, merge: !!n.merge });
    }
    update(t) {
      return this.db._one({ type: "update", path: this.path, data: t });
    }
    create(t) {
      return this.db._one({ type: "create", path: this.path, data: t });
    }
    delete() {
      return this.db._one({ type: "delete", path: this.path });
    }
    collection(t) {
      return new lt(this.db, `${this.path}/${t}`);
    }
  }, Mt = class e {
    constructor(t, n, a = [], r = [], s = null, o = null) {
      Object.assign(this, { db: t, path: n, f: a, o: r, lim: s, after: o });
    }
    where(t, n, a) {
      return new e(this.db, this.path, [...this.f, [t, n, ye(a)]], this.o, this.lim, this.after);
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
      let a = (await t`select * from public.fs_query(${this.path}::text, ${t.json(this.f)}::jsonb, ${t.json(this.o)}::jsonb, ${this.lim}::int, ${this.after ? this.after.ref.path : null}::text)`).map((r) => new Be(new Le(this.db, r.path), r.data));
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
  }, lt = class extends Mt {
    constructor(t, n) {
      super(t, n);
    }
    doc(t) {
      return new Le(this.db, `${this.path}/${t || cr.randomBytes(10).toString("hex")}`);
    }
    async add(t) {
      let n = this.doc();
      return await n.set(t), n;
    }
  };
  yn.exports = { PgDb: Ot, FieldValue: dr, AggregateField: lr, revive: ct, plain: ye, merge: Ke, setPath: wn };
});

// supa/runtime.js
var ut = O((Qs, bn) => {
  "use strict";
  var de = { sql: null, db: null, env: {}, fetch: (...e) => fetch(...e) };
  de.configure = ({ sql: e, env: t, fetch: n }) => {
    let { PgDb: a } = Ye();
    return de.sql = e, de.db = new a(e), de.env = t || {}, globalThis.__ENV = de.env, n && (de.fetch = n), de;
  };
  de.requireVerified = () => String(de.env.REQUIRE_VERIFIED || "0") === "1";
  bn.exports = de;
});

// supa/shims/functions-https.js
var ne = O((eo, Tn) => {
  "use strict";
  var Dt = class extends Error {
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
  Tn.exports = { HttpsError: Dt, onCall: hr, onRequest: gr };
});

// supa/shims/functions-v1.js
var vn = O((to, Sn) => {
  "use strict";
  var An = () => {
    let e = () => {
    };
    return e.__kind = "trigger", e;
  };
  Sn.exports = { region: () => ({ auth: { user: () => ({ onCreate: An, onDelete: An }) } }) };
});

// supa/shims/firebase-admin.js
var En = O((no, Ut) => {
  "use strict";
  var U = ut(), { FieldValue: _n, AggregateField: wr } = Ye(), Nn = () => U.db;
  Nn.FieldValue = _n;
  var yr = new Proxy(Nn, { get: (e, t) => t === "FieldValue" ? _n : t === "AggregateField" ? wr : U.db[t] && typeof U.db[t] == "function" ? U.db[t].bind(U.db) : e[t] }), Cn = (e) => e && {
    uid: e.id,
    email: e.email || "",
    emailVerified: !!e.email_confirmed_at || !U.requireVerified(),
    displayName: e.raw_user_meta_data && (e.raw_user_meta_data.displayName || e.raw_user_meta_data.name) || "",
    disabled: !!e.banned_until && new Date(e.banned_until).getTime() > Date.now(),
    customClaims: e.raw_app_meta_data || {}
  }, kn = (e) => {
    let t = new Error(e || "There is no user record");
    return t.code = "auth/user-not-found", t;
  }, br = {
    async getUser(e) {
      let t = await U.sql`select * from auth.users where id = ${e}::uuid`;
      if (!t.length) throw kn();
      return Cn(t[0]);
    },
    async getUserByEmail(e) {
      let t = await U.sql`select * from auth.users where lower(email) = lower(${e}) limit 1`;
      if (!t.length) throw kn();
      return Cn(t[0]);
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
  }, In = (e) => e.startsWith("deposits/") ? { bucket: "deposits", name: e.slice(9) } : { bucket: "pub", name: e }, Tr = () => ({
    bucket: () => ({
      file: (e) => ({
        async exists() {
          let t = In(e);
          return [(await U.sql`select 1 from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`).length > 0];
        },
        async getMetadata() {
          let t = In(e), n = await U.sql`select metadata from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`, a = n[0] && n[0].metadata || {};
          return [{ contentType: a.mimetype || a.contentType || "", size: Number(a.size) || 0 }];
        }
      })
    })
  }), Ar = () => ({ sendEachForMulticast: async () => ({ responses: [] }) }), $n = { apps: [1], initializeApp() {
  }, firestore: yr, auth: () => br, storage: Tr, messaging: Ar };
  Ut.exports = $n;
  Ut.exports.default = $n;
});

// src/util.js
var ae = O((ao, Pn) => {
  "use strict";
  var ze = En(), { HttpsError: Te } = ne();
  ze.apps.length || ze.initializeApp();
  var Ge = ze.firestore(), qe = ze.firestore.FieldValue, Sr = "asia-south1", Rn = ["main", "winning", "referral", "commission"], vr = ["super", "finance", "support", "content"], be = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, Ie = (e) => new Te("invalid-argument", e);
  function Bt(e) {
    if (!e.auth) throw new Te("unauthenticated", "Please sign in.");
    return e.auth.uid;
  }
  function Cr(e) {
    let t = Bt(e);
    if (!e.auth.token.email_verified) throw new Te("failed-precondition", "Please verify your email first.");
    return t;
  }
  function kr(e, t) {
    let n = Bt(e), a = e.auth.token;
    if (a.admin !== !0 || !t.includes(a.role)) throw new Te("permission-denied", "You do not have permission.");
    return n;
  }
  function Ir(e, { min: t = 0.01, max: n = 1e9, label: a = "Amount" } = {}) {
    let r = Number(e);
    if (!Number.isFinite(r)) throw Ie(`${a} must be a number.`);
    if (r < t) throw Ie(`${a} must be at least ${t}.`);
    if (r > n) throw Ie(`${a} must be at most ${n}.`);
    return be(r);
  }
  function _r(e, { min: t = 1, max: n = 200, label: a = "Value", pattern: r = null } = {}) {
    if (typeof e != "string") throw Ie(`${a} is required.`);
    let s = e.trim();
    if (s.length < t || s.length > n) throw Ie(`${a} must be ${t}-${n} characters.`);
    if (r && !r.test(s)) throw Ie(`${a} has an invalid format.`);
    return s;
  }
  function Nr(e) {
    if (!e) throw new Te("not-found", "User profile not found.");
    if (e.status !== "active") throw new Te("permission-denied", "This account is not active.");
  }
  function $r(e, t, n = ["main", "winning"]) {
    let a = be(t);
    if (be(n.reduce((o, i) => o + (Number(e?.[i]) || 0), 0)) < a) throw new Te("failed-precondition", "Insufficient balance.");
    let s = {};
    for (let o of n) {
      let i = Math.min(Number(e?.[o]) || 0, a);
      if (i > 0 && (s[o] = be(i), a = be(a - i)), a <= 0) break;
    }
    return s;
  }
  function Er(e, t, n) {
    let a = {};
    for (let [r, s] of Object.entries(n)) {
      if (!Rn.includes(r)) throw new Error("bad bucket " + r);
      a[`balances.${r}`] = qe.increment(be(s));
    }
    e.update(t, a);
  }
  function Rr(e, { uid: t, type: n, direction: a, amount: r, bucket: s = "main", note: o = "", ref: i = "" }) {
    e.set(Ge.collection("transactions").doc(), {
      uid: t,
      type: n,
      direction: a,
      amount: be(r),
      bucket: s,
      note: o,
      ref: i,
      createdAt: qe.serverTimestamp()
    });
  }
  function Pr(e, t, n, a, r = "info") {
    e.set(Ge.collection("users").doc(t).collection("notifications").doc(), {
      title: n,
      body: a,
      type: r,
      read: !1,
      createdAt: qe.serverTimestamp()
    });
  }
  function Or(e, t) {
    let n = {};
    for (let [a, r] of Object.entries(t)) n[a] = qe.increment(r);
    e.set(Ge.doc("stats/global"), n, { merge: !0 });
  }
  function Mr(e, t, n, a = {}) {
    let r = Ge.collection("auditLogs").doc(), s = { actorUid: t, action: n, detail: a, at: qe.serverTimestamp() };
    e ? e.set(r, s) : r.set(s);
  }
  async function Dr() {
    let e = await Ge.doc("settings/site").get();
    return e.exists ? e.data() : {};
  }
  Pn.exports = {
    admin: ze,
    db: Ge,
    FieldValue: qe,
    HttpsError: Te,
    REGION: Sr,
    BUCKETS: Rn,
    STAFF_ROLES: vr,
    round2: be,
    bad: Ie,
    authUid: Bt,
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
var Dn = O((Je) => {
  "use strict";
  var Ur = vn(), { onCall: Mn } = ne(), x = ae(), { db: X, admin: Lt, FieldValue: _e, HttpsError: Gt, REGION: qt } = x, On = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", Br = () => Array.from({ length: 8 }, () => On[me("crypto").randomInt(0, On.length)]).join("");
  async function mt(e, t = "", n = "") {
    let a = X.doc(`users/${e}`);
    if ((await a.get()).exists) return;
    let r = null;
    for (let s = 0; s < 8 && !r; s++) {
      let o = Br();
      try {
        await X.doc(`referralCodes/${o}`).create({ uid: e }), r = o;
      } catch (i) {
        if (i.code !== 6 && !/ALREADY_EXISTS/.test(String(i))) throw i;
      }
    }
    if (!r) throw new Gt("internal", "Could not allocate referral code.");
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
        createdAt: _e.serverTimestamp(),
        lastLoginAt: null,
        lastSeenAt: null
      }), x.bumpStats(s, { totalUsers: 1 }));
    });
  }
  Je.onAuthCreate = Ur.region(qt).auth.user().onCreate((e) => mt(e.uid, e.email || "", e.displayName || ""));
  Je.completeRegistration = Mn({ region: qt }, async (e) => {
    let t = x.authUid(e), n = e.data || {}, a = x.str(n.name, { min: 2, max: 60, label: "Name" }), r = x.str(n.username, { min: 3, max: 20, label: "Username", pattern: /^[A-Za-z0-9_]+$/ }).toLowerCase(), s = x.str(n.phone, { min: 8, max: 16, label: "Phone", pattern: /^\+?[0-9]{8,15}$/ }), o = typeof n.referralCode == "string" ? n.referralCode.trim().toUpperCase() : "", i = await Lt.auth().getUser(t);
    await mt(t, i.email || "", a);
    let d = "";
    if (o) {
      let c = await X.doc(`referralCodes/${o}`).get();
      if (!c.exists) throw x.bad("Referral code not found.");
      if (c.data().uid === t) throw x.bad("You cannot use your own referral code.");
      d = c.data().uid;
    }
    return await X.runTransaction(async (c) => {
      let u = X.doc(`users/${t}`);
      if ((await c.get(u)).data().profileComplete) return;
      let m = X.doc(`usernames/${r}`);
      if ((await c.get(m)).exists) throw new Gt("already-exists", "Username is already taken.");
      c.set(m, { uid: t }), c.update(u, { name: a, username: r, phone: s, referredBy: d, profileComplete: !0 });
    }), await Lt.auth().updateUser(t, { displayName: a }), { ok: !0 };
  });
  Je.bootstrap = Mn({ region: qt }, async (e) => {
    let t = x.authUid(e), n = await Lt.auth().getUser(t);
    await mt(t, n.email || "", n.displayName || "");
    let a = X.doc(`users/${t}`), r = await x.siteSettings(), s = x.round2(Number(r.welcomeBonus) || 0), o = x.round2(Number(r.referral?.signupReward) || 0);
    if ((await X.runTransaction(async (c) => {
      let l = (await c.get(a)).data();
      if (l.status !== "active") return { banned: !0 };
      let m = n.emailVerified && l.profileComplete && !l.signupRewardsGiven, p = null;
      m && l.referredBy && o > 0 && (p = await c.get(X.doc(`users/${l.referredBy}`)));
      let f = { lastLoginAt: _e.serverTimestamp(), lastSeenAt: _e.serverTimestamp() };
      if (m && (f.signupRewardsGiven = !0, s > 0 && (f["balances.main"] = _e.increment(s), x.ledger(c, { uid: t, type: "bonus", direction: "in", amount: s, bucket: "main", note: "Welcome bonus" }), x.notify(c, t, "Welcome!", `${s} welcome bonus has been added to your wallet.`, "bonus")), p && p.exists && p.data().status === "active")) {
        let w = l.referredBy;
        c.update(X.doc(`users/${w}`), { "balances.referral": _e.increment(o) }), x.ledger(c, { uid: w, type: "referral", direction: "in", amount: o, bucket: "referral", note: `Referral: ${l.username}` }), x.notify(c, w, "New referral", `${l.username} joined with your code. +${o}`, "referral"), c.set(X.doc(`referrals/${t}`), {
          referrerUid: w,
          referredUid: t,
          referredName: l.username,
          rewardAmount: o,
          commissionTotal: 0,
          createdAt: _e.serverTimestamp()
        }), x.bumpStats(c, { totalReferrals: 1 });
      }
      return c.update(a, f), { banned: !1 };
    })).banned) throw new Gt("permission-denied", "This account is banned.");
    let d = (e.rawRequest?.headers?.["x-forwarded-for"] || e.rawRequest?.ip || "").toString().split(",")[0].trim();
    return await X.collection("loginHistory").add({
      uid: t,
      at: _e.serverTimestamp(),
      ip: d,
      ua: (e.rawRequest?.headers?.["user-agent"] || "").toString().slice(0, 300)
    }), { ok: !0, emailVerified: n.emailVerified };
  });
  Je.ensureUserDoc = mt;
});

// src/wallet.js
var Ln = O((Xe) => {
  "use strict";
  var { onCall: ft } = ne(), h = ae(), { db: R, admin: Lr, FieldValue: Ae, HttpsError: Z, REGION: pt } = h, Bn = (e, t) => e && e.enabled === !0 && [t, "both"].includes(e.type || "both"), jt = () => new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10), Un = () => jt().slice(0, 7), fe = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  Xe.submitDeposit = ft({ region: pt }, async (e) => {
    let t = h.requireVerified(e), n = e.data || {}, a = h.str(n.methodId, { max: 80, label: "Method" }), r = n.accountId ? h.str(n.accountId, { max: 120, label: "Account" }) : "", s = h.amountOf(n.amount), o = h.str(n.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), i = typeof n.senderNumber == "string" ? n.senderNumber.trim().slice(0, 30) : "", d = h.str(n.screenshotPath, { max: 200, label: "Screenshot" });
    if (!d.startsWith(`deposits/${t}/`) || d.includes("..")) throw h.bad("Invalid screenshot path.");
    let c = Lr.storage().bucket().file(d), [u] = await c.exists();
    if (!u) throw new Z("failed-precondition", "Screenshot upload was not found. Please upload again.");
    let [l] = await c.getMetadata();
    if (!String(l.contentType || "").startsWith("image/")) throw h.bad("Screenshot must be an image.");
    let p = (await h.siteSettings()).deposit || {}, f = fe(p.min) || 1, w = fe(p.max) || 1e7;
    if (s < f || s > w) throw h.bad(`Amount must be between ${f} and ${w}.`);
    if ((await R.collection("deposits").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= 5) throw new Z("resource-exhausted", "Too many pending deposits. Please wait for review.");
    let g = new Date(Date.now() + 6 * 36e5);
    g.setUTCHours(0, 0, 0, 0);
    let $ = new Date(g.getTime() - 6 * 36e5), k = (await R.collection("deposits").where("uid", "==", t).where("createdAt", ">=", $).get()).docs.filter((y) => y.data().status !== "rejected").reduce((y, C) => y + fe(C.data().amount), 0), M = (await R.doc(`users/${t}`).get()).data()?.dupTrx || {};
    if (M.blockedUntil && M.blockedUntil > Date.now()) throw new Z("permission-denied", `Deposits are blocked until ${new Date(M.blockedUntil).toISOString().slice(0, 16).replace("T", " ")} UTC because of repeated duplicate transaction IDs.`);
    if ((await R.doc(`trxIndex/${a}_${o}`).get()).exists) {
      let y = M.lastAt && M.lastAt > Date.now() - 864e5 ? (M.count || 0) + 1 : 1, C = { "dupTrx.count": y, "dupTrx.lastAt": Date.now() };
      throw y >= 2 && (C["dupTrx.blockedUntil"] = Date.now() + 864e5), await R.doc(`users/${t}`).update(C), await R.doc("stats/global").set({ duplicateAttempts: Ae.increment(1) }, { merge: !0 }), h.audit(null, t, "duplicate_trx_attempt", { methodId: a, trxId: o, count: y }), new Z("already-exists", y >= 2 ? "This transaction ID was already used. Deposits are blocked for 24 hours." : "This transaction ID was already used. Another attempt will block deposits for 24 hours.");
    }
    let B = R.collection("deposits").doc();
    return await R.runTransaction(async (y) => {
      let C = [y.get(R.doc(`paymentMethods/${a}`)), y.get(R.doc(`users/${t}`)), y.get(R.doc(`trxIndex/${a}_${o}`))];
      r && C.push(y.get(R.doc(`paymentAccounts/${r}`)));
      let [L, ee, ue, J] = await Promise.all(C);
      h.assertActive(ee.data());
      let Y = L.data();
      if (!L.exists || !Bn(Y, "deposit")) throw h.bad("This payment method is not available.");
      if (Y.minAmount && s < Y.minAmount) throw h.bad(`Minimum for ${Y.name} is ${Y.minAmount}.`);
      if (Y.maxAmount && s > Y.maxAmount) throw h.bad(`Maximum for ${Y.name} is ${Y.maxAmount}.`);
      let De = ee.data().rg || {}, Ue = De.pendingLimitAt && De.pendingLimitAt <= Date.now() ? fe(De.pendingLimit) : fe(De.dailyDepositLimit);
      if (Ue > 0 && k + s > Ue) throw new Z("failed-precondition", `Your daily deposit limit is ${Ue}. Remaining today: ${Math.max(0, h.round2(Ue - k))}.`);
      if (ue.exists) throw new Z("already-exists", "This transaction ID has already been submitted.");
      let un = Y.accountNumber || "", mn = "";
      if (r) {
        let te = J && J.exists ? J.data() : null;
        if (!te || te.status !== "active" || te.methodId !== a) throw new Z("failed-precondition", "This payment account is no longer available. Please choose again.");
        let fn = te.usedTodayKey === jt() ? fe(te.usedToday) : 0, pn = te.usedMonthKey === Un() ? fe(te.usedMonth) : 0;
        if (fn + s > fe(te.dailyLimit) || pn + s > fe(te.monthlyLimit)) throw new Z("failed-precondition", "This account reached its limit. Please choose again.");
        y.update(J.ref, {
          usedToday: h.round2(fn + s),
          usedTodayKey: jt(),
          usedMonth: h.round2(pn + s),
          usedMonthKey: Un(),
          totalDeposits: Ae.increment(1),
          totalCollected: Ae.increment(s),
          lastUsedAt: Date.now()
        }), un = te.accountNumber || "", mn = te.holderName || "";
      }
      y.set(R.doc(`trxIndex/${a}_${o}`), { uid: t, depositId: B.id }), y.set(B, {
        uid: t,
        username: ee.data().username,
        methodId: a,
        methodName: Y.name,
        accountId: r,
        accountNumber: un,
        holderName: mn,
        amount: s,
        trxId: o,
        senderNumber: i,
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
    let s = typeof n.note == "string" ? n.note.trim().slice(0, 300) : "", o = await h.siteSettings(), i = Number(o.referral?.depositCommissionPct) || 0;
    return await R.runTransaction(async (d) => {
      let c = R.doc(`deposits/${a}`), u = await d.get(c);
      if (!u.exists) throw new Z("not-found", "Deposit not found.");
      let l = u.data();
      if (l.status !== "pending") throw new Z("failed-precondition", `Already ${l.status}.`);
      let m = R.doc(`users/${l.uid}`), p = await d.get(m), f = null, w = null;
      r && i > 0 && p.data().referredBy && (f = await d.get(R.doc(`users/${p.data().referredBy}`)), w = await d.get(R.doc(`referrals/${l.uid}`)));
      let T = { status: r ? "approved" : "rejected", note: s, reviewedAt: Ae.serverTimestamp(), reviewedBy: t };
      if (d.update(c, T), r) {
        if (h.applyDelta(d, m, { main: l.amount }), h.ledger(d, { uid: l.uid, type: "deposit", direction: "in", amount: l.amount, bucket: "main", note: l.methodName, ref: a }), h.notify(d, l.uid, "Deposit approved", `${l.amount} has been added to your wallet.`, "deposit"), h.bumpStats(d, { totalDeposits: l.amount, depositCount: 1, pendingDeposits: -1 }), f && f.exists && f.data().status === "active") {
          let g = h.round2(l.amount * i / 100);
          g > 0 && (h.applyDelta(d, f.ref, { commission: g }), h.ledger(d, { uid: f.id, type: "commission", direction: "in", amount: g, bucket: "commission", note: `Deposit by ${p.data().username}`, ref: a }), h.notify(d, f.id, "Referral commission", `+${g} from ${p.data().username}'s deposit.`, "referral"), w && w.exists && d.update(w.ref, { commissionTotal: Ae.increment(g) }), h.bumpStats(d, { commissionPaid: g }));
        }
      } else
        d.delete(R.doc(`trxIndex/${l.methodId}_${l.trxId}`)), h.notify(d, l.uid, "Deposit rejected", s || "Your deposit request was rejected.", "deposit"), h.bumpStats(d, { pendingDeposits: -1 });
      h.audit(d, t, r ? "deposit_approved" : "deposit_rejected", { depositId: a, amount: l.amount, uid: l.uid });
    }), { ok: !0 };
  });
  Xe.requestWithdraw = ft({ region: pt }, async (e) => {
    let t = h.requireVerified(e), n = e.data || {}, a = h.str(n.methodId, { max: 80, label: "Method" }), r = n.bucket ? h.str(n.bucket, { max: 20, label: "Wallet" }) : "auto", s = h.amountOf(n.amount), o = h.str(n.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }), i = typeof n.holderName == "string" ? n.holderName.trim().slice(0, 60) : "", c = (await h.siteSettings()).withdraw || {}, u = c.allowedBuckets || ["winning", "referral", "commission"];
    if (r !== "auto" && !u.includes(r)) throw h.bad("This wallet cannot be withdrawn from.");
    let l = h.round2(s * (Number(c.feePct) || 0) / 100 + (Number(c.feeFlat) || 0));
    if (l >= s) throw h.bad("Amount is too small after fees.");
    if ((await R.collection("withdrawals").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= 3) throw new Z("resource-exhausted", "You have too many pending withdrawals.");
    let p = R.collection("withdrawals").doc();
    return await R.runTransaction(async (f) => {
      let [w, T] = await Promise.all([f.get(R.doc(`paymentMethods/${a}`)), f.get(R.doc(`users/${t}`))]);
      h.assertActive(T.data());
      let g = w.data();
      if (!w.exists || !Bn(g, "withdraw")) throw h.bad("This withdraw method is not available.");
      let $ = Math.max(Number(c.min) || 0, g.withdrawMin || 0), A = Math.min(Number(c.max) || 1 / 0, g.withdrawMax || 1 / 0);
      if (s < $ || s > A) throw h.bad(`Amount must be between ${$} and ${A === 1 / 0 ? "\u221E" : A}.`);
      let k = r === "auto" ? u : [r], E = h.planDebit(T.data().balances, s, k), M = {};
      for (let [B, y] of Object.entries(E)) M[B] = -y;
      h.applyDelta(f, T.ref, M), h.ledger(f, { uid: t, type: "withdraw_hold", direction: "out", amount: s, bucket: Object.keys(E)[0], note: g.name, ref: p.id }), h.notify(f, t, "Withdrawal requested", `${s} is waiting for approval (you receive ${h.round2(s - l)}).`, "withdraw"), f.set(p, {
        uid: t,
        username: T.data().username,
        methodId: a,
        methodName: g.name,
        bucket: Object.keys(E)[0],
        plan: E,
        holderName: i,
        accountNumber: o,
        amount: s,
        fee: l,
        net: h.round2(s - l),
        status: "pending",
        note: "",
        createdAt: Ae.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), h.bumpStats(f, { pendingWithdrawals: 1 });
    }), { ok: !0, withdrawalId: p.id, fee: l, net: h.round2(s - l) };
  });
  Xe.reviewWithdrawal = ft({ region: pt }, async (e) => {
    let t = h.requireRole(e, ["super", "finance"]), n = e.data || {}, a = h.str(n.withdrawalId, { max: 80 }), r = n.action === "approve";
    if (!r && n.action !== "reject") throw h.bad("Invalid action.");
    let s = typeof n.note == "string" ? n.note.trim().slice(0, 300) : "";
    return await R.runTransaction(async (o) => {
      let i = R.doc(`withdrawals/${a}`), d = await o.get(i);
      if (!d.exists) throw new Z("not-found", "Withdrawal not found.");
      let c = d.data();
      if (c.status !== "pending") throw new Z("failed-precondition", `Already ${c.status}.`);
      o.update(i, { status: r ? "approved" : "rejected", note: s, reviewedAt: Ae.serverTimestamp(), reviewedBy: t }), r ? (h.notify(o, c.uid, "Withdrawal approved", `${c.net} is on its way to ${c.accountNumber}.`, "withdraw"), h.ledger(o, { uid: c.uid, type: "withdraw", direction: "out", amount: 0, bucket: c.bucket, note: `Paid ${c.net} (fee ${c.fee})`, ref: a }), h.bumpStats(o, { totalWithdrawals: c.amount, feesCollected: c.fee, withdrawCount: 1, pendingWithdrawals: -1 })) : (h.applyDelta(o, R.doc(`users/${c.uid}`), c.plan && Object.keys(c.plan).length ? c.plan : { [c.bucket]: c.amount }), h.ledger(o, { uid: c.uid, type: "withdraw_refund", direction: "in", amount: c.amount, bucket: c.bucket, note: "Withdrawal rejected", ref: a }), h.notify(o, c.uid, "Withdrawal rejected", s || "Your withdrawal was rejected and the amount was returned.", "withdraw"), h.bumpStats(o, { pendingWithdrawals: -1 })), h.audit(o, t, r ? "withdraw_approved" : "withdraw_rejected", { withdrawalId: a, amount: c.amount, uid: c.uid });
    }), { ok: !0 };
  });
});

// supa/shims/functions-firestore.js
var qn = O((oo, Gn) => {
  "use strict";
  Gn.exports = { onDocumentCreated: (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "trigger", n;
  } };
});

// src/admin.js
var xn = O((je) => {
  "use strict";
  var { onCall: ht } = ne(), { onDocumentCreated: Gr } = qn(), _ = ae(), { db: pe, admin: Ne, FieldValue: qr, HttpsError: jn, REGION: Ze } = _;
  je.adminAdjustBalance = ht({ region: Ze }, async (e) => {
    let t = _.requireRole(e, ["super", "finance"]), n = e.data || {}, a = _.str(n.uid, { max: 128 }), r = _.str(n.bucket, { max: 20 });
    if (!_.BUCKETS.includes(r)) throw _.bad("Invalid wallet.");
    let s = _.amountOf(Math.abs(Number(n.delta)), { min: 0.01, max: 1e7, label: "Amount" }) * (Number(n.delta) < 0 ? -1 : 1), o = _.str(n.reason, { min: 3, max: 200, label: "Reason" });
    return await pe.runTransaction(async (i) => {
      let d = pe.doc(`users/${a}`), c = await i.get(d);
      if (!c.exists) throw new jn("not-found", "User not found.");
      if (_.round2((c.data().balances?.[r] || 0) + s) < 0) throw _.bad("Balance cannot go below zero.");
      _.applyDelta(i, d, { [r]: s }), _.ledger(i, { uid: a, type: "admin_adjust", direction: s > 0 ? "in" : "out", amount: Math.abs(s), bucket: r, note: o }), _.notify(i, a, "Balance updated", `${s > 0 ? "+" : ""}${s} (${o})`, "info"), _.audit(i, t, "balance_adjust", { uid: a, bucket: r, delta: s, reason: o });
    }), { ok: !0 };
  });
  je.setUserStatus = ht({ region: Ze }, async (e) => {
    let t = _.requireRole(e, ["super", "support"]), n = e.data || {}, a = _.str(n.uid, { max: 128 }), r = n.banned === !0, s = typeof n.reason == "string" ? n.reason.trim().slice(0, 200) : "";
    if ((await Ne.auth().getUser(a)).customClaims?.admin) throw new jn("permission-denied", "Staff accounts cannot be banned here.");
    return await pe.doc(`users/${a}`).update({ status: r ? "banned" : "active", banReason: r ? s : "" }), await Ne.auth().updateUser(a, { disabled: r }), r && await Ne.auth().revokeRefreshTokens(a), _.audit(null, t, r ? "user_banned" : "user_unbanned", { uid: a, reason: s }), { ok: !0 };
  });
  je.setStaffRole = ht({ region: Ze }, async (e) => {
    let t = _.requireRole(e, ["super"]), n = e.data || {}, a = await Ne.auth().getUserByEmail(_.str(n.email, { max: 200, label: "Email" })), r = n.role === null ? null : _.str(n.role, { max: 20 });
    if (r && !_.STAFF_ROLES.includes(r)) throw _.bad("Invalid role.");
    if (a.uid === t && r !== "super") throw _.bad("You cannot demote yourself.");
    return await Ne.auth().setCustomUserClaims(a.uid, r ? { admin: !0, role: r } : { admin: !1, role: null }), await Ne.auth().revokeRefreshTokens(a.uid), await pe.doc(`users/${a.uid}`).set({ role: r || "user" }, { merge: !0 }), _.audit(null, t, "staff_role", { uid: a.uid, role: r }), { ok: !0 };
  });
  je.adminNotify = ht({ region: Ze, timeoutSeconds: 300 }, async (e) => {
    let t = _.requireRole(e, ["super", "support"]), n = e.data || {}, a = _.str(n.title, { max: 80, label: "Title" }), r = _.str(n.body, { max: 400, label: "Message" }), s = (i) => ({ ref: pe.collection("users").doc(i).collection("notifications").doc(), data: { title: a, body: r, type: "announcement", read: !1, createdAt: qr.serverTimestamp() } }), o = 0;
    if (n.uid) {
      let i = s(String(n.uid));
      await i.ref.set(i.data), o = 1;
    } else {
      let i = null;
      for (; ; ) {
        let d = pe.collection("users").where("status", "==", "active").orderBy("__name__").limit(400);
        i && (d = d.startAfter(i));
        let c = await d.get();
        if (c.empty) break;
        let u = pe.batch();
        c.docs.forEach((l) => {
          let m = s(l.id);
          u.set(m.ref, m.data);
        }), await u.commit(), o += c.size, i = c.docs[c.docs.length - 1];
      }
    }
    return _.audit(null, t, "notify", { title: a, recipients: o }), { ok: !0, recipients: o };
  });
  je.pushOnNotification = Gr({ document: "users/{uid}/notifications/{nid}", region: Ze }, async (e) => {
    let t = e.data?.data();
    if (!t) return;
    let a = (await pe.collection("users").doc(e.params.uid).collection("devices").get()).docs.map((o) => o.id);
    if (!a.length) return;
    let r = await Ne.messaging().sendEachForMulticast({ tokens: a, notification: { title: t.title, body: t.body } }), s = [];
    r.responses.forEach((o, i) => {
      !o.success && /registration-token-not-registered|invalid-registration-token/.test(o.error?.code || "") && s.push(a[i]);
    }), await Promise.all(s.map((o) => pe.doc(`users/${e.params.uid}/devices/${o}`).delete()));
  });
});

// src/math.js
var Wn = O((co, Vn) => {
  "use strict";
  var Fn = me("crypto"), xt = {
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
  }, jr = 0.99, Ft = () => Fn.randomInt(0, 2 ** 32) / 2 ** 32;
  function Ht(e) {
    let t = [], n = 1;
    for (let a = 0; a <= e; a++)
      t.push(n / 2 ** e), n = n * (e - a) / (a + 1);
    return t;
  }
  var xr = { low: { base: 1, spread: 4, e: 2 }, medium: { base: 0.4, spread: 30, e: 3 }, high: { base: 0.15, spread: 300, e: 4.5 } };
  function Hn(e, t, n, a = 1e3) {
    let r = xr[t];
    if (!r) throw new Error("bad risk");
    let s = Ht(e), o = s.map((d, c) => r.base + Math.pow(Math.abs(c - e / 2) / (e / 2), r.e) * r.spread), i = o.reduce((d, c, u) => d + c * s[u], 0);
    return o.map((d) => Math.min(a, Math.round(d * n / i * 100) / 100));
  }
  function Fr(e, t, n, a) {
    let r = Hn(e, t, n, a), s = Ht(e);
    return r.reduce((o, i, d) => o + i * s[d], 0);
  }
  function Hr(e) {
    let t = [];
    for (let n = 0; n < e; n++) t.push(Fn.randomInt(0, 2));
    return { path: t, slot: t.reduce((n, a) => n + a, 0) };
  }
  function Vr(e) {
    let t = e.reduce((n, a) => n + a.weight, 0);
    return e.reduce((n, a) => n + a.mult * a.weight, 0) / t;
  }
  function Wr(e) {
    let t = e.reduce((a, r) => a + r.weight, 0), n = Ft() * t;
    for (let a = 0; a < e.length; a++)
      if (n -= e[a].weight, n < 0) return a;
    return e.length - 1;
  }
  function Kr(e, t = 1e3) {
    let n = Ft();
    return Math.min(t, Math.max(1, Math.floor(100 * e / (1 - n)) / 100));
  }
  var Yr = (e, t) => Math.floor(Math.exp(t * e) * 100) / 100, zr = (e, t) => Math.log(e) / t;
  function Jr(e = {}) {
    let t = { ...xt, ...e };
    for (let n of ["plinko", "wheel", "rocket"]) t[n] = { ...xt[n], ...e[n] || {} };
    return t;
  }
  Vn.exports = {
    DEFAULTS: xt,
    MAX_RTP: jr,
    binomProbs: Ht,
    plinkoTable: Hn,
    plinkoRtp: Fr,
    plinkoDrop: Hr,
    wheelRtp: Vr,
    wheelSpin: Wr,
    rocketCrashPoint: Kr,
    rocketMultiplierAt: Yr,
    rocketCrashTimeMs: zr,
    mergeConfig: Jr,
    randFloat: Ft
  };
});

// src/games.js
var Yn = O(($e) => {
  "use strict";
  var { onCall: xe } = ne(), P = ae(), re = Wn(), { db: G, FieldValue: Vt, HttpsError: gt, REGION: Fe } = P;
  async function wt() {
    let e = await G.doc("settings/games").get();
    return re.mergeConfig(e.exists ? e.data() : {});
  }
  function Wt(e, t, n) {
    let a = e[t];
    if (!a.enabled) throw new gt("failed-precondition", "This game is currently disabled.");
    if (e.rtp > re.MAX_RTP) throw new gt("failed-precondition", "Game configuration is invalid.");
    if (n < a.minBet || n > a.maxBet) throw P.bad(`Bet must be between ${a.minBet} and ${a.maxBet}.`);
  }
  function Kt(e, t, n, a, r, s, o) {
    let i = P.planDebit(n.balances, r, ["main", "winning"]), d = {};
    for (let [c, u] of Object.entries(i)) d[c] = -u;
    P.applyDelta(e, t, d), P.ledger(e, { uid: a, type: "bet", direction: "out", amount: r, bucket: Object.keys(i)[0], note: s, ref: o }), P.bumpStats(e, { betVolume: r });
  }
  function Yt(e, t, n, a, r, s) {
    a <= 0 || (P.applyDelta(e, t, { winning: a }), P.ledger(e, { uid: n, type: "win", direction: "in", amount: a, bucket: "winning", note: r, ref: s }), P.bumpStats(e, { winPayout: a }));
  }
  $e.getGameConfig = xe({ region: Fe }, async (e) => {
    P.authUid(e);
    let t = await wt(), n = {};
    for (let a of t.plinko.rows) {
      n[a] = {};
      for (let r of ["low", "medium", "high"]) n[a][r] = re.plinkoTable(a, r, t.rtp, t.plinko.maxMultiplier);
    }
    return { rtp: t.rtp, plinko: { ...t.plinko, tables: n }, wheel: t.wheel, rocket: t.rocket };
  });
  $e.playPlinko = xe({ region: Fe }, async (e) => {
    let t = P.requireVerified(e), n = e.data || {}, a = await wt(), r = P.amountOf(n.bet, { label: "Bet" });
    Wt(a, "plinko", r);
    let s = Number(n.rows), o = String(n.risk);
    if (!a.plinko.rows.includes(s) || !["low", "medium", "high"].includes(o)) throw P.bad("Invalid Plinko settings.");
    let i = re.plinkoTable(s, o, a.rtp, a.plinko.maxMultiplier), d = re.plinkoDrop(s), c = i[d.slot], u = P.round2(r * c), l = G.collection("gameHistory").doc();
    return await G.runTransaction(async (m) => {
      let p = G.doc(`users/${t}`), f = await m.get(p);
      P.assertActive(f.data()), Kt(m, p, f.data(), t, r, "plinko", l.id), Yt(m, p, t, u, "plinko", l.id), m.set(l, { uid: t, game: "plinko", bet: r, payout: u, multiplier: c, status: "settled", detail: { rows: s, risk: o, path: d.path, slot: d.slot }, at: Vt.serverTimestamp() });
    }), { path: d.path, slot: d.slot, multiplier: c, payout: u, historyId: l.id };
  });
  $e.playWheel = xe({ region: Fe }, async (e) => {
    let t = P.requireVerified(e), n = e.data || {}, a = await wt(), r = P.amountOf(n.bet, { label: "Bet" });
    Wt(a, "wheel", r);
    let s = a.wheel.segments;
    if (!Array.isArray(s) || s.length < 2 || re.wheelRtp(s) > re.MAX_RTP) throw new gt("failed-precondition", "Wheel configuration is invalid.");
    let o = re.wheelSpin(s), i = s[o].mult, d = P.round2(r * i), c = G.collection("gameHistory").doc();
    return await G.runTransaction(async (u) => {
      let l = G.doc(`users/${t}`), m = await u.get(l);
      P.assertActive(m.data()), Kt(u, l, m.data(), t, r, "wheel", c.id), Yt(u, l, t, d, "wheel", c.id), u.set(c, { uid: t, game: "wheel", bet: r, payout: d, multiplier: i, status: "settled", detail: { segment: o, label: s[o].label }, at: Vt.serverTimestamp() });
    }), { segment: o, label: s[o].label, multiplier: i, payout: d, historyId: c.id };
  });
  $e.rocketStart = xe({ region: Fe }, async (e) => {
    let t = P.requireVerified(e), n = e.data || {}, a = await wt(), r = P.amountOf(n.bet, { label: "Bet" });
    Wt(a, "rocket", r);
    let s = re.rocketCrashPoint(a.rtp, a.rocket.maxMultiplier), o = G.collection("rocketRounds").doc().id, i = Date.now();
    return await G.runTransaction(async (d) => {
      let c = G.doc(`users/${t}`), u = await d.get(c);
      P.assertActive(u.data()), Kt(d, c, u.data(), t, r, "rocket", o), d.set(G.doc(`rocketRounds/${o}`), { uid: t, bet: r, startedAt: i, status: "running", growth: a.rocket.growth }), d.set(G.doc(`rocketSecrets/${o}`), { crash: s }), d.set(G.doc(`gameHistory/${o}`), { uid: t, game: "rocket", bet: r, payout: 0, multiplier: 0, status: "running", detail: {}, at: Vt.serverTimestamp() });
    }), { roundId: o, startedAt: i, growth: a.rocket.growth };
  });
  async function Kn(e, t, n) {
    return G.runTransaction(async (a) => {
      let r = G.doc(`rocketRounds/${t}`), [s, o] = await Promise.all([a.get(r), a.get(G.doc(`rocketSecrets/${t}`))]);
      if (!s.exists || s.data().uid !== e) throw new gt("not-found", "Round not found.");
      let i = s.data(), d = o.data().crash;
      if (i.status !== "running") return { status: i.status, crash: i.status === "running" ? void 0 : d, multiplier: i.cashedAt || null, payout: i.payout || 0 };
      let c = Date.now() - i.startedAt, u = re.rocketCrashTimeMs(d, i.growth), l = G.doc(`gameHistory/${t}`);
      if (c >= u)
        return a.update(r, { status: "crashed", payout: 0 }), a.update(l, { status: "settled", detail: { crash: d } }), { status: "crashed", crash: d, payout: 0 };
      let m = re.rocketMultiplierAt(c, i.growth);
      if (!n) return { status: "running", multiplier: m };
      let p = P.round2(i.bet * m);
      return Yt(a, G.doc(`users/${e}`), e, p, "rocket", t), a.update(r, { status: "cashed", payout: p, cashedAt: m }), a.update(l, { status: "settled", payout: p, multiplier: m, detail: { crash: d } }), { status: "cashed", multiplier: m, payout: p, crash: d };
    });
  }
  $e.rocketPoll = xe({ region: Fe }, (e) => Kn(P.authUid(e), P.str((e.data || {}).roundId, { max: 80 }), !1));
  $e.rocketCashout = xe({ region: Fe }, (e) => Kn(P.requireVerified(e), P.str((e.data || {}).roundId, { max: 80 }), !0));
});

// src/engagement.js
var zn = O((et) => {
  "use strict";
  var Xr = me("crypto"), { onCall: yt } = ne(), v = ae(), { db: q, FieldValue: Qe, HttpsError: se, REGION: bt } = v;
  et.buyLotteryTickets = yt({ region: bt }, async (e) => {
    let t = v.requireVerified(e), n = e.data || {}, a = v.str(n.lotteryId, { max: 80 }), r = Math.floor(v.amountOf(n.qty, { min: 1, max: 50, label: "Quantity" })), s = [];
    return await q.runTransaction(async (o) => {
      let i = q.doc(`lotteries/${a}`), d = q.doc(`users/${t}`), [c, u] = await Promise.all([o.get(i), o.get(d)]);
      v.assertActive(u.data());
      let l = c.data();
      if (!c.exists || l.status !== "open") throw new se("failed-precondition", "This lottery is closed.");
      if (l.endsAt && l.endsAt.toMillis() <= Date.now()) throw new se("failed-precondition", "This lottery has ended.");
      if ((l.sold || 0) + r > l.totalTickets) throw new se("failed-precondition", "Not enough tickets left.");
      let m = u.data().rg?.excludedUntil;
      if ((m?.toMillis ? m.toMillis() : Number(m) || 0) > Date.now()) throw new se("failed-precondition", "You are on a self-exclusion break.");
      if (Number(l.maxPerUser) > 0 && (await o.get(q.collection("lotteryTickets").where("lotteryId", "==", a).where("uid", "==", t).count())).data().count + r > Number(l.maxPerUser))
        throw new se("failed-precondition", `Maximum ${l.maxPerUser} tickets per player.`);
      let p = v.round2(l.price * r), f = v.planDebit(u.data().balances, p, ["main", "winning"]), w = {};
      for (let [T, g] of Object.entries(f)) w[T] = -g;
      v.applyDelta(o, d, w), v.ledger(o, { uid: t, type: "lottery", direction: "out", amount: p, bucket: Object.keys(f)[0], note: l.title, ref: a });
      for (let T = 1; T <= r; T++) {
        let g = (l.sold || 0) + T;
        s.push(g), o.set(q.collection("lotteryTickets").doc(), { lotteryId: a, lotteryTitle: l.title, uid: t, number: g, price: l.price, status: "active", createdAt: Qe.serverTimestamp() });
      }
      o.update(i, { sold: Qe.increment(r) }), v.bumpStats(o, { lotterySales: p });
    }), { ok: !0, numbers: s };
  });
  et.adminDrawLottery = yt({ region: bt, timeoutSeconds: 120 }, async (e) => {
    let t = v.requireRole(e, ["super", "finance"]), n = v.str((e.data || {}).lotteryId, { max: 80 });
    return { ok: !0, winnerTicket: (await q.runTransaction(async (r) => {
      let s = q.doc(`lotteries/${n}`), o = await r.get(s), i = o.data();
      if (!o.exists || !["open", "closed"].includes(i.status)) throw new se("failed-precondition", "Lottery cannot be drawn.");
      let d = await r.get(q.collection("lotteryTickets").where("lotteryId", "==", n).where("status", "==", "active"));
      if (d.empty) throw new se("failed-precondition", "No tickets sold.");
      let c = d.docs[Xr.randomInt(0, d.size)], u = c.data(), l = v.round2(i.prize), m = q.doc(`users/${u.uid}`), p = await r.get(m);
      return v.applyDelta(r, m, { winning: l }), v.ledger(r, { uid: u.uid, type: "lottery_win", direction: "in", amount: l, bucket: "winning", note: i.title, ref: n }), v.notify(r, u.uid, "You won the lottery! \u{1F389}", `${i.title}: ${l} added to your winnings.`, "lottery"), r.update(c.ref, { status: "won" }), r.update(s, { status: "drawn", winnerUid: u.uid, winnerName: p.data().username || "", winnerTicket: u.number, drawnAt: Qe.serverTimestamp() }), v.bumpStats(r, { lotteryPayout: l }), v.audit(r, t, "lottery_drawn", { lotteryId: n, winner: u.uid, prize: l }), { winnerTicket: u.number, winnerUid: u.uid };
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
      for (let [o, i] of Object.entries(s))
        await q.runTransaction(async (d) => {
          let u = (await d.getAll(...i.map((m) => m.ref))).filter((m) => m.data().status === "active");
          if (!u.length) return;
          let l = v.round2(u.reduce((m, p) => m + p.data().price, 0));
          v.applyDelta(d, q.doc(`users/${o}`), { main: l }), v.ledger(d, { uid: o, type: "lottery_refund", direction: "in", amount: l, bucket: "main", note: "Lottery cancelled", ref: n }), v.notify(d, o, "Lottery cancelled", `${l} was refunded to your wallet.`, "lottery"), u.forEach((m) => d.update(m.ref, { status: "refunded" })), a += u.length;
        });
    }
    return v.audit(null, t, "lottery_cancelled", { lotteryId: n, refundedTickets: a }), { ok: !0, refundedTickets: a };
  });
  et.claimBonus = yt({ region: bt }, async (e) => {
    let t = v.requireVerified(e), n = v.str((e.data || {}).bonusId, { max: 80 }), a = { once: 1 / 0, daily: 24 * 36e5, weekly: 168 * 36e5 }, r = 0;
    return await q.runTransaction(async (s) => {
      let [o, i, d] = await Promise.all([s.get(q.doc(`bonuses/${n}`)), s.get(q.doc(`users/${t}`)), s.get(q.doc(`bonusClaims/${t}_${n}`))]);
      v.assertActive(i.data());
      let c = o.data();
      if (!o.exists || !c.enabled) throw new se("failed-precondition", "This bonus is not available.");
      let u = c.type in a ? c.type : "once";
      if (d.exists) {
        if (u === "once") throw new se("already-exists", "You already claimed this bonus.");
        let l = d.data().lastClaimAt.toMillis() + a[u] - Date.now();
        if (l > 0) throw new se("failed-precondition", `Available again in ${Math.ceil(l / 6e4)} min.`);
      }
      r = v.round2(c.amount), v.applyDelta(s, i.ref, { main: r }), v.ledger(s, { uid: t, type: "bonus", direction: "in", amount: r, bucket: "main", note: c.title, ref: n }), s.set(d.ref, { uid: t, bonusId: n, lastClaimAt: Qe.serverTimestamp(), count: Qe.increment(1) }, { merge: !0 }), v.bumpStats(s, { bonusPaid: r });
    }), { ok: !0, amount: r };
  });
});

// supa/shims/functions-scheduler.js
var Xn = O((mo, Jn) => {
  "use strict";
  Jn.exports = { onSchedule: (e, t) => {
    let n = typeof e == "function" ? e : t;
    return n.__kind = "schedule", n;
  } };
});

// supa/shims/firebase-admin-firestore.js
var Qn = O((fo, Zn) => {
  "use strict";
  var { AggregateField: Zr, FieldValue: Qr } = Ye();
  Zn.exports = { AggregateField: Zr, FieldValue: Qr };
});

// src/ag/errors.js
var He = O((po, ta) => {
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
  }, ea = (e) => Tt[e] || { msg: "Unknown error", en: "Something went wrong. Please try again.", bn: "\u0995\u09BF\u099B\u09C1 \u098F\u0995\u099F\u09BE \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" }, es = (e) => !!(Tt[e] && Tt[e].retry), zt = class extends Error {
    constructor(t, n = "") {
      super(`${t} ${ea(t).msg}${n ? ` \u2014 ${n}` : ""}`), this.code = t, this.detail = n;
    }
  };
  ta.exports = { CODES: Tt, info: ea, isRetryable: es, AgError: zt };
});

// src/ag/config.js
var St = O((ho, ra) => {
  "use strict";
  var { db: na } = ae(), { AgError: ts } = He(), ns = 30 * 1e3, At = null, Jt = 0, aa = {
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
    if (!e && At && Date.now() - Jt < ns) return At;
    let [n, a] = await Promise.all([na.doc("adminConfig/gameApi").get(), na.doc("adminPrivate/gameApi").get()]), r = { ...aa, ...n.exists ? n.data() : {}, secretKey: a.exists ? String(a.data().secretKey || "") : "" };
    if (r.terminalType = r.terminalType === "PC" ? "PC" : "PHONE", At = r, Jt = Date.now(), t && (!r.baseUrl || !r.merchantCode || !r.secretKey)) throw new ts("C20001", "Game API is not configured (base URL, merchant code, secret key).");
    return r;
  }
  function rs() {
    At = null, Jt = 0;
  }
  ra.exports = { loadConfig: as, clearConfigCache: rs, DEFAULTS: aa };
});

// src/ag/sign.js
var Qt = O((go, ca) => {
  "use strict";
  var Xt = me("crypto"), vt = "HmacSHA256", ss = {
    merchant: "x-merchant-code",
    timestamp: "x-timestamp",
    nonce: "x-nonce",
    sign: "x-sign",
    signType: "x-content-processing-type"
  };
  function sa(e, t, n, a, r) {
    let s = r == null ? "" : Buffer.isBuffer(r) ? r.toString("utf8") : String(r);
    return String(e) + String(t) + String(n) + String(a) + s;
  }
  function Zt(e, t, n, a, r, s = vt) {
    if (!e) throw new Error("Secret key missing");
    return Xt.createHmac("sha256", Buffer.from(String(e), "utf8")).update(Buffer.from(sa(t, n, a, s, r), "utf8")).digest("hex");
  }
  function oa(e, t) {
    let n = String(e || "").toLowerCase(), a = String(t || "").toLowerCase();
    return !/^[0-9a-f]+$/.test(n) || n.length !== a.length ? !1 : Xt.timingSafeEqual(Buffer.from(n, "utf8"), Buffer.from(a, "utf8"));
  }
  function os(e, t, n, a, r, s, o = vt) {
    return oa(Zt(e, t, n, a, r, o), s);
  }
  var ia = () => Xt.randomBytes(16).toString("hex");
  function is(e, t, n) {
    let a = Date.now().toString(), r = ia();
    return {
      "X-MERCHANT-CODE": t,
      "X-TIMESTAMP": a,
      "X-NONCE": r,
      "X-SIGN": Zt(e, t, a, r, n),
      "X-CONTENT-PROCESSING-TYPE": vt
    };
  }
  function cs(e, t) {
    if (!e) return "";
    if (typeof e.get == "function") return e.get(t) || "";
    let n = e[t] ?? e[t.toLowerCase()] ?? e[t.toUpperCase()];
    return Array.isArray(n) ? String(n[0]) : n == null ? "" : String(n);
  }
  ca.exports = { SIGN_TYPE: vt, HEADERS: ss, rawString: sa, sign: Zt, verify: os, safeEqualHex: oa, newNonce: ia, signedHeaders: is, header: cs };
});

// src/ag/client.js
var tn = O((wo, fa) => {
  "use strict";
  var ds = me("crypto"), Se = Qt(), da = He(), { db: ls, FieldValue: us } = ae(), en = 12e3, ms = [400, 1200, 2500], fs = 30, la = () => "TRACE_" + ds.randomBytes(10).toString("hex").toUpperCase(), oe = class extends Error {
    /** kind: timeout | network | http | badjson | badsign | provider */
    constructor(t, n, a = {}) {
      super(n), this.kind = t, Object.assign(this, a);
    }
  }, ua = (e) => e instanceof oe && ["timeout", "network"].includes(e.kind) || e instanceof oe && e.kind === "http" && e.status >= 500 || e instanceof oe && e.kind === "provider" && da.isRetryable(e.code), ps = (e) => new Promise((t) => setTimeout(t, e)), ma = (e) => e && e.success !== !1 && (e.code === "C10000" || e.code == null && e.success === !0);
  async function hs(e, t, n, a) {
    let r = { "Content-Type": "application/json", ...Se.signedHeaders(e.secretKey, e.merchantCode, n) }, s = new AbortController(), o = setTimeout(() => s.abort(), en), i, d;
    try {
      i = await a(e.baseUrl.replace(/\/+$/, "") + t, { method: "POST", headers: r, body: n, signal: s.signal }), d = await i.text();
    } catch (m) {
      throw new oe(
        m.name === "AbortError" ? "timeout" : "network",
        m.name === "AbortError" ? `Provider timed out after ${en / 1e3}s` : `Could not reach provider: ${m.cause?.code || m.message}`
      );
    } finally {
      clearTimeout(o);
    }
    if (!i.ok) throw new oe("http", `Provider returned HTTP ${i.status}`, { status: i.status, body: String(d).slice(0, 300) });
    let c = Se.header(i.headers, "X-SIGN"), u = e.verifyResponseSign || "auto";
    if (u !== "off" && (c || u === "strict") && !(c && Se.verify(
      e.secretKey,
      Se.header(i.headers, "X-MERCHANT-CODE") || e.merchantCode,
      Se.header(i.headers, "X-TIMESTAMP"),
      Se.header(i.headers, "X-NONCE"),
      d,
      c,
      Se.header(i.headers, "X-CONTENT-PROCESSING-TYPE") || Se.SIGN_TYPE
    )))
      throw new oe("badsign", "Provider response signature is invalid");
    let l;
    try {
      l = JSON.parse(d);
    } catch {
      throw new oe("badjson", "Provider returned a non-JSON response", { body: String(d).slice(0, 300) });
    }
    if (!ma(l)) throw new oe("provider", `${l.code || "ERROR"}: ${l.msg || da.info(l.code).msg}`, { code: l.code || "C10001", providerMsg: l.msg });
    return l;
  }
  async function gs(e, t, n = {}, a = {}) {
    let r = a.fetchImpl || fetch, s = a.retries ?? 2, o = { reqTraceId: la(), ...n }, i = JSON.stringify(o), d = Date.now(), c = 0, u = null, l = null;
    for (; c <= s; c++)
      try {
        l = await hs(e, t, i, r), u = null;
        break;
      } catch (m) {
        if (u = m, !ua(m) || c === s) break;
        await ps(ms[c] || 2500);
      }
    if (a.log !== !1) {
      let m = {
        endpoint: t,
        reqTraceId: o.reqTraceId,
        attempts: Math.min(c + 1, s + 1),
        ok: !u,
        code: u ? u.code || u.kind : l.code,
        message: u ? u.message : "",
        latencyMs: Date.now() - d,
        request: i.slice(0, 2e3),
        at: us.serverTimestamp(),
        expireAt: new Date(Date.now() + fs * 864e5)
      };
      ls.collection("agApiLogs").add(m).catch(() => {
      });
    }
    if (u) throw u;
    return l;
  }
  fa.exports = { call: gs, trace: la, ClientError: oe, isSuccess: ma, transient: ua, TIMEOUT_MS: en };
});

// src/ag/engine.js
var Ia = O((yo, ka) => {
  "use strict";
  var tt = me("crypto"), { AgError: I } = He(), D = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, nt = (e) => D(Math.max(0, e)).toFixed(2), ws = /^[A-Za-z0-9_\-.]{1,128}$/, ga = 10;
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
  function pa(e, t, n) {
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
  function ha(e, t) {
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
  function Ee(e) {
    let t = String(e);
    return /^[A-Za-z0-9_\-.:]{1,200}$/.test(t) && !/^\.+$/.test(t) && !t.startsWith("__") ? t : "h_" + tt.createHash("sha256").update(t).digest("hex");
  }
  function wa(e) {
    let t = Object.keys(e || {}).filter((n) => n !== "reqTraceId").sort();
    return tt.createHash("sha256").update(JSON.stringify(t.map((n) => [n, e[n]]))).digest("hex");
  }
  var ve = (e) => D((Number(e?.main) || 0) + (Number(e?.winning) || 0));
  function nn(e, t) {
    if (ve(e) + 1e-9 < t) return null;
    let n = D(t), a = {};
    for (let r of ["main", "winning"]) {
      let s = D(Math.min(Math.max(Number(e?.[r]) || 0, 0), n));
      s > 0 && (a[r] = s, n = D(n - s));
    }
    return n > 0 ? null : a;
  }
  function an(e, t, n) {
    let { db: a, FieldValue: r } = e, s = {}, o = {}, i = r.serverTimestamp();
    return {
      delta(d, c) {
        s[d] = D((s[d] || 0) + c);
      },
      stat(d, c) {
        o[d] = D((o[d] || 0) + c);
      },
      ledger(d, c, u, l, m, p, f) {
        l > 0 && t.set(a.collection("transactions").doc(), { uid: d, type: c, direction: u, amount: D(l), bucket: m, note: p, ref: f, createdAt: i });
      },
      flush() {
        let d = {};
        for (let [u, l] of Object.entries(s)) l !== 0 && (d[`balances.${u}`] = r.increment(l));
        Object.keys(d).length && t.update(n, d);
        let c = {};
        for (let [u, l] of Object.entries(o)) l !== 0 && (c[u] = r.increment(l));
        Object.keys(c).length && t.set(a.doc(`statsShards/ag_${tt.randomInt(0, ga)}`), c, { merge: !0 });
      },
      after(d) {
        let c = { ...d || {} };
        for (let [u, l] of Object.entries(s)) c[u] = D((Number(c[u]) || 0) + l);
        return c;
      }
    };
  }
  function ya(e) {
    return "MB" + tt.createHash("sha1").update(String(e) + tt.randomBytes(4).toString("hex")).digest("hex").slice(0, 18).toUpperCase();
  }
  function ba(e, t, n) {
    if (e.status !== "active") throw new I("G30001", `account is ${e.status}`);
    let a = e.rg?.excludedUntil;
    if ((a?.toMillis ? a.toMillis() : Number(a) || 0) > n) throw new I("G30001", "player is self-excluded");
    if (t && t.status === "forced") throw new I("G30001", "session was force-logged-out");
  }
  async function rn(e, t, n, a, r) {
    let { db: s, FieldValue: o } = e, i = wa(n);
    return s.runTransaction(async (d) => {
      let c = s.doc(`agTransactions/${t}`), u = await d.get(c);
      if (u.exists) {
        let p = u.data();
        if (p.requestHash !== i) throw new I("G300016", `transactionId already used with a different payload (${t})`);
        return { data: p.response, replay: !0 };
      }
      let { data: l, record: m } = await r(d);
      return d.set(c, { ...a, ...m, requestHash: i, response: l, createdAt: o.serverTimestamp(), at: e.now }), { data: l, replay: !1 };
    });
  }
  async function Ta(e, t) {
    let n = at(t);
    rt(t, e.cfg);
    let a = await e.db.doc(`users/${n}`).get();
    if (!a.exists) throw new I("G20006", n);
    return { balance: nt(ve(a.data().balances)) };
  }
  async function Aa(e, t) {
    let n = at(t);
    rt(t, e.cfg);
    let a = await e.db.doc(`users/${n}`).get();
    if (!a.exists) throw new I("G20006", n);
    let r = a.data(), s = String(e.cfg.siteUrl || "").replace(/\/+$/, ""), o = /^https:\/\//.test(r.photoURL || "") ? r.photoURL : e.cfg.defaultAvatarUrl || (s ? `${s}/icons/icon-192.png` : "");
    return { nickName: String(r.username || r.name || "Player").slice(0, 32), avatarUrl: o };
  }
  async function Sa(e, t) {
    let n = at(t), a = rt(t, e.cfg), r = F(t, "gameCode"), s = F(t, "roundId"), o = F(t, "betId"), i = F(t, "transactionId"), d = Ct(t, "betAmount"), c = F(t, "timestamp", 40), { db: u } = e;
    return rn(e, `bet_${Ee(i)}`, t, { kind: "bet", transactionId: i, betId: o, roundId: s, gameCode: r, playerId: n, uid: n, currencyCode: a, betAmount: d, providerTime: c }, async (l) => {
      let m = u.doc(`users/${n}`), p = u.doc(`agBets/${Ee(o)}`), f = u.doc(`agSessions/${n}`), [w, T, g] = await Promise.all([l.get(m), l.get(p), l.get(f)]);
      if (!w.exists) throw new I("G20006", n);
      let $ = w.data();
      ba($, g.exists ? g.data() : null, e.now);
      let A = T.exists ? T.data() : null;
      if (A && A.status === "cancelled") throw new I("C10002", `bet ${o} was already cancelled`);
      if (A && A.uid !== n) throw new I("C10002", `bet ${o} belongs to another player`);
      let k = nn($.balances, d);
      if (!k) throw new I("G30003", `needs ${d}, has ${ve($.balances)}`);
      let E = an(e, l, m);
      for (let [C, L] of Object.entries(k)) E.delta(C, -L);
      E.ledger(n, "game_bet", "out", d, Object.keys(k)[0] || "main", r, o), E.stat("agBetVolume", d), E.stat("agBetCount", 1);
      let M = A?.merchantBetId || ya(o), B = A?.debitPlan || {};
      l.set(p, {
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
  async function va(e, t) {
    let n = at(t), a = rt(t, e.cfg), r = F(t, "gameCode"), s = F(t, "roundId"), o = F(t, "betId"), i = F(t, "transactionId"), d = Ct(t, "betAmount"), c = Ct(t, "winAmount"), u = pa(t, "isFree", !1), l = pa(t, "isEnd"), m = ha(t, "betTime"), p = ha(t, "settledTime"), f = F(t, "type", 16);
    if (!["win", "bet_win"].includes(f)) throw new I("C10002", "type must be win or bet_win");
    let { db: w } = e;
    return rn(e, `win_${Ee(i)}`, t, { kind: "win", type: f, transactionId: i, betId: o, roundId: s, gameCode: r, playerId: n, uid: n, currencyCode: a, betAmount: d, winAmount: c, isFree: u, isEnd: l, betTime: m, settledTime: p }, async (T) => {
      let g = w.doc(`users/${n}`), $ = w.doc(`agBets/${Ee(o)}`), A = w.doc(`agSessions/${n}`), [k, E, M] = await Promise.all([T.get(g), T.get($), T.get(A)]);
      if (!k.exists) throw new I("G20006", n);
      let B = k.data(), y = E.exists ? E.data() : null;
      if (y && y.uid !== n) throw new I("C10002", `bet ${o} belongs to another player`);
      if (y && y.status === "cancelled") throw new I("C10002", `bet ${o} was cancelled`);
      let C = an(e, T, g), L = {}, ee = f === "bet_win" && !u && d > 0;
      if (ee) {
        if (ba(B, M.exists ? M.data() : null, e.now), L = nn(B.balances, d), !L) throw new I("G30003", `needs ${d}, has ${ve(B.balances)}`);
        for (let [De, Ue] of Object.entries(L)) C.delta(De, -Ue);
        C.ledger(n, "game_bet", "out", d, Object.keys(L)[0] || "main", r, o), C.stat("agBetVolume", d), C.stat("agBetCount", 1);
      }
      c > 0 && (C.delta("winning", c), C.ledger(n, "game_win", "in", c, "winning", r + (u ? " (free spin)" : ""), o), C.stat("agWinPayout", c)), !y && f === "win" && C.stat("agOrphanWins", 1);
      let ue = y?.merchantBetId || ya(o), J = y?.debitPlan || {};
      T.set($, {
        betId: o,
        merchantBetId: ue,
        uid: n,
        playerId: n,
        gameCode: r,
        roundId: s,
        currencyCode: a,
        betAmount: D((y?.betAmount || 0) + (ee ? d : 0)),
        declaredBetAmount: d,
        debitPlan: { main: D((J.main || 0) + (L.main || 0)), winning: D((J.winning || 0) + (L.winning || 0)) },
        winAmount: D((y?.winAmount || 0) + c),
        winReversed: y?.winReversed || 0,
        betRefunded: y?.betRefunded || !1,
        isFree: u,
        isEnd: l,
        status: l ? "settled" : y?.status || "placed",
        betTime: m,
        settledTime: l ? p : y?.settledTime || null,
        createdAt: y?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: y?.at || e.now
      }, { merge: !0 }), C.flush();
      let Y = { merchantBetId: ue, balance: nt(ve(C.after(B.balances))) };
      return { data: Y, record: { merchantBetId: ue, balanceAfter: Y.balance, debitPlan: L } };
    });
  }
  async function Ca(e, t) {
    let n = at(t), a = rt(t, e.cfg), r = F(t, "gameCode"), s = F(t, "betId"), o = F(t, "merchantBetId"), i = Ct(t, "betAmount"), d = F(t, "cancelType", 8).toUpperCase(), c = F(t, "transactionId");
    if (!["BET", "WIN"].includes(d)) throw new I("C10002", "cancelType must be BET or WIN");
    let { db: u } = e;
    return rn(e, `cancel_${Ee(c)}`, t, { kind: "cancel", cancelType: d, transactionId: c, betId: s, gameCode: r, playerId: n, uid: n, currencyCode: a, betAmount: i, merchantBetId: o }, async (l) => {
      let m = u.doc(`users/${n}`), p = u.doc(`agBets/${Ee(s)}`), [f, w] = await Promise.all([l.get(m), l.get(p)]);
      if (!f.exists) throw new I("G20006", n);
      let T = f.data(), g = an(e, l, m), $ = w.exists ? w.data() : null;
      if ($ && $.uid !== n) throw new I("C10002", `bet ${s} belongs to another player`);
      let A = 0, k = 0, E = "", M = e.FieldValue.serverTimestamp();
      if (!$)
        l.set(p, {
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
          A = D((C.main || 0) + (C.winning || 0)), g.ledger(n, "game_refund", "in", A, "main", `${r} bet cancelled`, s), g.stat("agBetVolume", -A), g.stat("agCancelCount", 1), Math.abs(A - i) > 1e-3 && (E = `refunded the ${A} actually debited (request said ${i})`);
        }
        l.set(p, { status: "cancelled", betRefunded: !0, cancelledAt: M, updatedAt: M }, { merge: !0 });
      } else {
        let C = D(($.winAmount || 0) - ($.winReversed || 0));
        if (C > 0) {
          let L = T.balances || {}, ee = D(Math.min(Math.max(Number(L.winning) || 0, 0), C)), ue = D(Math.min(Math.max(Number(L.main) || 0, 0), D(C - ee))), J = D(C - ee - ue);
          ee + J > 0 && g.delta("winning", -(ee + J)), ue > 0 && g.delta("main", -ue), k = C, g.ledger(n, "game_win_reversal", "out", k, "winning", `${r} win cancelled`, s), g.stat("agWinPayout", -k), g.stat("agCancelCount", 1), J > 0 && (E = `player balance short by ${J}; recorded as negative winning balance`, g.stat("agDebt", J));
        } else E = "nothing to reverse";
        l.set(p, { winReversed: D(($.winReversed || 0) + k), winCancelledAt: M, updatedAt: M }, { merge: !0 });
      }
      g.flush();
      let y = { merchantBetId: $?.merchantBetId || o, betId: s, balance: nt(ve(g.after(T.balances))), currencyCode: a };
      return { data: y, record: { refunded: A, reversed: k, note: E, balanceAfter: y.balance } };
    });
  }
  var ys = {
    "/wallet/balance": (e, t) => Ta(e, t),
    "/player/info": (e, t) => Aa(e, t),
    "/wallet/bet": async (e, t) => (await Sa(e, t)).data,
    "/wallet/win": async (e, t) => (await va(e, t)).data,
    "/wallet/cancel": async (e, t) => (await Ca(e, t)).data
  };
  ka.exports = { ROUTES: ys, STAT_SHARDS: ga, balance: Ta, playerInfo: Aa, bet: Sa, win: va, cancel: Ca, planDebit: nn, safeId: Ee, requestHash: wa, playable: ve, round2: D, money: nt };
});

// src/ag/callbacks.js
var Ea = O((bo, $a) => {
  "use strict";
  var bs = me("crypto"), he = Qt(), V = He(), { ROUTES: _a, requestHash: Ts } = Ia(), As = 24 * 36e5, Ss = 90;
  function kt(e, t = null, n) {
    return { success: e === "C10000", code: e, msg: n || V.info(e).msg, data: e === "C10000" ? t : null };
  }
  function Na(e) {
    let t = String(e || "").split("?")[0].replace(/\/+$/, "");
    return Object.keys(_a).find((n) => t === n || t.endsWith(n)) || null;
  }
  function vs(e, t) {
    let n = he.header(e, "x-forwarded-for");
    return (n ? n.split(",")[0] : t || "").trim();
  }
  async function Cs(e, t) {
    let n = Date.now(), a = Na(t.path), r = Buffer.isBuffer(t.rawBody) ? t.rawBody.toString("utf8") : String(t.rawBody ?? ""), s = null, o, i = "";
    try {
      if (t.method !== "POST") throw new V.AgError("C10003", "POST required");
      if (!a) throw new V.AgError("C10002", `unknown endpoint ${t.path}`);
      let l = t.headers || {}, m = he.header(l, "X-MERCHANT-CODE"), p = he.header(l, "X-TIMESTAMP"), f = he.header(l, "X-NONCE"), w = he.header(l, "X-SIGN"), T = he.header(l, "X-CONTENT-PROCESSING-TYPE");
      if (!m || !p || !f || !w || !T) throw new V.AgError("C10003", "missing signature headers");
      if (f.length > 64 || w.length > 256) throw new V.AgError("C10003", "header too long");
      if (!e.cfg.merchantCode || !e.cfg.secretKey) throw new V.AgError("C20001", "merchant not configured on our side");
      if (m !== e.cfg.merchantCode) throw new V.AgError("C20001", `unknown merchant ${m}`);
      if (T !== he.SIGN_TYPE) throw new V.AgError("C10003", `unsupported signType ${T}`);
      let g = Number(p), $ = (Number(e.cfg.timestampToleranceSec) || 300) * 1e3;
      if (!/^\d{10,16}$/.test(p) || !Number.isFinite(g) || Math.abs(e.now - g) > $) throw new V.AgError("C10003", "timestamp outside allowed window");
      if (!he.verify(e.cfg.secretKey, m, p, f, r, w, T)) throw new V.AgError("C10004");
      let A = Array.isArray(e.cfg.callbackIpWhitelist) ? e.cfg.callbackIpWhitelist.filter(Boolean) : [];
      if (A.length && !A.includes(t.ip)) throw new V.AgError("C10003", `IP ${t.ip} not allowed`);
      try {
        s = JSON.parse(r || "{}");
      } catch {
        throw new V.AgError("C10002", "body is not valid JSON");
      }
      if (!s || typeof s != "object" || Array.isArray(s)) throw new V.AgError("C10002", "body must be a JSON object");
      let k = e.db.doc(`agNonces/${bs.createHash("sha256").update(m + ":" + f).digest("hex")}`), E = Ts(s);
      try {
        await k.create({ route: a, bodyHash: E, at: e.now, expireAt: new Date(e.now + As) });
      } catch (B) {
        if (!(B.code === 6 || /ALREADY_EXISTS/i.test(String(B.message || B)))) throw B;
        let y = await k.get();
        if (!y.exists || y.data().bodyHash !== E) throw new V.AgError("C10003", "nonce already used (replay)");
        i = "identical retry (same nonce + payload)";
      }
      let M = await _a[a](e, s);
      o = kt("C10000", M);
    } catch (l) {
      l instanceof V.AgError ? (o = kt(l.code), i = l.detail || i) : (o = kt("C10001"), i = String(l && l.stack || l).slice(0, 500));
    }
    let d = JSON.stringify(o), c = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
    e.cfg.secretKey && e.cfg.merchantCode && Object.assign(c, he.signedHeaders(e.cfg.secretKey, e.cfg.merchantCode, d));
    let u = {
      route: a || String(t.path || "").slice(0, 100),
      code: o.code,
      ok: o.code === "C10000",
      detail: i,
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
    return { status: t.method === "POST" ? 200 : 405, headers: c, body: d, log: u };
  }
  $a.exports = { handle: Cs, wrap: kt, routeOf: Na, clientIp: vs };
});

// src/ag/platform.js
var cn = O((H) => {
  "use strict";
  var Pa = me("net"), { onCall: ie, onRequest: ks, HttpsError: Ce } = ne(), { onSchedule: Oa } = Xn(), { AggregateField: Ve } = Qn(), b = ae(), { db: S, admin: Is, FieldValue: j, REGION: z } = b, We = He(), { loadConfig: ge, clearConfigCache: _s, DEFAULTS: Ma } = St(), W = tn(), Ra = Ea(), Ns = ["slots", "live", "sports", "fishing", "lottery", "cards", "crash"], $s = (e = "", t = "", n = "") => {
    let a = `${e} ${t} ${n}`.toUpperCase();
    return /LIVE|BACCARAT|ROULETTE/.test(a) ? "live" : /SPORT/.test(a) ? "sports" : /FISH/.test(a) ? "fishing" : /LOTT|KENO|BINGO/.test(a) ? "lottery" : /CARD|POKER|RUMMY|TEEN|ANDAR|TABLE/.test(a) ? "cards" : /CRASH|AVIATOR|ROCKET/.test(a) ? "crash" : "slots";
  }, sn = (e) => String(e).replace(/[\/\s]/g, "_").slice(0, 400), Es = ["BR_BRL", "GB_GBP", "DK_DKK", "DE_EUR", "ES_EUR", "FI_EUR", "FR_EUR", "ID_IDR", "IT_EUR", "NL_EUR", "NO_NOK", "PL_PLN", "PT_EUR", "TH_THB", "TR_TRY", "VN_VND", "MM_MMK", "SG_SGD", "NG_NGN", "US_USD", "PK_PKR", "CO_COP", "PH_PHP", "MX_MXN", "AR_ARS", "KE_KES", "CL_CLP", "ZA_ZAR", "BD_BDT", "IN_INR", "LK_LKR"], Da = ["en", "ar", "az", "bg", "bn", "cs", "da", "de", "el", "en-stkus", "es", "et", "fa", "fi", "fr", "hi", "hu", "hy", "id", "it", "ja", "ko", "lo", "lt", "mn", "my", "ms", "nl", "no", "pl", "pt", "pt-br", "ro", "ru", "sh", "si", "sk", "sq", "sv", "th", "tr", "uk", "ur", "uz", "vi"];
  function on(e, t = "Game service error") {
    if (e instanceof Ce) return e;
    if (e instanceof We.AgError || e instanceof W.ClientError && e.kind === "provider") {
      let n = e.code || "C10001", a = We.info(n);
      return new Ce("failed-precondition", a.en, { agCode: n, bn: a.bn, providerMsg: e.providerMsg || e.detail || "", retry: We.isRetryable(n) });
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
  var le = (e) => async (t) => {
    try {
      return await e(t);
    } catch (n) {
      throw on(n);
    }
  }, Rs = (e) => {
    let n = String(e.rawRequest?.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || String(e.rawRequest?.ip || "").replace(/^::ffff:/, "");
    return Pa.isIP(n) ? n : "";
  }, Re = (e, t, n, a) => {
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
      n = await ge({ requireSecret: !1 });
    } catch {
      n = { ...Ma };
    }
    let a = await Ra.handle({ db: S, FieldValue: j, cfg: n, now: Date.now() }, {
      method: e.method,
      path: e.path || e.url,
      headers: e.headers,
      rawBody: e.rawBody || Buffer.from(""),
      ip: Ra.clientIp(e.headers, e.ip)
    });
    S.collection("agCallbackLogs").add({ ...a.log, at: j.serverTimestamp(), atMs: a.log.at }).catch((r) => console.error("log", r.message)), a.log.code === "C10001" && console.error("agCallback internal error", a.log.detail), t.status(a.status).set(a.headers).send(a.body);
  });
  H.adminSaveGameApiConfig = ie({ region: z }, le(async (e) => {
    let t = b.requireRole(e, ["super"]), n = e.data || {}, a = b.str(n.baseUrl, { max: 200, label: "Base URL", pattern: /^https:\/\/[^\s]+$/ }).replace(/\/+$/, ""), r = b.str(n.currencyCode || "BD_BDT", { max: 20, label: "Currency" });
    if (!Es.includes(r)) throw b.bad("Unsupported currency code (see PDF \xA72.7).");
    let s = b.str(n.lang || "bn", { max: 10, label: "Language" });
    if (!Da.includes(s)) throw b.bad("Unsupported language (see PDF \xA72.8).");
    let o = b.str(n.subMerchantCode || "site", { max: 50, label: "Sub-merchant code", pattern: It }), i = n.siteUrl ? b.str(n.siteUrl, { max: 200, label: "Site URL", pattern: /^https:\/\/[^\s/]+(\/[^\s]*)?$/ }).replace(/\/+$/, "") : "", d = (Array.isArray(n.callbackIpWhitelist) ? n.callbackIpWhitelist : String(n.callbackIpWhitelist || "").split(/[\s,]+/)).map((l) => String(l).trim()).filter(Boolean);
    if (d.some((l) => !Pa.isIP(l))) throw b.bad("IP allow-list contains an invalid IP address.");
    let c = {
      baseUrl: a,
      merchantCode: b.str(n.merchantCode, { max: 64, label: "Merchant code" }),
      currencyCode: r,
      lang: s,
      subMerchantCode: o,
      siteUrl: i,
      terminalType: n.terminalType === "PC" ? "PC" : "PHONE",
      env: n.env === "prod" ? "prod" : "staging",
      verifyResponseSign: ["auto", "strict", "off"].includes(n.verifyResponseSign) ? n.verifyResponseSign : "auto",
      timestampToleranceSec: Re(n.timestampToleranceSec ?? 300, 30, 900, "Timestamp tolerance"),
      callbackIpWhitelist: d.slice(0, 50),
      categoryMap: typeof n.categoryMap == "object" && n.categoryMap ? n.categoryMap : {},
      updatedAt: j.serverTimestamp(),
      updatedBy: t
    };
    await S.doc("adminConfig/gameApi").set(c, { merge: !0 });
    let u = typeof n.secretKey == "string" && n.secretKey.trim().length > 0;
    return u && await S.doc("adminPrivate/gameApi").set({ secretKey: n.secretKey.trim(), rotatedAt: j.serverTimestamp() }), await S.doc("adminConfig/gameApiStatus").set({ ok: !1, testedAt: null, message: "Configuration changed \u2014 run the connection test." }), _s(), b.audit(null, t, "game_api_config", { baseUrl: a, merchantCode: c.merchantCode, env: c.env, secretChanged: u }), { ok: !0 };
  }));
  H.adminGetGameApiConfig = ie({ region: z }, le(async (e) => {
    b.requireRole(e, ["super"]);
    let [t, n, a, r] = await Promise.all([S.doc("adminConfig/gameApi").get(), S.doc("adminPrivate/gameApi").get(), S.doc("adminConfig/gameApiStatus").get(), S.doc("adminConfig/agMerchant").get()]), s = String((globalThis.__ENV || process.env).SUPABASE_URL || "").replace(/\/+$/, ""), o = { ...Ma, ...t.exists ? t.data() : {} };
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
      let a = await ge({ fresh: !0 }), s = ((await W.call(a, "/game/v5/providers", {}, { retries: 0 })).data?.providers || []).length;
      n = { ok: !0, latencyMs: Date.now() - t, message: `Connected \u2014 ${s} provider(s) returned.`, providerCount: s };
    } catch (a) {
      let r = on(a);
      n = { ok: !1, latencyMs: Date.now() - t, message: a.message || r.message, agCode: r.details?.agCode || null, kind: a.kind || r.details?.kind || "config", httpStatus: a.status || null };
    }
    return await S.doc("adminConfig/gameApiStatus").set({ ...n, testedAt: j.serverTimestamp() }), n;
  });
  H.adminSyncGames = ie({ region: z, timeoutSeconds: 540, memory: "512MiB" }, le(async (e) => {
    let t = b.requireRole(e, ["super", "content"]), n = await ge({ fresh: !0 }), r = ((await W.call(n, "/game/v5/providers", {})).data?.providers || []).map((u) => typeof u == "string" ? { name: u, code: u } : u);
    await S.doc("adminConfig/agProviders").set({ providers: r, syncedAt: j.serverTimestamp() });
    let s = (await W.call(n, "/game/v5/categories", { currencyCode: n.currencyCode, lang: n.lang })).data?.categoryDataList || [], o = 0, i = [], d = /* @__PURE__ */ new Set();
    for (let u of s) {
      let l = u.categoryCode || u.code;
      if (!l) continue;
      let m = (n.categoryMap || {})[l] || $s(l, u.categoryName), p = 0;
      for (let f = 1; f <= 200; f++) {
        let w = await W.call(n, "/game/v5/games", { categoryCode: l, currencyCode: n.currencyCode, lang: n.lang, pageIndex: f }), T = w.data?.gameItemList || w.data?.gameltemList || [];
        if (!T.length) break;
        let g = S.batch();
        for (let A of T) {
          let k = A.gameCode;
          if (!k) continue;
          let E = Number.isInteger(Number(A.status)) ? Number(A.status) : 1;
          g.set(S.doc(`games/${sn(k)}`), {
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
          }, { merge: !0 }), d.add(String(k)), o++, p++;
        }
        await g.commit();
        let $ = Number(w.data?.totalSize) || 0;
        if ($ && p >= $) break;
      }
      i.push({ code: l, name: u.categoryName || l, lobby: m, count: p });
    }
    let c = S.batch();
    return i.forEach((u) => c.set(S.doc(`gameCategories/${sn(u.code)}`), { ...u, syncedAt: j.serverTimestamp() }, { merge: !0 })), await c.commit(), b.audit(null, t, "games_synced", { providers: r.length, categories: i.length, games: o, unique: d.size }), { ok: !0, providers: r.length, categories: i.length, games: d.size };
  }));
  function Ps(e, t) {
    let n = String(e.rawRequest?.headers?.origin || "").replace(/\/+$/, ""), a = [t.siteUrl, String((globalThis.__ENV || process.env).SITE_URL || "").replace(/\/+$/, "")].filter(Boolean);
    if (n && (a.includes(n) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(n))) return n;
    if (t.siteUrl) return t.siteUrl;
    throw new Ce("failed-precondition", "Set the Site URL in Admin \u2192 Game API (needed for the game exit page).");
  }
  H.launchGame = ie({ region: z, timeoutSeconds: 30 }, le(async (e) => {
    let t = b.requireVerified(e), n = e.data || {}, a = b.str(n.gameCode, { max: 120, label: "Game" }), [r, s, o] = await Promise.all([S.doc(`games/${sn(a)}`).get(), S.doc(`users/${t}`).get(), ge()]), i = s.data();
    b.assertActive(i);
    let d = i.rg?.excludedUntil;
    if ((d?.toMillis ? d.toMillis() : Number(d) || 0) > Date.now()) throw new Ce("failed-precondition", "You are on a self-exclusion break. Games are unavailable until it ends.");
    if (!r.exists || r.data().enabled === !1) throw new We.AgError("G20002");
    if (r.data().status === 0) throw new We.AgError("G20003");
    if (r.data().status === 2) throw new We.AgError("G20010");
    let c = Rs(e);
    if (!c) throw new Ce("failed-precondition", "Could not determine your IP address.");
    let u = n.terminalType === "PC" ? "PC" : n.terminalType === "PHONE" ? "PHONE" : o.terminalType, l = Ps(e, o), m = {
      gameCode: r.data().gameCode,
      playerId: t,
      currencyCode: o.currencyCode,
      language: Da.includes(n.language) ? n.language : o.lang,
      terminalType: u,
      returnUrl: `${l}/exitGame.html?game=${encodeURIComponent(r.data().gameCode)}`,
      ipAddress: c,
      subMerchantCode: o.subMerchantCode || "site",
      nickName: String(i.username || i.name || "Player").slice(0, 32)
    };
    /^https:\/\//.test(i.photoURL || "") && (m.avatarUrl = i.photoURL);
    let p = await W.call(o, "/game/v5/game/url", m), f = p.data?.gameUrl || p.data?.url;
    if (!f || !/^https?:\/\//.test(f)) throw new Ce("unavailable", "The game provider did not return a game URL.");
    return await S.doc(`agSessions/${t}`).set({
      uid: t,
      status: "active",
      gameCode: r.data().gameCode,
      gameName: r.data().name || "",
      terminalType: u,
      ip: c,
      expireTime: p.data?.expireTime || null,
      launchedAt: j.serverTimestamp(),
      launchedAtMs: Date.now(),
      closedAt: null,
      forcedAt: null
    }, { merge: !0 }), await S.collection("gameHistory").add({ uid: t, game: r.data().gameCode, provider: "ag", status: "launched", at: j.serverTimestamp() }), { gameUrl: f, gameCode: r.data().gameCode, gameName: r.data().name || "", expireTime: p.data?.expireTime || null };
  }));
  H.agExitGame = ie({ region: z }, le(async (e) => {
    let t = b.authUid(e), n = S.doc(`agSessions/${t}`);
    return await S.runTransaction(async (a) => {
      let r = await a.get(n);
      r.exists && r.data().status === "active" && a.update(n, { status: "closed", closedAt: j.serverTimestamp() });
    }), { ok: !0 };
  }));
  async function Ua(e, t, n, { revokeTokens: a = !1, reason: r = "" } = {}) {
    let s = "SKIPPED", o = "";
    try {
      let i = await W.call(e, "/game/v5/player/force/logout", { playerId: t });
      s = i.data?.logoutStatus || "SUCCESS", o = i.data?.message || "";
    } catch (i) {
      s = "FAILED", o = on(i).message;
    }
    return await S.doc(`agSessions/${t}`).set({ uid: t, status: "forced", forcedAt: j.serverTimestamp(), forcedBy: n, forceReason: r, providerLogout: s }, { merge: !0 }), a && (await Is.auth().revokeRefreshTokens(t), await S.doc(`users/${t}`).set({ sessionsRevokedAt: j.serverTimestamp() }, { merge: !0 })), await S.collection("users").doc(t).collection("notifications").add({
      title: "Signed out of games",
      body: r || "Your game session was ended by support.",
      type: "security",
      read: !1,
      createdAt: j.serverTimestamp()
    }), { playerId: t, logoutStatus: s, message: o };
  }
  H.adminForceLogout = ie({ region: z, timeoutSeconds: 300 }, le(async (e) => {
    let t = b.requireRole(e, ["super", "support"]), n = e.data || {}, a = await ge(), r = typeof n.reason == "string" ? n.reason.trim().slice(0, 200) : "", s = [];
    n.all === !0 ? s = (await S.collection("agSessions").where("status", "==", "active").limit(200).get()).docs.map((d) => d.id) : s = [b.str(n.uid, { max: 128, label: "Player", pattern: st })];
    let o = [];
    for (let i of s) o.push(await Ua(a, i, t, { revokeTokens: n.revokeTokens === !0, reason: r }));
    return b.audit(null, t, "ag_force_logout", { count: o.length, all: n.all === !0, revokeTokens: n.revokeTokens === !0, failed: o.filter((i) => i.logoutStatus === "FAILED").length }), { ok: !0, results: o };
  }));
  H.forceLogoutOne = Ua;
  H.adminAgRtp = ie({ region: z, timeoutSeconds: 60 }, le(async (e) => {
    let t = b.requireRole(e, ["super", "finance"]), n = e.data || {}, a = await ge(), r = a.currencyCode, s, o = null;
    switch (n.action) {
      case "subMerchant": {
        let i = b.str(n.subMerchantCode || a.subMerchantCode, { max: 50, label: "Sub-merchant", pattern: It }), d = Re(n.rtp, 1, 100, "RTP");
        s = await W.call(a, "/game/v5/set/sub/merchant/rtp", { subMerchantCode: i, rtp: d, currencyCode: r }), o = { scope: "SUB_MERCHANT", subMerchantCode: i, rtp: d, changed: s.data?.changedRtpValue };
        break;
      }
      case "player": {
        let i = b.str(n.playerId, { max: 128, label: "Player", pattern: st }), d = Re(n.rtp, 1, 100, "RTP");
        s = await W.call(a, "/game/v5/set/player/rtp", { currencyCode: r, rtp: d, playerId: i }), o = { scope: "PLAYER", playerId: i, rtp: d, changed: s.data?.changedRtpValue };
        break;
      }
      case "batch": {
        let i = [...new Set((Array.isArray(n.playerIds) ? n.playerIds : []).map((c) => String(c).trim()).filter(Boolean))];
        if (!i.length || i.length > 50) throw b.bad("Provide 1-50 player IDs.");
        if (i.some((c) => !st.test(c))) throw b.bad("One of the player IDs is invalid.");
        let d = Re(n.rtp, 1, 100, "RTP");
        s = await W.call(a, "/game/v5/batch/set/player/rtp", { currencyCode: r, rtp: d, playerIds: i }), o = { scope: "BATCH", playerIds: i, rtp: d, accepted: !0 };
        break;
      }
      case "effective": {
        let i = { currencyCode: r };
        n.subMerchantCode && (i.subMerchantCode = b.str(n.subMerchantCode, { max: 50, pattern: It, label: "Sub-merchant" })), n.playerId && (i.playerId = b.str(n.playerId, { max: 128, pattern: st, label: "Player" })), s = await W.call(a, "/game/v5/rtp/effective", i);
        break;
      }
      case "history": {
        let i = _t(n.startTime, "Start time"), d = _t(n.endTime, "End time");
        if (i.ms >= d.ms) throw b.bad("Start time must be before end time.");
        if (i.ms < Date.now() - 31 * 864e5) throw b.bad("Only the past month can be queried (PDF \xA75.4.4).");
        let c = { currencyCode: r, startTime: i.s, endTime: d.s, pageSize: Re(n.pageSize ?? 20, 1, 100, "Page size") };
        n.cursor && (c.cursor = b.str(n.cursor, { max: 200, label: "Cursor" })), n.subMerchantCode && (c.subMerchantCode = b.str(n.subMerchantCode, { max: 50, pattern: It, label: "Sub-merchant" })), n.playerId && (c.playerId = b.str(n.playerId, { max: 128, pattern: st, label: "Player" })), Array.isArray(n.playerIds) && n.playerIds.length && (c.playerIds = n.playerIds.slice(0, 50).map(String)), s = await W.call(a, "/game/v5/rtp/change/history", c);
        break;
      }
      default:
        throw b.bad("Unknown RTP action.");
    }
    return o && (await S.collection("agRtpChanges").add({ ...o, currencyCode: r, by: t, at: j.serverTimestamp() }), b.audit(null, t, "ag_rtp_change", o)), { ok: !0, data: s.data ?? {} };
  }));
  async function Ba(e, { startIso: t, endIso: n, pageNum: a, pageSize: r, sort: s }) {
    let i = (await W.call(e, "/game/v5/game/record", { pageNum: a, pageSize: r, reqData: { startTime: t, endTime: n, sort: s } })).data?.gameRecordList || [];
    if (i.length) {
      let d = S.batch();
      for (let c of i) {
        if (c.orderNo === void 0 || c.orderNo === null) continue;
        let u = c.playerId || c.playerUniqueId || "", l = Number(c.betAmount) || 0, m = Number(c.winAmount) || 0;
        d.set(S.doc(`agGameRecords/${String(c.orderNo)}`), {
          orderNo: String(c.orderNo),
          playerId: u,
          uid: u,
          betAmount: l,
          winAmount: m,
          ggr: Math.round((l - m) * 100) / 100,
          betTime: c.betTime || "",
          winTime: c.winTime || "",
          betTimeMs: Date.parse(c.betTime) || 0,
          gameCode: c.gameCode || "",
          currencyCode: c.currencyCode || "",
          roundId: c.roundId || "",
          syncedAt: j.serverTimestamp()
        }, { merge: !0 });
      }
      await d.commit();
    }
    return i;
  }
  H.adminAgGameRecords = ie({ region: z, timeoutSeconds: 120 }, le(async (e) => {
    b.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, n = await ge(), a = _t(t.startTime, "Start time"), r = _t(t.endTime, "End time");
    if (a.ms >= r.ms) throw b.bad("Start time must be before end time.");
    let s = await Ba(n, { startIso: a.s, endIso: r.s, pageNum: Re(t.pageNum ?? 1, 1, 1e5, "Page"), pageSize: Re(t.pageSize ?? 20, 1, 100, "Page size"), sort: t.sort !== !1 });
    return { ok: !0, records: s, hasMore: s.length >= (Number(t.pageSize) || 20) };
  }));
  async function La(e) {
    let n = (await W.call(e, "/game/v5/merchant/info", {})).data || {}, a = n.apiType === 0 || n.apiType === "0" || n.apiType === "SINGLE_WALLET" ? "SINGLE_WALLET" : n.apiType === 1 || n.apiType === "1" || n.apiType === "TRANSFER_WALLET" ? "TRANSFER_WALLET" : String(n.apiType ?? ""), r = (n.walletInfos || []).map((i) => ({ billingMode: i.billingMode || "", rtp: Number(i.rtp) || null, currencyCode: i.currencyCode || "", balance: Number(i.balance) || 0 })), s = r.find((i) => i.currencyCode === e.currencyCode), o = {
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
  H.adminAgMerchantInfo = ie({ region: z, timeoutSeconds: 60 }, le(async (e) => (b.requireRole(e, ["super", "finance"]), { ok: !0, merchant: { ...await La(await ge({ fresh: !0 })), syncedAt: Date.now() } })));
  H.adminAgReport = ie({ region: z, timeoutSeconds: 60 }, le(async (e) => {
    b.requireRole(e, ["super", "finance"]);
    let t = e.data || {}, n = Number(t.from) || Date.now() - 864e5, a = Number(t.to) || Date.now();
    if (n >= a || a - n > 400 * 864e5) throw b.bad("Invalid date range.");
    let r = S.collection("agBets").where("at", ">=", n).where("at", "<", a), [s, o, i, d] = await Promise.all([
      r.aggregate({ bets: Ve.sum("betAmount"), wins: Ve.sum("winAmount"), reversed: Ve.sum("winReversed"), n: Ve.count() }).get(),
      r.where("status", "==", "cancelled").aggregate({ refunded: Ve.sum("betAmount"), n: Ve.count() }).get(),
      S.collection("statsShards").get(),
      S.collection("agSessions").where("status", "==", "active").count().get()
    ]), c = s.data(), u = o.data(), l = (c.bets || 0) - (u.refunded || 0), m = (c.wins || 0) - (c.reversed || 0), p = {};
    return i.docs.filter((f) => f.id.startsWith("ag_")).forEach((f) => {
      for (let [w, T] of Object.entries(f.data())) p[w] = Math.round(((p[w] || 0) + (Number(T) || 0)) * 100) / 100;
    }), {
      ok: !0,
      range: { from: n, to: a },
      betCount: c.n || 0,
      cancelledCount: u.n || 0,
      turnover: Math.round(l * 100) / 100,
      payout: Math.round(m * 100) / 100,
      ggr: Math.round((l - m) * 100) / 100,
      rtpActual: l > 0 ? Math.round(m / l * 1e4) / 100 : null,
      activeSessions: d.data().count,
      lifetime: p
    };
  }));
  H.agScheduledSync = Oa({ region: z, schedule: "every 30 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    let e;
    try {
      e = await ge({ fresh: !0 });
    } catch {
      return;
    }
    try {
      await La(e);
    } catch (n) {
      console.error("merchant sync", n.message);
    }
    try {
      let n = /* @__PURE__ */ new Date(), a = new Date(n.getTime() - 40 * 6e4);
      for (let r = 1; r <= 50 && !((await Ba(e, { startIso: a.toISOString(), endIso: n.toISOString(), pageNum: r, pageSize: 100, sort: !1 })).length < 100); r++)
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
  H.agCleanup = Oa({ region: z, schedule: "every day 04:10", timeZone: "Asia/Dhaka", timeoutSeconds: 540 }, async () => {
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
var Ga = O((ot) => {
  "use strict";
  var { onCall: $t } = ne(), Q = ae(), { db: Pe, admin: dn, FieldValue: Nt, HttpsError: Os, REGION: Et } = Q;
  ot.setResponsibleGaming = $t({ region: Et }, async (e) => {
    let t = Q.authUid(e), n = e.data || {}, a = Pe.doc(`users/${t}`), r = {};
    if (await Pe.runTransaction(async (s) => {
      let o = await s.get(a);
      Q.assertActive(o.data());
      let i = { ...o.data().rg || {} }, d = Date.now();
      if (i.pendingLimitAt && i.pendingLimitAt <= d && (i.dailyDepositLimit = i.pendingLimit, delete i.pendingLimit, delete i.pendingLimitAt), n.dailyDepositLimit !== void 0) {
        let c = Number(n.dailyDepositLimit) || 0;
        if (c < 0 || c > 1e8) throw Q.bad("Invalid limit.");
        let u = Number(i.dailyDepositLimit) || 0;
        c > 0 && (u === 0 || c < u) ? (i.dailyDepositLimit = Q.round2(c), delete i.pendingLimit, delete i.pendingLimitAt, r.applied = "now") : c !== u && (i.pendingLimit = Q.round2(c), i.pendingLimitAt = d + 24 * 36e5, r.applied = "in24h");
      }
      if (n.excludeDays !== void 0) {
        let c = Number(n.excludeDays);
        if (![1, 7, 30, 90, 180, 365].includes(c)) throw Q.bad("Choose 1, 7, 30, 90, 180 or 365 days.");
        let u = d + c * 864e5, l = i.excludedUntil?.toMillis ? i.excludedUntil.toMillis() : Number(i.excludedUntil) || 0;
        i.excludedUntil = Math.max(l, u), r.excludedUntil = i.excludedUntil, s.set(Pe.doc(`agSessions/${t}`), { uid: t, status: "forced", forcedAt: Nt.serverTimestamp(), forceReason: "self-exclusion" }, { merge: !0 });
      }
      s.update(a, { rg: i }), r.rg = i;
    }), r.excludedUntil)
      try {
        let { loadConfig: s } = St();
        await tn().call(await s(), "/game/v5/player/force/logout", { playerId: t }, { retries: 1 });
      } catch (s) {
        console.warn("self-exclusion provider logout", s.message);
      }
    return { ok: !0, ...r };
  });
  ot.revokeMySessions = $t({ region: Et }, async (e) => {
    let t = Q.authUid(e);
    return await dn.auth().revokeRefreshTokens(t), await Pe.doc(`users/${t}`).set({ sessionsRevokedAt: Nt.serverTimestamp() }, { merge: !0 }), await Pe.collection("loginHistory").add({ uid: t, event: "logout_all", at: Nt.serverTimestamp() }), { ok: !0 };
  });
  ot.adminListStaff = $t({ region: Et }, async (e) => (Q.requireRole(e, ["super"]), { staff: (await Pe.collection("users").where("role", "in", Q.STAFF_ROLES).limit(100).get()).docs.map((n) => ({ uid: n.id, name: n.data().name || "", username: n.data().username || "", email: n.data().email || "", role: n.data().role, status: n.data().status })) }));
  ot.adminSignOutUser = $t({ region: Et, timeoutSeconds: 60 }, async (e) => {
    let t = Q.requireRole(e, ["super", "support"]), n = Q.str((e.data || {}).uid, { max: 128, label: "User" });
    if (!await dn.auth().getUser(n).catch(() => null)) throw new Os("not-found", "User not found.");
    await dn.auth().revokeRefreshTokens(n), await Pe.doc(`users/${n}`).set({ sessionsRevokedAt: Nt.serverTimestamp() }, { merge: !0 });
    try {
      let { loadConfig: r } = St(), { forceLogoutOne: s } = cn();
      await s(await r(), n, t, { reason: "Signed out by support" });
    } catch (r) {
      console.warn("provider logout", r.message);
    }
    return Q.audit(null, t, "user_signed_out", { uid: n }), { ok: !0 };
  });
});

// src/fswrite.js
var Wa = O((Va) => {
  "use strict";
  var { onCall: Ms } = ne(), Me = ae(), { db: qa, HttpsError: xa, REGION: Ds } = Me, { merge: ja, setPath: Us, plain: Bs } = Ye(), Oe = (e) => typeof e == "number" && Number.isFinite(e), ke = (e) => typeof e == "string", Fa = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  }, ce = (e, t) => t.includes(Fa(e)), Ha = (e) => new xa("permission-denied", e || "You do not have permission."), Ls = (e, t) => [.../* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])].filter((a) => JSON.stringify((e || {})[a]) !== JSON.stringify((t || {})[a])), Rt = (e, t, n) => Ls(e, t).every((a) => n.includes(a)), N = (e, t) => {
    if (!e) throw Ha(t);
  };
  function Gs(e, t, n, a, r, s) {
    let o = n.split("/"), i = Fa(e) !== null;
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
      N(ke(s.name) && s.name.length > 0 && s.name.length <= 60 && typeof s.enabled == "boolean", "Invalid payment method."), N(s.type === void 0 || ["deposit", "withdraw", "both"].includes(s.type), "Invalid type."), N(s.minAmount === void 0 || Oe(s.minAmount) && s.minAmount >= 0, "Invalid minimum.");
      return;
    }
    if (o[0] === "paymentAccounts" && o.length === 2) {
      if (N(ce(e, ["super", "finance"])), a === "delete") return;
      N(ke(s.methodId) && ke(s.accountNumber) && ["active", "disabled", "maintenance", "locked", "archived"].includes(s.status) && Oe(s.dailyLimit) && Oe(s.monthlyLimit), "Invalid payment account.");
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
      N(ke(s.title) && Oe(s.amount) && s.amount > 0 && s.amount <= 1e6 && ["once", "daily", "weekly"].includes(s.type) && typeof s.enabled == "boolean", "Invalid bonus.");
      return;
    }
    if (o[0] === "lotteries" && o.length === 2) {
      if (N(ce(e, ["super", "content"])), a === "delete") {
        N(r && r.sold === 0, "Tickets were already sold.");
        return;
      }
      if (!r) {
        N(s.sold === 0 && s.status === "open" && Oe(s.price) && Oe(s.prize) && Oe(s.totalTickets), "Invalid lottery.");
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
    throw Ha("Not allowed.");
  }
  Va.fsWrite = Ms({ region: Ds }, async (e) => {
    let t = Me.authUid(e), n = (e.data || {}).ops;
    if (!Array.isArray(n) || !n.length || n.length > 400) throw Me.bad("Invalid request.");
    return await qa.runTransaction(async (a) => {
      let r = [];
      for (let s of n) {
        let o = Me.str(s.path, { max: 300, label: "Path" });
        if (!/^[A-Za-z0-9_\-./]+$/.test(o) || o.includes("..") || o.split("/").length % 2 !== 0) throw Me.bad("Invalid path.");
        let i = qa.doc(o), d = await a.get(i), c = d.exists ? d.data() : void 0, u = s.op === "create" ? "set" : s.op;
        if (!["set", "update", "delete"].includes(u)) throw Me.bad("Invalid operation.");
        let l;
        if (u === "delete") l = void 0;
        else {
          let m = Bs(s.data || {});
          if (typeof m != "object" || Array.isArray(m)) throw Me.bad("Invalid data.");
          if (u === "update") {
            if (!c) throw new xa("not-found", "Document not found.");
            l = JSON.parse(JSON.stringify(c));
            for (let [p, f] of Object.entries(m)) Us(l, p, f);
          } else l = s.merge && c ? ja(JSON.parse(JSON.stringify(c)), m) : ja({}, m);
        }
        Gs(e, t, o, u === "delete" ? "delete" : c ? "update" : "create", c, l), r.push({ ref: i, type: u, data: s.data, merge: !!s.merge });
      }
      for (let s of r)
        s.type === "delete" ? a.delete(s.ref) : s.type === "update" ? a.update(s.ref, s.data) : a.set(s.ref, s.data, { merge: s.merge });
    }), { ok: !0 };
  });
});

// src/index.js
var Ka = O((it) => {
  "use strict";
  Object.assign(
    it,
    Dn(),
    Ln(),
    xn(),
    Yn(),
    zn(),
    cn(),
    Ga(),
    Wa()
  );
  delete it.ensureUserDoc;
  delete it.LOBBY;
  delete it.forceLogoutOne;
});

// supa/handler.js
var Za = O((Co, Xa) => {
  "use strict";
  var K = ut(), { HttpsError: za } = ne(), qs = {
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
  }, js = (e) => String(e).toUpperCase().replace(/-/g, "_"), xs = null, ln = () => xs ||= Ka();
  function Ja(e) {
    return {
      "access-control-allow-origin": K.env.ALLOWED_ORIGIN || "*",
      "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-max-age": "86400",
      vary: "origin",
      ...e
    };
  }
  var we = (e, t, n) => ({ status: e, headers: Ja({ "content-type": "application/json", "cache-control": "no-store", ...n || {} }), body: JSON.stringify(t) }), Fs = (e) => e instanceof za || e && e.name === "HttpsError" ? we(qs[e.code] || 500, { error: { status: js(e.code), code: e.code, message: e.message, details: e.details === void 0 ? null : e.details } }) : (console.error("unhandled", e && e.stack || e), we(500, { error: { status: "INTERNAL", code: "internal", message: "Something went wrong on the server. Please try again.", details: null } })), Pt = K.tokenCache = /* @__PURE__ */ new Map();
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
  }, Ya = (e) => e == null ? Buffer.alloc(0) : Buffer.from(e), Ws = (e) => {
    let t = {};
    for (let [n, a] of Object.entries(e || {})) t[String(n).toLowerCase()] = a;
    return t;
  };
  async function Ks(e) {
    let t = Ws(e.headers), n = String(e.method || "GET").toUpperCase();
    if (n === "OPTIONS") return { status: 204, headers: Ja(), body: "" };
    let r = new URL(e.url, "http://x").pathname, s = r.indexOf("/api/");
    s >= 0 ? r = r.slice(s + 4) : r.endsWith("/api") && (r = "/"), r = r.replace(/\/+$/, "") || "/";
    try {
      if (r === "/health") return we(200, { ok: !0, time: Date.now() });
      if (r === "/agw" || r.startsWith("/agw/")) {
        let f = ln().agCallback, w = { status: 200, headers: {}, body: "" }, T = { status(g) {
          return w.status = g, T;
        }, set(g) {
          return Object.assign(w.headers, g), T;
        }, send(g) {
          return w.body = g, T;
        } };
        return await f({ method: n, path: r, url: r, headers: t, rawBody: Ya(e.body), ip: t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : "" }, T), { status: w.status, headers: { "cache-control": "no-store", ...w.headers }, body: typeof w.body == "string" ? w.body : JSON.stringify(w.body) };
      }
      if (r.startsWith("/_cron/")) {
        if (!K.env.CRON_SECRET || t["x-cron-secret"] !== K.env.CRON_SECRET) return we(401, { error: { code: "unauthenticated", message: "bad secret" } });
        let f = ln()[r.slice(7)];
        return !f || f.__kind !== "schedule" ? we(404, { error: { code: "not-found", message: "unknown job" } }) : (await f(), we(200, { ok: !0 }));
      }
      if (n !== "POST") return we(405, { error: { code: "invalid-argument", message: "POST only" } });
      let o = r.slice(1), i = ln()[o];
      if (!i || i.__kind !== "call") return we(404, { error: { status: "NOT_FOUND", code: "not-found", message: "Unknown function." } });
      let d = null, c = /^Bearer\s+(.+)$/i.exec(t.authorization || "");
      if (c) {
        let f = await Hs(c[1]).catch(() => null);
        f && (d = Vs(f));
      }
      let u = {}, l = Ya(e.body).toString("utf8");
      if (l)
        try {
          let f = JSON.parse(l);
          u = f && f.data !== void 0 ? f.data : f;
        } catch {
          throw new za("invalid-argument", "Bad JSON.");
        }
      let m = t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : t["cf-connecting-ip"] || "", p = await i({ data: u, auth: d, rawRequest: { headers: t, ip: m } });
      return we(200, { result: p === void 0 ? null : p });
    } catch (o) {
      return Fs(o);
    }
  }
  Xa.exports = { handle: Ks };
});

// supa/entry-deno.mjs
var Qa = gn(ut(), 1), er = gn(Za(), 1);
import Ys from "npm:postgres@3.4.4";
var tr = {};
for (let e of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET", "REQUIRE_VERIFIED", "ALLOWED_ORIGIN"]) tr[e] = Deno.env.get(e) || "";
var zs = Deno.env.get("DB_URL") || Deno.env.get("SUPABASE_DB_URL"), Js = Ys(zs, { max: 4, prepare: !1, idle_timeout: 20, connect_timeout: 10, onnotice() {
} });
Qa.default.configure({ sql: Js, env: tr });
Deno.serve(async (e) => {
  let t = {};
  e.headers.forEach((r, s) => {
    t[s] = r;
  });
  let n = e.method === "GET" || e.method === "HEAD" || e.method === "OPTIONS" ? void 0 : new Uint8Array(await e.arrayBuffer()), a = await (0, er.handle)({ method: e.method, url: e.url, headers: t, body: n });
  return new Response(a.status === 204 ? null : a.body, { status: a.status, headers: a.headers });
});
