// @ts-nocheck
import { createRequire as __cr } from "node:module";
import { Buffer as __Buf } from "node:buffer";
import __proc from "node:process";
const require = __cr("file:///src/index.ts");
globalThis.Buffer = globalThis.Buffer || __Buf;
globalThis.process = globalThis.process || __proc;
var Gi = Object.create;
var zs = Object.defineProperty;
var Fi = Object.getOwnPropertyDescriptor;
var Hi = Object.getOwnPropertyNames;
var Wi = Object.getPrototypeOf, zi = Object.prototype.hasOwnProperty;
var Se = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, {
  get: (t, a) => (typeof require < "u" ? require : t)[a]
}) : e)(function(e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var E = (e, t) => () => {
  try {
    return t || e((t = { exports: {} }).exports, t), t.exports;
  } catch (a) {
    throw t = 0, a;
  }
};
var Ki = (e, t, a, n) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let s of Hi(t))
      !zi.call(e, s) && s !== a && zs(e, s, { get: () => t[s], enumerable: !(n = Fi(t, s)) || n.enumerable });
  return e;
};
var Ks = (e, t, a) => (a = e != null ? Gi(Wi(e)) : {}, Ki(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  t || !e || !e.__esModule ? zs(a, "default", { value: e, enumerable: !0 }) : a,
  e
));

// src/trace.js
var Dn = E((Ma) => {
  "use strict";
  var { AsyncLocalStorage: Vi } = Se("async_hooks"), In = new Vi();
  Ma.run = (e) => In.run({ t0: Date.now(), marks: [] }, e);
  Ma.mark = (e) => {
    let t = In.getStore();
    t && t.marks.length < 40 && t.marks.push(`${e}@${Date.now() - t.t0}`);
  };
  Ma.summary = () => {
    let e = In.getStore();
    return e ? e.marks.join(" ") : "";
  };
});

// supa/pgdb.js
var ta = E((Gu, Js) => {
  "use strict";
  var Yi = Se("crypto"), { mark: gt } = Dn(), Ji = {
    increment: (e) => ({ __op: "inc", n: e }),
    serverTimestamp: () => ({ __op: "ts" })
  }, Xi = {
    count: () => ({ aggregateType: "count" }),
    sum: (e) => ({ aggregateType: "sum", _field: e })
  }, Zi = (e) => Object.defineProperties({ __ts: e }, {
    toMillis: { value: () => e },
    toDate: { value: () => new Date(e) },
    seconds: { value: Math.floor(e / 1e3) },
    nanoseconds: { value: e % 1e3 * 1e6 }
  });
  function Oa(e) {
    if (Array.isArray(e)) return e.map(Oa);
    if (e && typeof e == "object") {
      if (typeof e.__ts == "number" && Object.keys(e).length === 1) return Zi(e.__ts);
      let t = {};
      for (let [a, n] of Object.entries(e)) t[a] = Oa(n);
      return t;
    }
    return e;
  }
  function Ke(e) {
    if (e instanceof Date) return { __ts: e.getTime() };
    if (Array.isArray(e)) return e.map(Ke);
    if (e && typeof e == "object") {
      if (e.__op) return e;
      if (typeof e.toMillis == "function" && typeof e.__ts == "number") return { __ts: e.__ts };
      let t = {};
      for (let [a, n] of Object.entries(e)) n !== void 0 && (t[a] = Ke(n));
      return t;
    }
    return e;
  }
  function Pa(e, t) {
    if (t && t.__op === "inc") return (Number(e) || 0) + t.n;
    if (t && t.__op === "ts") return { __ts: Date.now() };
    if (Array.isArray(t)) return t.map((a) => Pa(void 0, a));
    if (t && typeof t == "object" && typeof t.__ts != "number") {
      let a = {};
      for (let [n, s] of Object.entries(t)) a[n] = Pa(void 0, s);
      return a;
    }
    return t;
  }
  function Vs(e, t, a) {
    let n = t.split("."), s = e;
    for (let r = 0; r < n.length - 1; r++)
      (typeof s[n[r]] != "object" || s[n[r]] === null) && (s[n[r]] = {}), s = s[n[r]];
    let o = n[n.length - 1];
    s[o] = Pa(s[o], a);
  }
  function yt(e, t) {
    for (let [a, n] of Object.entries(t))
      n && typeof n == "object" && !n.__op && !Array.isArray(n) && typeof n.__ts != "number" && e[a] && typeof e[a] == "object" && !Array.isArray(e[a]) && typeof e[a].__ts != "number" ? yt(e[a], n) : e[a] = Pa(e[a], n);
    return e;
  }
  var En = (e) => {
    let t = e.lastIndexOf("/");
    return { collection: e.slice(0, t), id: e.slice(t + 1) };
  }, Pt = class {
    constructor(t, a) {
      this.ref = t, this.id = t.id, this._d = a, this.exists = a !== void 0;
    }
    data() {
      return this._d === void 0 ? void 0 : Oa(JSON.parse(JSON.stringify(this._d)));
    }
  }, Ys = (e) => {
    let t = new Error("ALREADY_EXISTS " + e);
    return t.code = 6, t;
  }, Qi = (e) => {
    let t = new Error("NOT_FOUND " + e);
    return t.code = 5, t;
  }, Rn = class {
    /** @param sql a `postgres` (porsager) client */
    constructor(t) {
      this.sql = t;
    }
    doc(t) {
      return new Ut(this, t);
    }
    collection(t) {
      return new Ua(this, t);
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
      return gt("get"), n.length ? n[0].data : void 0;
    }
    /**
     * Apply a list of buffered ops with a constant number of round trips (the DB may be far from the Edge Function):
     * 1 sorted advisory-lock statement, 1 read of every touched doc, 1 bulk upsert (+1 bulk delete, pipelined).
     * Ops on the same path are folded in order in memory, so semantics equal the old one-op-at-a-time loop.
     */
    async _applyAll(t, a) {
      if (!a.length) return;
      let n = [...new Set(a.map((c) => c.path))].sort(), [, s] = await Promise.all([
        t`select pg_advisory_xact_lock(hashtextextended(s.p, 0)) from (select p from unnest(${n}::text[]) as p order by p) s`,
        t`select path, data from public.docs where path = any(${n}::text[])`
      ]);
      gt("lock+read");
      let o = /* @__PURE__ */ new Map();
      for (let c of s) o.set(c.path, c.data);
      for (let c of a) {
        let l = o.get(c.path);
        if (c.type === "delete") {
          o.set(c.path, void 0);
          continue;
        }
        let u;
        if (c.type === "create") {
          if (l !== void 0) throw Ys(c.path);
          u = yt({}, Ke(c.data));
        } else if (c.type === "set") u = c.merge && l ? yt(JSON.parse(JSON.stringify(l)), Ke(c.data)) : yt({}, Ke(c.data));
        else if (c.type === "update") {
          if (l === void 0) throw Qi(c.path);
          u = JSON.parse(JSON.stringify(l));
          for (let [m, p] of Object.entries(Ke(c.data))) Vs(u, m, p);
        } else throw new Error("bad op " + c.type);
        o.set(c.path, u);
      }
      let r = [], i = [];
      for (let c of n) {
        let l = o.get(c);
        if (l === void 0) {
          s.some((p) => p.path === c) && i.push(c);
          continue;
        }
        let { collection: u, id: m } = En(c);
        r.push({ path: c, collection: u, id: m, data: l });
      }
      let d = [];
      r.length && d.push(t`insert into public.docs (path, collection, id, data)
        select t.path, t.collection, t.id, t.data from jsonb_to_recordset(${t.json(r)}::jsonb) as t(path text, collection text, id text, data jsonb)
        on conflict (path) do update set data = excluded.data`), i.length && d.push(t`delete from public.docs where path = any(${i}::text[])`), await Promise.all(d), gt("write");
    }
    async _one(t) {
      return this.sql.begin((a) => this._applyAll(a, [t]));
    }
    /** Reads first, writes buffered and applied atomically (retried on deadlock / serialization failure like Firestore). */
    async runTransaction(t) {
      for (let a = 0; ; a++)
        try {
          return await this.sql.begin(async (n) => {
            gt("txopen");
            let s = [], o = {
              get: async (i) => i instanceof Ut ? new Pt(i, await this._lockRead(n, i.path)) : typeof i._exec == "function" ? i._exec(n) : i.get(),
              getAll: async (...i) => Promise.all(i.map(async (d) => new Pt(d, await this._lockRead(n, d.path)))),
              set: (i, d, c = {}) => (s.push({ type: "set", path: i.path, data: d, merge: !!c.merge }), o),
              update: (i, d) => (s.push({ type: "update", path: i.path, data: d }), o),
              create: (i, d) => (s.push({ type: "create", path: i.path, data: d }), o),
              delete: (i) => (s.push({ type: "delete", path: i.path }), o)
            }, r = await t(o);
            return gt("fn"), await this._applyAll(n, s), gt("applied"), r;
          });
        } catch (n) {
          if ((n.code === "40P01" || n.code === "40001") && a < 4) {
            await new Promise((s) => setTimeout(s, 30 * (a + 1) + Math.random() * 40));
            continue;
          }
          throw n;
        }
    }
  }, Ut = class {
    constructor(t, a) {
      this.db = t, this.path = a, this.id = a.split("/").pop();
    }
    async get() {
      let t = await this.db.sql`select data from public.docs where path = ${this.path}`;
      return new Pt(this, t.length ? t[0].data : void 0);
    }
    /** Plain overwrite = one atomic upsert statement (1 round trip, no transaction). */
    async set(t, a = {}) {
      if (a.merge) return this.db._one({ type: "set", path: this.path, data: t, merge: !0 });
      let { collection: n, id: s } = En(this.path);
      await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${n}, ${s}, ${this.db.sql.json(yt({}, Ke(t)))}::jsonb)
                      on conflict (path) do update set data = excluded.data`;
    }
    update(t) {
      return this.db._one({ type: "update", path: this.path, data: t });
    }
    /** create = one `insert … on conflict do nothing` (1 round trip); no row back → ALREADY_EXISTS. */
    async create(t) {
      let { collection: a, id: n } = En(this.path), s = await this.db.sql`insert into public.docs (path, collection, id, data) values (${this.path}, ${a}, ${n}, ${this.db.sql.json(yt({}, Ke(t)))}::jsonb)
                                on conflict (path) do nothing returning path`;
      if (gt("create"), !s.length) throw Ys(this.path);
    }
    delete() {
      return this.db._one({ type: "delete", path: this.path });
    }
    collection(t) {
      return new Ua(this.db, `${this.path}/${t}`);
    }
  }, Mn = class e {
    constructor(t, a, n = [], s = [], o = null, r = null) {
      Object.assign(this, { db: t, path: a, f: n, o: s, lim: o, after: r });
    }
    where(t, a, n) {
      return new e(this.db, this.path, [...this.f, [t, a, Ke(n)]], this.o, this.lim, this.after);
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
      let n = (await t`select * from public.fs_query(${this.path}::text, ${t.json(this.f)}::jsonb, ${t.json(this.o)}::jsonb, ${this.lim}::int, ${this.after ? this.after.ref.path : null}::text)`).map((s) => new Pt(new Ut(this.db, s.path), s.data));
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
  }, Ua = class extends Mn {
    constructor(t, a) {
      super(t, a);
    }
    doc(t) {
      return new Ut(this.db, `${this.path}/${t || Yi.randomBytes(10).toString("hex")}`);
    }
    async add(t) {
      let a = this.doc();
      return await a.set(t), a;
    }
  };
  Js.exports = { PgDb: Rn, FieldValue: Ji, AggregateField: Xi, revive: Oa, plain: Ke, merge: yt, setPath: Vs };
});

// supa/runtime.js
var bt = E((Fu, Xs) => {
  "use strict";
  var Ve = { sql: null, db: null, env: {}, fetch: (...e) => fetch(...e) };
  Ve.configure = ({ sql: e, env: t, fetch: a }) => {
    let { PgDb: n } = ta();
    return Ve.sql = e, Ve.db = new n(e), Ve.env = t || {}, globalThis.__ENV = Ve.env, a && (Ve.fetch = a), Ve;
  };
  Ve.requireVerified = () => String(Ve.env.REQUIRE_VERIFIED || "0") === "1";
  Xs.exports = Ve;
});

// supa/shims/functions-https.js
var ee = E((Hu, Zs) => {
  "use strict";
  var On = class extends Error {
    constructor(t, a, n) {
      super(a), this.code = t, this.details = n, this.name = "HttpsError";
    }
  }, ec = (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "call", a;
  }, tc = (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "request", a;
  };
  Zs.exports = { HttpsError: On, onCall: ec, onRequest: tc };
});

// supa/shims/functions-v1.js
var to = E((Wu, eo) => {
  "use strict";
  var Qs = () => {
    let e = () => {
    };
    return e.__kind = "trigger", e;
  };
  eo.exports = { region: () => ({ auth: { user: () => ({ onCreate: Qs, onDelete: Qs }) } }) };
});

// supa/shims/firebase-admin.js
var co = E((zu, Pn) => {
  "use strict";
  var X = bt(), { FieldValue: oo, AggregateField: ac } = ta(), ro = () => X.db;
  ro.FieldValue = oo;
  var nc = new Proxy(ro, { get: (e, t) => t === "FieldValue" ? oo : t === "AggregateField" ? ac : X.db[t] && typeof X.db[t] == "function" ? X.db[t].bind(X.db) : e[t] }), ao = (e) => e && {
    uid: e.id,
    email: e.email || "",
    emailVerified: !!e.email_confirmed_at || !X.requireVerified(),
    displayName: e.raw_user_meta_data && (e.raw_user_meta_data.displayName || e.raw_user_meta_data.name) || "",
    disabled: !!e.banned_until && new Date(e.banned_until).getTime() > Date.now(),
    customClaims: e.raw_app_meta_data || {}
  }, no = (e) => {
    let t = new Error(e || "There is no user record");
    return t.code = "auth/user-not-found", t;
  }, sc = {
    async getUser(e) {
      let t = await X.sql`select * from auth.users where id = ${e}::uuid`;
      if (!t.length) throw no();
      return ao(t[0]);
    },
    async getUserByEmail(e) {
      let t = await X.sql`select * from auth.users where lower(email) = lower(${e}) limit 1`;
      if (!t.length) throw no();
      return ao(t[0]);
    },
    async updateUser(e, t) {
      t.displayName !== void 0 && await X.sql`update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || ${X.sql.json({ displayName: t.displayName })}::jsonb where id = ${e}::uuid`, t.disabled !== void 0 && (await X.sql`update auth.users set banned_until = case when ${!!t.disabled}::boolean then 'infinity'::timestamptz else null end where id = ${e}::uuid`, X.tokenCache && X.tokenCache.clear());
    },
    async setCustomUserClaims(e, t) {
      await X.sql`update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || ${X.sql.json(t)}::jsonb where id = ${e}::uuid`;
    },
    /** Kills every session of the user: their refresh tokens stop working and the access token is rejected on the next call. */
    async revokeRefreshTokens(e) {
      await X.sql`delete from auth.sessions where user_id = ${e}::uuid`, X.tokenCache && X.tokenCache.clear();
    }
  }, so = (e) => e.startsWith("deposits/") ? { bucket: "deposits", name: e.slice(9) } : { bucket: "pub", name: e }, oc = () => ({
    bucket: () => ({
      file: (e) => ({
        async exists() {
          let t = so(e);
          return [(await X.sql`select 1 from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`).length > 0];
        },
        async getMetadata() {
          let t = so(e), a = await X.sql`select metadata from storage.objects where bucket_id = ${t.bucket} and name = ${t.name}`, n = a[0] && a[0].metadata || {};
          return [{ contentType: n.mimetype || n.contentType || "", size: Number(n.size) || 0 }];
        }
      })
    })
  }), rc = () => ({ sendEachForMulticast: async () => ({ responses: [] }) }), io = { apps: [1], initializeApp() {
  }, firestore: nc, auth: () => sc, storage: oc, messaging: rc };
  Pn.exports = io;
  Pn.exports.default = io;
});

// src/staffperm.js
var aa = E((Ku, lo) => {
  "use strict";
  var Bn = {
    deposits: ["reviewDeposit", "markDepositProcessing", "refundDeposit", "adminTrxSearch", "paymentAccountHistory"],
    withdraws: ["reviewWithdrawal", "saveWithdrawSettings", "payoutAssign", "payoutAutoAssign", "payoutUnassign", "payoutReview", "payoutAgents", "payoutReport", "adminTrxSearch"],
    trx: ["adminTrxSearch"],
    books: ["adminBooks", "adminBookDay", "adminBooksUsers", "adminReconcile", "adminUserOverview"],
    users: ["adminUserOverview", "setUserStatus", "adminSignOutUser", "adminForceLogout"],
    balance: ["adminAdjustBalance"],
    payments: ["paymentAccountAction", "paymentAccountHistory"],
    support: ["adminSupportList", "adminSupportThread", "adminSupportReply", "adminSupportClose", "adminUserOverview"],
    notify: ["adminNotify"],
    lottery: ["adminDrawLottery", "adminCancelLottery"],
    bonus: [],
    content: [],
    games: ["adminSyncGames", "adminAgGameRecords"],
    archive: ["adminArchiveStatus", "adminArchiveDay", "adminArchiveDownload", "adminArchiveSearch", "adminBackups"]
  }, uo = Object.keys(Bn), Un = {};
  for (let [e, t] of Object.entries(Bn)) for (let a of t) (Un[a] = Un[a] || []).push(e);
  var Ln = (e) => e && Array.isArray(e.lim) ? e.lim.filter((t) => uo.includes(t)) : [];
  function ic(e, t) {
    let a = Un[t];
    if (!a) return !1;
    let n = Ln(e);
    return a.some((s) => n.includes(s));
  }
  function cc(e, t) {
    let a = Ln(e), n = String(t).split("/"), s = (...o) => o.some((r) => a.includes(r));
    return n[0] === "paymentMethods" || n[0] === "paymentAccounts" ? s("payments") : n[0] === "banners" || n[0] === "legal" ? s("content") : n[0] === "bonuses" ? s("bonus") : n[0] === "lotteries" ? s("lottery") : n[0] === "games" ? s("games") : n[0] === "settings" && /^ban_/.test(n[1] || "") ? s("content") : n[0] === "settings" && n[1] === "support" ? s("support") : n[0] === "settings" && n[1] === "content" ? s("content", "support", "games") : !1;
  }
  lo.exports = { APPS: Bn, KEYS: uo, staffMay: ic, staffMayWrite: cc, limOf: Ln };
});

// src/util.js
var z = E((Vu, po) => {
  "use strict";
  var na = co(), { HttpsError: ct } = ee();
  na.apps.length || na.initializeApp();
  var Bt = na.firestore(), Lt = na.firestore.FieldValue, dc = "asia-south1", mo = ["main", "winning", "referral", "commission"], uc = ["super", "finance", "support", "content", "payout", "staff"], it = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, At = (e) => new ct("invalid-argument", e);
  function qn(e) {
    if (!e.auth) throw new ct("unauthenticated", "Please sign in.");
    return e.auth.uid;
  }
  function lc(e) {
    let t = qn(e);
    if (!e.auth.token.email_verified) throw new ct("failed-precondition", "Please verify your email first.");
    return t;
  }
  function mc(e, t) {
    let a = qn(e), n = e.auth.token;
    if (n.admin === !0 && n.role === "staff" && t.some((s) => s !== "payout") && aa().staffMay(n, e.fn)) return a;
    if (n.admin !== !0 || !t.includes(n.role)) throw new ct("permission-denied", "You do not have permission.");
    return a;
  }
  function pc(e, { min: t = 0.01, max: a = 1e9, label: n = "Amount" } = {}) {
    let s = Number(e);
    if (!Number.isFinite(s)) throw At(`${n} must be a number.`);
    if (s < t) throw At(`${n} must be at least ${t}.`);
    if (s > a) throw At(`${n} must be at most ${a}.`);
    return it(s);
  }
  function fc(e, { min: t = 1, max: a = 200, label: n = "Value", pattern: s = null } = {}) {
    if (typeof e != "string") throw At(`${n} is required.`);
    let o = e.trim();
    if (o.length < t || o.length > a) throw At(`${n} must be ${t}-${a} characters.`);
    if (s && !s.test(o)) throw At(`${n} has an invalid format.`);
    return o;
  }
  function hc(e) {
    if (!e) throw new ct("not-found", "User profile not found.");
    if (e.status !== "active") throw new ct("permission-denied", "This account is not active.");
  }
  function wc(e, t, a = ["main", "winning"]) {
    let n = it(t);
    if (it(a.reduce((r, i) => r + (Number(e?.[i]) || 0), 0)) < n) throw new ct("failed-precondition", "Insufficient balance.");
    let o = {};
    for (let r of a) {
      let i = Math.min(Number(e?.[r]) || 0, n);
      if (i > 0 && (o[r] = it(i), n = it(n - i)), n <= 0) break;
    }
    return o;
  }
  function gc(e, t, a) {
    let n = {};
    for (let [s, o] of Object.entries(a)) {
      if (!mo.includes(s)) throw new Error("bad bucket " + s);
      n[`balances.${s}`] = Lt.increment(it(o));
    }
    e.update(t, n);
  }
  function yc(e, { uid: t, type: a, direction: n, amount: s, bucket: o = "main", note: r = "", ref: i = "" }) {
    e.set(Bt.collection("transactions").doc(), {
      uid: t,
      type: a,
      direction: n,
      amount: it(s),
      bucket: o,
      note: r,
      ref: i,
      createdAt: Lt.serverTimestamp()
    });
  }
  function bc(e, t, a, n, s = "info") {
    e.set(Bt.collection("users").doc(t).collection("notifications").doc(), {
      title: a,
      body: n,
      type: s,
      read: !1,
      createdAt: Lt.serverTimestamp()
    });
  }
  function Ac(e, t) {
    let a = {};
    for (let [n, s] of Object.entries(t)) a[n] = Lt.increment(s);
    e.set(Bt.doc("stats/global"), a, { merge: !0 });
  }
  function kc(e, t, a, n = {}) {
    let s = Bt.collection("auditLogs").doc(), o = { actorUid: t, action: a, detail: n, at: Lt.serverTimestamp() };
    e ? e.set(s, o) : s.set(o);
  }
  async function Sc() {
    let e = await Bt.doc("settings/site").get();
    return e.exists ? e.data() : {};
  }
  po.exports = {
    admin: na,
    db: Bt,
    FieldValue: Lt,
    HttpsError: ct,
    REGION: dc,
    BUCKETS: mo,
    STAFF_ROLES: uc,
    round2: it,
    bad: At,
    authUid: qn,
    requireVerified: lc,
    requireRole: mc,
    amountOf: pc,
    str: fc,
    assertActive: hc,
    planDebit: wc,
    applyDelta: gc,
    ledger: yc,
    notify: bc,
    bumpStats: Ac,
    audit: kc,
    siteSettings: Sc
  };
});

// src/auth.js
var wo = E((sa) => {
  "use strict";
  var vc = to(), { onCall: ho } = ee(), ue = z(), { db: Ie, admin: xn, FieldValue: kt, HttpsError: jn, REGION: Gn } = ue, fo = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", Tc = () => Array.from({ length: 8 }, () => fo[Se("crypto").randomInt(0, fo.length)]).join("");
  async function Ba(e, t = "", a = "") {
    let n = Ie.doc(`users/${e}`);
    if ((await n.get()).exists) return;
    let s = null;
    for (let o = 0; o < 8 && !s; o++) {
      let r = Tc();
      try {
        await Ie.doc(`referralCodes/${r}`).create({ uid: e }), s = r;
      } catch (i) {
        if (i.code !== 6 && !/ALREADY_EXISTS/.test(String(i))) throw i;
      }
    }
    if (!s) throw new jn("internal", "Could not allocate referral code.");
    await Ie.runTransaction(async (o) => {
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
        createdAt: kt.serverTimestamp(),
        lastLoginAt: null,
        lastSeenAt: null
      }), ue.bumpStats(o, { totalUsers: 1 }));
    });
  }
  sa.onAuthCreate = vc.region(Gn).auth.user().onCreate((e) => Ba(e.uid, e.email || "", e.displayName || ""));
  sa.completeRegistration = ho({ region: Gn }, async (e) => {
    let t = ue.authUid(e), a = e.data || {}, n = ue.str(a.name, { min: 2, max: 60, label: "Name" }), s = ue.str(a.username, { min: 3, max: 20, label: "Username", pattern: /^[A-Za-z0-9_]+$/ }).toLowerCase(), o = ue.str(a.phone, { min: 8, max: 16, label: "Phone", pattern: /^\+?[0-9]{8,15}$/ }), r = typeof a.referralCode == "string" ? a.referralCode.trim().toUpperCase() : "", i = await xn.auth().getUser(t);
    await Ba(t, i.email || "", n);
    let d = "";
    if (r) {
      let c = await Ie.doc(`referralCodes/${r}`).get();
      if (!c.exists) throw ue.bad("Referral code not found.");
      if (c.data().uid === t) throw ue.bad("You cannot use your own referral code.");
      d = c.data().uid;
    }
    return await Ie.runTransaction(async (c) => {
      let l = Ie.doc(`users/${t}`);
      if ((await c.get(l)).data().profileComplete) return;
      let m = Ie.doc(`usernames/${s}`);
      if ((await c.get(m)).exists) throw new jn("already-exists", "Username is already taken.");
      c.set(m, { uid: t }), c.update(l, { name: n, username: s, phone: o, referredBy: d, profileComplete: !0 });
    }), await xn.auth().updateUser(t, { displayName: n }), { ok: !0 };
  });
  sa.bootstrap = ho({ region: Gn }, async (e) => {
    let t = ue.authUid(e), a = await xn.auth().getUser(t);
    await Ba(t, a.email || "", a.displayName || "");
    let n = Ie.doc(`users/${t}`), s = await ue.siteSettings(), o = ue.round2(Number(s.welcomeBonus) || 0), r = ue.round2(Number(s.referral?.signupReward) || 0);
    if ((await Ie.runTransaction(async (c) => {
      let u = (await c.get(n)).data();
      if (u.status !== "active") return { banned: !0 };
      let m = a.emailVerified && u.profileComplete && !u.signupRewardsGiven, p = null;
      m && u.referredBy && r > 0 && (p = await c.get(Ie.doc(`users/${u.referredBy}`)));
      let f = { lastLoginAt: kt.serverTimestamp(), lastSeenAt: kt.serverTimestamp() };
      if (m && (f.signupRewardsGiven = !0, o > 0 && (f["balances.main"] = kt.increment(o), ue.ledger(c, { uid: t, type: "bonus", direction: "in", amount: o, bucket: "main", note: "Welcome bonus" }), ue.notify(c, t, "Welcome!", `${o} welcome bonus has been added to your wallet.`, "bonus")), p && p.exists && p.data().status === "active")) {
        let h = u.referredBy;
        c.update(Ie.doc(`users/${h}`), { "balances.referral": kt.increment(r) }), ue.ledger(c, { uid: h, type: "referral", direction: "in", amount: r, bucket: "referral", note: `Referral: ${u.username}` }), ue.notify(c, h, "New referral", `${u.username} joined with your code. +${r}`, "referral"), c.set(Ie.doc(`referrals/${t}`), {
          referrerUid: h,
          referredUid: t,
          referredName: u.username,
          rewardAmount: r,
          commissionTotal: 0,
          createdAt: kt.serverTimestamp()
        }), ue.bumpStats(c, { totalReferrals: 1 });
      }
      return c.update(n, f), { banned: !1 };
    })).banned) throw new jn("permission-denied", "This account is banned.");
    let d = (e.rawRequest?.headers?.["x-forwarded-for"] || e.rawRequest?.ip || "").toString().split(",")[0].trim();
    return await Ie.collection("loginHistory").add({
      uid: t,
      at: kt.serverTimestamp(),
      ip: d,
      ua: (e.rawRequest?.headers?.["user-agent"] || "").toString().slice(0, 300)
    }), { ok: !0, emailVerified: a.emailVerified };
  });
  sa.ensureUserDoc = Ba;
});

// src/payrot.js
var Wn = E((Ju, ko) => {
  "use strict";
  var St = z(), { db: oa } = St, yo = 864e5, _c = 25e3, bo = 30, B = (e) => Number.isFinite(Number(e)) ? Number(e) : 0, Fn = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 10), vt = (e) => B(e.cycleLimit) > 0, La = (e) => B(e.cycleReceived), Hn = (e) => B(e.cycleReserved), Ao = (e) => vt(e) ? Math.max(0, St.round2(B(e.cycleLimit) - La(e) - Hn(e))) : 1 / 0, go = (e, t) => B(e.priority) - B(t.priority) || B(e.lastActivatedAt) - B(t.lastActivatedAt) || B(e.createdAt) - B(t.createdAt) || String(e.id).localeCompare(String(t.id));
  function $c(e, t = {}) {
    return {
      accountId: e.id,
      methodId: e.methodId,
      cycleNo: B(e.cycleNo) || 1,
      receivedAmount: La(e),
      limit: B(e.cycleLimit),
      activatedAt: B(e.lastActivatedAt),
      limitReachedAt: B(e.limitReachedAt),
      cooldownStartedAt: B(e.cooldownStartedAt),
      cooldownEndsAt: B(e.cooldownUntil),
      ...t
    };
  }
  async function Cc(e, t, a = {}) {
    let n = a.now || Date.now(), s = Math.max(1, B(a.min) || 1), o = await e.get(oa.doc(`paymentMethods/${t}`)), r = await e.get(oa.collection("paymentAccounts").where("methodId", "==", t)), i = o.exists ? o.data() : null, d = !i || i.autoRotation !== !1, l = (r.docs.length ? await e.getAll(...r.docs.map((g) => g.ref)) : []).filter((g) => g.exists).map((g) => ({ id: g.id, ref: g.ref, ...g.data() })), u = /* @__PURE__ */ new Map(), m = [], p = (g) => l.find((b) => b.id === g), f = (g, b) => {
      Object.assign(g, b), u.set(g.id, { ...u.get(g.id) || {}, ...b });
    }, h = (g, b) => {
      e.set(oa.doc(`paymentCycles/${g.id}_${B(g.cycleNo) || 1}`), $c(g, { endReason: b, closedAt: n }), { merge: !0 });
    }, y = a.settle;
    if (y) {
      let g = p(y.accountId);
      if (g) {
        let b = {};
        vt(g) && (b.cycleReserved = Math.max(0, St.round2(Hn(g) - y.amount)), y.outcome === "approve" && (b.cycleReceived = St.round2(La(g) + y.amount))), y.outcome === "release" && (g.usedTodayKey === Fn(n) && (b.usedToday = Math.max(0, St.round2(B(g.usedToday) - y.amount))), g.usedMonthKey === Fn(n).slice(0, 7) && (b.usedMonth = Math.max(0, St.round2(B(g.usedMonth) - y.amount))), b.totalCollected = Math.max(0, St.round2(B(g.totalCollected) - y.amount)), b.totalDeposits = Math.max(0, B(g.totalDeposits) - 1)), f(g, b);
      }
    }
    let w = a.force || {};
    if (w.reset) {
      let g = p(w.reset);
      g && (h(g, "manual_reset"), f(g, { cycleReceived: 0, cycleNo: (B(g.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0, ...g.status === "cooldown" ? { status: "standby" } : {} }));
    }
    if (w.pause) {
      let g = p(w.pause);
      g && f(g, { status: "paused" });
    }
    if (w.resume) {
      let g = p(w.resume);
      g && g.status === "paused" && f(g, { status: "standby" });
    }
    if (w.activate) {
      let g = p(w.activate);
      if (g) {
        for (let b of l) b.id !== g.id && b.status === "active" && vt(b) && d && f(b, { status: "standby" });
        f(g, { status: "active", lastActivatedAt: n, cooldownStartedAt: 0, cooldownUntil: 0, limitReachedAt: 0 }), m.push({ old: "", next: g.id, reason: "manual" });
      }
    }
    for (let g of l)
      vt(g) && g.status === "cooldown" && B(g.cooldownUntil) && B(g.cooldownUntil) <= n && (e.set(oa.doc(`paymentCycles/${g.id}_${B(g.cycleNo) || 1}`), { completedAt: n, endReason: "cooldown_ended" }, { merge: !0 }), f(g, { status: "standby", cycleReceived: 0, cycleNo: (B(g.cycleNo) || 1) + 1, limitReachedAt: 0, cooldownStartedAt: 0, cooldownUntil: 0 }));
    let v = "", S = "";
    if (d) {
      for (let k of l)
        if (vt(k) && k.status === "active" && (v = v || k.id, B(k.cycleLimit) - La(k) < s && Hn(k) <= 0)) {
          let $ = B(k.cooldownDays) > 0 ? B(k.cooldownDays) : bo;
          f(k, { status: "cooldown", limitReachedAt: n, cooldownStartedAt: n, cooldownUntil: n + $ * yo }), h(k, "limit_reached"), S = S || k.id;
        }
      let g = l.filter(vt), b = g.filter((k) => k.status === "active").sort((k, $) => B($.lastActivatedAt) - B(k.lastActivatedAt) || go(k, $));
      for (let k of b.slice(1)) f(k, { status: "standby" });
      if (!b.length) {
        let k = g.filter(($) => $.status === "standby" && Ao($) >= s).sort(go)[0];
        k ? (f(k, { status: "active", lastActivatedAt: n }), m.push({ old: S || v, next: k.id, reason: S ? "limit_reached" : a.reason || "no_active" })) : S && m.push({ old: S, next: "", reason: "limit_reached_no_standby" });
      }
    }
    for (let [g, b] of u) e.update(p(g).ref, { ...b, updatedAt: n });
    for (let g of m)
      !g.next && !g.old || e.set(oa.collection("paymentRotationLogs").doc(), { methodId: t, oldAccountId: g.old || "", newAccountId: g.next || "", reason: g.reason, at: n });
    return { changed: [...u.keys()], activated: (m.find((g) => g.next) || {}).next || null, accounts: l };
  }
  ko.exports = { rotateTx: Cc, cycleOn: vt, room: Ao, n0: B, dayKey: Fn, DAY: yo, DEFAULT_LIMIT: _c, DEFAULT_COOLDOWN_DAYS: bo };
});

// src/storage.js
var ca = E((ja, Io) => {
  "use strict";
  var { onCall: Vn } = ee(), De = z(), { HttpsError: Tt, REGION: Yn } = De, Nc = () => globalThis.__ENV || process.env, So = () => {
    let e = Nc(), a = { endpoint: String(e.S3_ENDPOINT || "").replace(/\/+$/, ""), bucket: String(e.S3_BUCKET || ""), key: String(e.S3_ACCESS_KEY_ID || ""), secret: String(e.S3_SECRET_ACCESS_KEY || ""), region: String(e.S3_REGION || "auto") };
    return a.ok = !!(a.endpoint && /^https:\/\//.test(a.endpoint) && a.bucket && a.key && a.secret), a;
  }, Jn = () => So().ok, zn = new TextEncoder(), vo = (e) => [...new Uint8Array(e)].map((t) => t.toString(16).padStart(2, "0")).join(""), Kn = () => globalThis.crypto && globalThis.crypto.subtle || Se("node:crypto").webcrypto.subtle, Ic = async (e) => vo(await Kn().digest("SHA-256", zn.encode(e))), ra = async (e, t) => {
    let a = await Kn().importKey("raw", typeof e == "string" ? zn.encode(e) : e, { name: "HMAC", hash: "SHA-256" }, !1, ["sign"]);
    return Kn().sign("HMAC", a, zn.encode(t));
  }, qa = (e) => encodeURIComponent(e).replace(/[!'()*]/g, (t) => "%" + t.charCodeAt(0).toString(16).toUpperCase());
  async function ia(e, t, { expires: a = 300, contentType: n = "", now: s = Date.now() } = {}) {
    let o = So();
    if (!o.ok) throw new Tt("failed-precondition", "File storage is not set up yet.");
    let r = new URL(o.endpoint), i = r.host, c = `${r.pathname.replace(/\/+$/, "")}/${qa(o.bucket)}/${t.split("/").map(qa).join("/")}`, l = new Date(s).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), u = l.slice(0, 8), m = `${u}/${o.region}/s3/aws4_request`, p = n ? "content-type;host" : "host", f = { "X-Amz-Algorithm": "AWS4-HMAC-SHA256", "X-Amz-Credential": `${o.key}/${m}`, "X-Amz-Date": l, "X-Amz-Expires": String(a), "X-Amz-SignedHeaders": p }, h = Object.keys(f).sort().map((b) => `${qa(b)}=${qa(f[b])}`).join("&"), y = (n ? `content-type:${n}
` : "") + `host:${i}
`, w = [e, c, h, y, p, "UNSIGNED-PAYLOAD"].join(`
`), v = ["AWS4-HMAC-SHA256", l, m, await Ic(w)].join(`
`), S = await ra("AWS4" + o.secret, u);
    S = await ra(S, o.region), S = await ra(S, "s3"), S = await ra(S, "aws4_request");
    let g = vo(await ra(S, v));
    return `${r.protocol}//${i}${c}?${h}&X-Amz-Signature=${g}`;
  }
  var To = (...e) => (De.storageFetch || globalThis.fetch)(...e);
  async function _o(e) {
    let t = await To(await ia("HEAD", e, { expires: 60 }), { method: "HEAD" });
    if (t.status === 404) return { exists: !1 };
    if (!t.ok) throw new Tt("unavailable", "File storage did not answer. Please try again.");
    let a = (n) => (t.headers && t.headers.get ? t.headers.get(n) : "") || "";
    return { exists: !0, contentType: a("content-type"), size: Number(a("content-length")) || 0 };
  }
  async function $o(e) {
    try {
      await To(await ia("DELETE", e, { expires: 60 }), { method: "DELETE" });
    } catch {
    }
  }
  var Xn = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }, xa = 3 * 1024 * 1024, Co = (e) => typeof e == "string" && e.length <= 220 && /^[A-Za-z0-9_\-/.]+$/.test(e) && !e.includes("..") && !e.startsWith("/");
  async function Dc(e) {
    let t = await _o(e);
    if (!t.exists) throw new Tt("failed-precondition", "The screenshot upload was not found. Please upload again.");
    if (!Xn[String(t.contentType).split(";")[0]] || t.size > xa)
      throw await $o(e), De.bad("Screenshot must be a JPG/PNG/WEBP image under 3 MB.");
    return t;
  }
  var No = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  };
  async function Ec(e, t) {
    let a = De.authUid(e), n = No(e), s = t.split("/");
    if (s[0] === "deposits") return s[1] === a || ["super", "finance", "support"].includes(n);
    if (s[0] === "payouts") {
      if (["super", "finance"].includes(n)) return !0;
      if (n === "payout") {
        let o = await De.db.doc(`withdrawals/${s[1]}`).get();
        return o.exists && o.data().assignedTo === a;
      }
      return !1;
    }
    return s[0] === "staff" ? !!n && n !== "payout" : !1;
  }
  ja.storageStatus = Vn({ region: Yn }, async (e) => (De.authUid(e), { configured: Jn(), maxBytes: xa, types: Object.keys(Xn) }));
  ja.storageUploadUrl = Vn({ region: Yn }, async (e) => {
    let t = De.authUid(e), a = e.data || {}, n = No(e);
    if (!Jn()) throw new Tt("failed-precondition", "File storage is not set up yet.");
    let s = String(a.contentType || ""), o = Xn[s];
    if (!o) throw De.bad("Only JPG, PNG or WEBP images.");
    let r = Number(a.size) || 0;
    if (r <= 0 || r > xa) throw De.bad("Image must be under 3 MB.");
    let i = Math.random().toString(36).slice(2, 10), d = Date.now(), c;
    if (a.kind === "deposit") c = `deposits/${t}/${d}-${i}.${o}`;
    else if (a.kind === "payout") {
      let l = De.str(a.withdrawalId, { max: 80, label: "Withdrawal" }), u = await De.db.doc(`withdrawals/${l}`).get();
      if (!u.exists || u.data().assignedTo !== t || u.data().status !== "pending") throw new Tt("permission-denied", "This task is not assigned to you.");
      c = `payouts/${l}/${t}-${d}-${i}.${o}`;
    } else if (a.kind === "staff") {
      if (!n || n === "payout") throw new Tt("permission-denied", "Staff only.");
      c = `staff/${t}/${d}-${i}.${o}`;
    } else throw De.bad("Unknown upload type.");
    return { url: await ia("PUT", c, { expires: 300, contentType: s }), key: c, contentType: s, expiresIn: 300 };
  });
  ja.storageViewUrl = Vn({ region: Yn }, async (e) => {
    let t = e.data && e.data.key;
    if (!Co(t)) throw De.bad("Invalid file.");
    if (!await Ec(e, t)) throw new Tt("permission-denied", "You cannot view this file.");
    return { url: await ia("GET", t, { expires: 300 }), expiresIn: 300 };
  });
  Io.exports.helpers = { presign: ia, headObject: _o, deleteObject: $o, verifyImage: Dc, configured: Jn, safeKey: Co, MAX_BYTES: xa };
});

// src/wdcore.js
var Zn = E((Xu, Do) => {
  "use strict";
  var dt = z(), { db: Rc, FieldValue: Mc } = dt, ut = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  function Oc(e = Date.now()) {
    let t = new Date(e + 216e5);
    return t.setUTCHours(0, 0, 0, 0), new Date(t.getTime() - 6 * 36e5);
  }
  function Pc(e) {
    let t = e && e.withdraw || {};
    return {
      enabled: t.enabled !== !1,
      min: ut(t.min),
      max: ut(t.max),
      feePct: ut(t.feePct),
      feeFlat: ut(t.feeFlat),
      allowedBuckets: Array.isArray(t.allowedBuckets) && t.allowedBuckets.length ? t.allowedBuckets : ["winning", "referral", "commission"],
      dailyLimit: ut(t.dailyLimit),
      dailyCount: ut(t.dailyCount),
      maxPending: ut(t.maxPending) || 3,
      processingText: typeof t.processingText == "string" ? t.processingText : "",
      notice: typeof t.notice == "string" ? t.notice : ""
    };
  }
  function Uc(e, t, a, n, s, o, r = {}) {
    e.update(t, { status: n ? "approved" : "rejected", stage: n ? "done" : "rejected", note: o, reviewedAt: Mc.serverTimestamp(), reviewedBy: s, ...r }), n ? (dt.notify(e, a.uid, "Withdrawal approved", `${a.net} has been sent to ${a.accountNumber}.`, "withdraw"), dt.ledger(e, { uid: a.uid, type: "withdraw", direction: "out", amount: 0, bucket: a.bucket, note: `Paid ${a.net} (fee ${a.fee})`, ref: t.id }), dt.bumpStats(e, { totalWithdrawals: a.amount, feesCollected: a.fee, withdrawCount: 1, pendingWithdrawals: -1 })) : (dt.applyDelta(e, Rc.doc(`users/${a.uid}`), a.plan && Object.keys(a.plan).length ? a.plan : { [a.bucket]: a.amount }), dt.ledger(e, { uid: a.uid, type: "withdraw_refund", direction: "in", amount: a.amount, bucket: a.bucket, note: "Withdrawal rejected", ref: t.id }), dt.notify(e, a.uid, "Withdrawal rejected", o || "Your withdrawal was rejected and the amount was returned.", "withdraw"), dt.bumpStats(e, { pendingWithdrawals: -1 }));
  }
  Do.exports = { n0: ut, startOfDhakaDay: Oc, withdrawSettings: Pc, finalize: Uc };
});

// src/wallet.js
var Mo = E((lt) => {
  "use strict";
  var { onCall: _t } = ee(), A = z(), { db: P, admin: Bc, FieldValue: at, HttpsError: K, REGION: $t } = A, Ga = Wn(), Ro = (e, t) => e && e.enabled === !0 && [t, "both"].includes(e.type || "both"), Qn = () => new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10), Eo = () => Qn().slice(0, 7), he = (e) => Number.isFinite(Number(e)) ? Number(e) : 0;
  lt.submitDeposit = _t({ region: $t }, async (e) => {
    let t = A.requireVerified(e), a = e.data || {}, n = A.str(a.methodId, { max: 80, label: "Method" }), s = a.accountId ? A.str(a.accountId, { max: 120, label: "Account" }) : "", o = A.amountOf(a.amount), r = A.str(a.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), i = typeof a.senderNumber == "string" ? a.senderNumber.trim().slice(0, 30) : "", d = typeof a.screenshotPath == "string" ? a.screenshotPath.trim().slice(0, 200) : "";
    if (d) {
      if (!d.startsWith(`deposits/${t}/`) || d.includes("..")) throw A.bad("Invalid screenshot path.");
      let k = ca().helpers;
      if (k.configured() && a.store === "s3") await k.verifyImage(d);
      else {
        let $ = Bc.storage().bucket().file(d), [N] = await $.exists();
        if (!N) throw new K("failed-precondition", "Screenshot upload was not found. Please upload again.");
        let [D] = await $.getMetadata();
        if (!String(D.contentType || "").startsWith("image/")) throw A.bad("Screenshot must be an image.");
      }
    }
    let c = d && a.store === "s3" ? "s3" : "", u = (await A.siteSettings()).deposit || {}, m = he(u.min) || 1, p = he(u.max) || 1e7;
    if (o < m || o > p) throw A.bad(`Amount must be between ${m} and ${p}.`);
    if ((await P.collection("deposits").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= 5) throw new K("resource-exhausted", "Too many pending deposits. Please wait for review.");
    let h = new Date(Date.now() + 6 * 36e5);
    h.setUTCHours(0, 0, 0, 0);
    let y = new Date(h.getTime() - 6 * 36e5), v = (await P.collection("deposits").where("uid", "==", t).where("createdAt", ">=", y).get()).docs.filter((k) => k.data().status !== "rejected").reduce((k, $) => k + he($.data().amount), 0), g = (await P.doc(`users/${t}`).get()).data()?.dupTrx || {};
    if (g.blockedUntil && g.blockedUntil > Date.now()) throw new K("permission-denied", `Deposits are blocked until ${new Date(g.blockedUntil).toISOString().slice(0, 16).replace("T", " ")} UTC because of repeated duplicate transaction IDs.`);
    if ((await P.doc(`trxIndex/${n}_${r}`).get()).exists) {
      let k = g.lastAt && g.lastAt > Date.now() - 864e5 ? (g.count || 0) + 1 : 1, $ = { "dupTrx.count": k, "dupTrx.lastAt": Date.now() };
      throw k >= 2 && ($["dupTrx.blockedUntil"] = Date.now() + 864e5), await P.doc(`users/${t}`).update($), await P.doc("stats/global").set({ duplicateAttempts: at.increment(1) }, { merge: !0 }), A.audit(null, t, "duplicate_trx_attempt", { methodId: n, trxId: r, count: k }), new K("already-exists", k >= 2 ? "This transaction ID was already used. Deposits are blocked for 24 hours." : "This transaction ID was already used. Another attempt will block deposits for 24 hours.");
    }
    let b = P.collection("deposits").doc();
    return await P.runTransaction(async (k) => {
      let $ = [k.get(P.doc(`paymentMethods/${n}`)), k.get(P.doc(`users/${t}`)), k.get(P.doc(`trxIndex/${n}_${r}`))];
      s && $.push(k.get(P.doc(`paymentAccounts/${s}`)));
      let [N, D, J, ie] = await Promise.all($);
      A.assertActive(D.data());
      let Y = N.data();
      if (!N.exists || !Ro(Y, "deposit")) throw A.bad("This payment method is not available.");
      if (Y.minAmount && o < Y.minAmount) throw A.bad(`Minimum for ${Y.name} is ${Y.minAmount}.`);
      if (Y.maxAmount && o > Y.maxAmount) throw A.bad(`Maximum for ${Y.name} is ${Y.maxAmount}.`);
      let ce = D.data().rg || {}, tt = ce.pendingLimitAt && ce.pendingLimitAt <= Date.now() ? he(ce.pendingLimit) : he(ce.dailyDepositLimit);
      if (tt > 0 && v + o > tt) throw new K("failed-precondition", `Your daily deposit limit is ${tt}. Remaining today: ${Math.max(0, A.round2(tt - v))}.`);
      if (J.exists) throw new K("already-exists", "This transaction ID has already been submitted.");
      let Ea = Y.accountNumber || "", Ra = "", Nn = "", Fs = "";
      if (s) {
        let de = ie && ie.exists ? ie.data() : null;
        if (!de || de.status !== "active" || de.methodId !== n) throw new K("failed-precondition", "This payment account is no longer available. Please choose again.");
        let Hs = de.usedTodayKey === Qn() ? he(de.usedToday) : 0, Ws = de.usedMonthKey === Eo() ? he(de.usedMonth) : 0;
        if (Hs + o > he(de.dailyLimit) || Ws + o > he(de.monthlyLimit)) throw new K("failed-precondition", "This account reached its limit. Please choose again.");
        let ji = Ga.cycleOn(de) ? { cycleReserved: A.round2(he(de.cycleReserved) + o) } : {};
        if (Ga.cycleOn(de) && o > Ga.room(de)) throw new K("failed-precondition", "This payment number has reached its limit. Please try again shortly.");
        k.update(ie.ref, {
          usedToday: A.round2(Hs + o),
          usedTodayKey: Qn(),
          usedMonth: A.round2(Ws + o),
          usedMonthKey: Eo(),
          totalDeposits: at.increment(1),
          totalCollected: at.increment(o),
          lastUsedAt: Date.now(),
          ...ji
        }), Ea = de.accountNumber || "", Ra = de.holderName || "", Nn = de.bankName || "", Fs = de.branch || "";
      }
      k.set(P.doc(`trxIndex/${n}_${r}`), { uid: t, depositId: b.id }), k.set(b, {
        uid: t,
        username: D.data().username,
        methodId: n,
        methodName: Y.name,
        accountId: s,
        accountNumber: Ea,
        holderName: Ra,
        ...Nn ? { bankName: Nn, branch: Fs } : {},
        amount: o,
        trxId: r,
        senderNumber: i,
        screenshotPath: d,
        screenshotStore: c,
        status: "pending",
        note: "",
        createdAt: at.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), A.notify(k, t, "Deposit submitted", `${o} is waiting for approval.`, "deposit"), A.bumpStats(k, { pendingDeposits: 1 });
    }), { ok: !0, depositId: b.id };
  });
  lt.reviewDeposit = _t({ region: $t }, async (e) => {
    let t = A.requireRole(e, ["super", "finance"]), a = e.data || {}, n = A.str(a.depositId, { max: 80 }), s = a.action === "approve";
    if (!s && a.action !== "reject") throw A.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "", r = await A.siteSettings(), i = Number(r.referral?.depositCommissionPct) || 0;
    return await P.runTransaction(async (d) => {
      let c = P.doc(`deposits/${n}`), l = await d.get(c);
      if (!l.exists) throw new K("not-found", "Deposit not found.");
      let u = l.data();
      if (u.status !== "pending") throw new K("failed-precondition", `Already ${u.status}.`);
      let m = P.doc(`users/${u.uid}`), p = await d.get(m), f = null, h = null;
      s && i > 0 && p.data().referredBy && (f = await d.get(P.doc(`users/${p.data().referredBy}`)), h = await d.get(P.doc(`referrals/${u.uid}`))), u.accountId && await Ga.rotateTx(d, u.methodId, { now: Date.now(), min: Math.max(1, he((r.deposit || {}).min) || 1), settle: { accountId: u.accountId, amount: u.amount, outcome: s ? "approve" : "release" } });
      let y = { status: s ? "approved" : "rejected", note: o, reviewedAt: at.serverTimestamp(), reviewedBy: t };
      if (d.update(c, y), s) {
        if (A.applyDelta(d, m, { main: u.amount }), A.ledger(d, { uid: u.uid, type: "deposit", direction: "in", amount: u.amount, bucket: "main", note: u.methodName, ref: n }), A.notify(d, u.uid, "Deposit approved", `${u.amount} has been added to your wallet.`, "deposit"), A.bumpStats(d, { totalDeposits: u.amount, depositCount: 1, pendingDeposits: -1 }), f && f.exists && f.data().status === "active") {
          let w = A.round2(u.amount * i / 100);
          w > 0 && (A.applyDelta(d, f.ref, { commission: w }), A.ledger(d, { uid: f.id, type: "commission", direction: "in", amount: w, bucket: "commission", note: `Deposit by ${p.data().username}`, ref: n }), A.notify(d, f.id, "Referral commission", `+${w} from ${p.data().username}'s deposit.`, "referral"), h && h.exists && d.update(h.ref, { commissionTotal: at.increment(w) }), A.bumpStats(d, { commissionPaid: w }));
        }
      } else
        d.delete(P.doc(`trxIndex/${u.methodId}_${u.trxId}`)), A.notify(d, u.uid, "Deposit rejected", o || "Your deposit request was rejected.", "deposit"), A.bumpStats(d, { pendingDeposits: -1 });
      A.audit(d, t, s ? "deposit_approved" : "deposit_rejected", { depositId: n, amount: u.amount, uid: u.uid });
    }), { ok: !0 };
  });
  lt.markDepositProcessing = _t({ region: $t }, async (e) => {
    let t = A.requireRole(e, ["super", "finance"]), a = A.str((e.data || {}).depositId, { max: 80 });
    return await P.runTransaction(async (n) => {
      let s = P.doc(`deposits/${a}`), o = await n.get(s), r = o.exists ? o.data() : null;
      if (!r || r.status !== "pending") throw new K("failed-precondition", "Only a pending deposit can be marked processing.");
      r.stage !== "processing" && (n.update(s, { stage: "processing", processingAt: Date.now(), processingBy: t }), A.notify(n, r.uid, "Deposit processing", `Your deposit of ${r.amount} is being checked.`, "deposit"), A.audit(n, t, "deposit_processing", { depositId: a }));
    }), { ok: !0 };
  });
  lt.refundDeposit = _t({ region: $t }, async (e) => {
    let t = A.requireRole(e, ["super", "finance"]), a = e.data || {}, n = A.str(a.depositId, { max: 80 }), s = A.str(a.note, { min: 3, max: 300, label: "Reason" });
    return await P.runTransaction(async (o) => {
      let r = P.doc(`deposits/${n}`), i = await o.get(r), d = i.exists ? i.data() : null;
      if (!d || d.status !== "approved") throw new K("failed-precondition", "Only an approved deposit can be refunded.");
      let c = P.doc(`users/${d.uid}`), l = await o.get(c), u = he(l.data()?.balances?.main);
      if (u + 1e-9 < he(d.amount)) throw new K("failed-precondition", `The player's main wallet has only ${A.round2(u)} \u2014 they already used part of this deposit.`);
      o.update(r, { status: "refunded", refundNote: s, refundedAt: at.serverTimestamp(), refundedBy: t }), A.applyDelta(o, c, { main: -he(d.amount) }), A.ledger(o, { uid: d.uid, type: "deposit_refund", direction: "out", amount: d.amount, bucket: "main", note: s, ref: n }), A.notify(o, d.uid, "Deposit refunded", `${d.amount} was returned to you. ${s}`, "deposit"), A.bumpStats(o, { totalDeposits: -he(d.amount), depositCount: -1, depositsRefunded: he(d.amount) }), A.audit(o, t, "deposit_refunded", { depositId: n, amount: d.amount, uid: d.uid, note: s });
    }), { ok: !0 };
  });
  var Fa = Zn();
  lt.requestWithdraw = _t({ region: $t }, async (e) => {
    let t = A.requireVerified(e), a = e.data || {}, n = A.str(a.methodId, { max: 80, label: "Method" }), s = a.bucket ? A.str(a.bucket, { max: 20, label: "Wallet" }) : "auto", o = A.amountOf(a.amount), r = A.str(a.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }), i = typeof a.holderName == "string" ? a.holderName.trim().slice(0, 60) : "", d = typeof a.bankName == "string" ? a.bankName.trim().slice(0, 60) : "", c = typeof a.branch == "string" ? a.branch.trim().slice(0, 60) : "", l = await A.siteSettings(), u = Fa.withdrawSettings(l);
    if (!u.enabled) throw new K("failed-precondition", u.notice || "Withdrawals are paused right now. Please try again later.");
    let m = u.allowedBuckets;
    if (s !== "auto" && !m.includes(s)) throw A.bad("This wallet cannot be withdrawn from.");
    let p = A.round2(o * u.feePct / 100 + u.feeFlat);
    if (p >= o) throw A.bad("Amount is too small after fees.");
    if ((await P.collection("withdrawals").where("uid", "==", t).where("status", "==", "pending").count().get()).data().count >= u.maxPending) throw new K("resource-exhausted", `You already have ${u.maxPending} pending withdrawal(s). Please wait until they are processed.`);
    if (u.dailyLimit > 0 || u.dailyCount > 0) {
      let w = (await P.collection("withdrawals").where("uid", "==", t).where("createdAt", ">=", Fa.startOfDhakaDay()).get()).docs.filter((S) => S.data().status !== "rejected"), v = w.reduce((S, g) => S + Fa.n0(g.data().amount), 0);
      if (u.dailyCount > 0 && w.length >= u.dailyCount) throw new K("failed-precondition", `Daily limit reached: ${u.dailyCount} withdrawal(s) per day. Try again tomorrow.`);
      if (u.dailyLimit > 0 && v + o > u.dailyLimit) throw new K("failed-precondition", `Daily withdraw limit is ${u.dailyLimit}. You can withdraw ${Math.max(0, A.round2(u.dailyLimit - v))} more today.`);
    }
    let h = P.collection("withdrawals").doc();
    return await P.runTransaction(async (y) => {
      let w = P.doc(`users/${t}/private/wdCards`), [v, S, g] = await Promise.all([y.get(P.doc(`paymentMethods/${n}`)), y.get(P.doc(`users/${t}`)), y.get(w)]);
      A.assertActive(S.data());
      let b = v.data();
      if (!v.exists || !Ro(b, "withdraw")) throw A.bad("This withdraw method is not available.");
      let k = g.exists && Array.isArray(g.data().list) ? g.data().list : [], $ = k.find((ce) => ce.methodId === n);
      if ($ && b.cardLock === !0 && String($.accountNumber).replace(/\s+/g, "") !== String(r).replace(/\s+/g, ""))
        throw new K("failed-precondition", '\u098F\u0987 \u09AE\u09C7\u09A5\u09A1\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C7\u09AD \u0995\u09B0\u09BE \u0995\u09BE\u09B0\u09CD\u09A1 \u0986\u099B\u09C7\u0964 \u0985\u09A8\u09CD\u09AF \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7 \u09A4\u09C1\u09B2\u09A4\u09C7 \u0995\u09BE\u09B0\u09CD\u09A1 \u09A5\u09C7\u0995\u09C7 "\u09A8\u09AE\u09CD\u09AC\u09B0 \u09AC\u09A6\u09B2\u09BE\u09A8" \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964 (Use the saved card or change its number.)');
      if (!$ && k.length < 6 && y.set(w, { list: [...k, { methodId: n, accountNumber: r, holderName: i, ...d ? { bankName: d, branch: c } : {}, savedAt: Date.now() }], updatedAt: Date.now() }), b.kind === "bank" && (d.length < 2 || c.length < 2 || i.length < 2)) throw A.bad("Bank name, branch and account holder name are required for a bank withdrawal.");
      let N = Math.max(u.min || 0, b.withdrawMin || 0), D = Math.min(u.max || 1 / 0, b.withdrawMax || 1 / 0);
      if (o < N || o > D) throw A.bad(`Amount must be between ${N} and ${D === 1 / 0 ? "\u221E" : D}.`);
      let J = s === "auto" ? m : [s], ie = A.planDebit(S.data().balances, o, J), Y = {};
      for (let [ce, tt] of Object.entries(ie)) Y[ce] = -tt;
      A.applyDelta(y, S.ref, Y), A.ledger(y, { uid: t, type: "withdraw_hold", direction: "out", amount: o, bucket: Object.keys(ie)[0], note: b.name, ref: h.id }), A.notify(y, t, "Withdrawal requested", `${o} is waiting for approval (you receive ${A.round2(o - p)}).`, "withdraw"), y.set(h, {
        uid: t,
        username: S.data().username,
        methodId: n,
        methodName: b.name,
        bucket: Object.keys(ie)[0],
        plan: ie,
        holderName: i,
        accountNumber: r,
        ...d ? { bankName: d, branch: c } : {},
        amount: o,
        fee: p,
        net: A.round2(o - p),
        status: "pending",
        stage: "new",
        note: "",
        createdAt: at.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      }), A.bumpStats(y, { pendingWithdrawals: 1 });
    }), { ok: !0, withdrawalId: h.id, fee: p, net: A.round2(o - p) };
  });
  lt.reviewWithdrawal = _t({ region: $t }, async (e) => {
    let t = A.requireRole(e, ["super", "finance"]), a = e.data || {}, n = A.str(a.withdrawalId, { max: 80 }), s = a.action === "approve";
    if (!s && a.action !== "reject") throw A.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "";
    return await P.runTransaction(async (r) => {
      let i = P.doc(`withdrawals/${n}`), d = await r.get(i);
      if (!d.exists) throw new K("not-found", "Withdrawal not found.");
      let c = d.data();
      if (c.status !== "pending") throw new K("failed-precondition", `Already ${c.status}.`);
      if (c.stage === "paid_review") throw new K("failed-precondition", "An agent already paid this. Review it in Payout Review.");
      if (c.assignedTo && s) throw new K("failed-precondition", "This request is assigned to a payout agent. Unassign it first.");
      c.assignedTo && r.update(P.doc(`payoutAgents/${c.assignedTo}`), { openCount: at.increment(-1) }), Fa.finalize(r, i, c, s, t, o), A.audit(r, t, s ? "withdraw_approved" : "withdraw_rejected", { withdrawalId: n, amount: c.amount, uid: c.uid });
    }), { ok: !0 };
  });
  lt.saveWithdrawSettings = _t({ region: $t }, async (e) => {
    let t = A.requireRole(e, ["super", "finance"]), a = e.data || {}, n = (d, c, l, u) => {
      let m = Number(d);
      if (!Number.isFinite(m) || m < c || m > l) throw A.bad(`${u} must be between ${c} and ${l}.`);
      return A.round2(m);
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
    if (s.max > 0 && s.min > s.max) throw A.bad("Minimum cannot be bigger than maximum.");
    let o = Array.isArray(a.allowedBuckets) ? a.allowedBuckets.filter((d) => ["main", "winning", "referral", "commission"].includes(d)) : null;
    if (o) {
      if (!o.length) throw A.bad("Pick at least one wallet.");
      s.allowedBuckets = o;
    }
    let r = P.doc("settings/site"), i = (await r.get()).data() || {};
    return await r.set({ withdraw: { ...i.withdraw || {}, ...s } }, { merge: !0 }), A.audit(null, t, "withdraw_settings", s), { ok: !0, withdraw: { ...i.withdraw || {}, ...s } };
  });
});

// supa/shims/functions-firestore.js
var Po = E((Qu, Oo) => {
  "use strict";
  Oo.exports = { onDocumentCreated: (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "trigger", a;
  } };
});

// src/admin.js
var Bo = E((qt) => {
  "use strict";
  var { onCall: Ha } = ee(), { onDocumentCreated: Lc } = Po(), q = z(), { db: Be, admin: Ct, FieldValue: qc, HttpsError: Uo, REGION: da } = q;
  qt.adminAdjustBalance = Ha({ region: da }, async (e) => {
    let t = q.requireRole(e, ["super", "finance"]), a = e.data || {}, n = q.str(a.uid, { max: 128 }), s = q.str(a.bucket, { max: 20 });
    if (!q.BUCKETS.includes(s)) throw q.bad("Invalid wallet.");
    let o = q.amountOf(Math.abs(Number(a.delta)), { min: 0.01, max: 1e7, label: "Amount" }) * (Number(a.delta) < 0 ? -1 : 1), r = q.str(a.reason, { min: 3, max: 200, label: "Reason" });
    return await Be.runTransaction(async (i) => {
      let d = Be.doc(`users/${n}`), c = await i.get(d);
      if (!c.exists) throw new Uo("not-found", "User not found.");
      if (q.round2((c.data().balances?.[s] || 0) + o) < 0) throw q.bad("Balance cannot go below zero.");
      q.applyDelta(i, d, { [s]: o }), q.ledger(i, { uid: n, type: "admin_adjust", direction: o > 0 ? "in" : "out", amount: Math.abs(o), bucket: s, note: r }), q.notify(i, n, "Balance updated", `${o > 0 ? "+" : ""}${o} (${r})`, "info"), q.audit(i, t, "balance_adjust", { uid: n, bucket: s, delta: o, reason: r });
    }), { ok: !0 };
  });
  qt.setUserStatus = Ha({ region: da }, async (e) => {
    let t = q.requireRole(e, ["super", "support"]), a = e.data || {}, n = q.str(a.uid, { max: 128 }), s = a.banned === !0, o = typeof a.reason == "string" ? a.reason.trim().slice(0, 200) : "";
    if ((await Ct.auth().getUser(n)).customClaims?.admin) throw new Uo("permission-denied", "Staff accounts cannot be banned here.");
    return await Be.doc(`users/${n}`).update({ status: s ? "banned" : "active", banReason: s ? o : "" }), await Ct.auth().updateUser(n, { disabled: s }), s && await Ct.auth().revokeRefreshTokens(n), q.audit(null, t, s ? "user_banned" : "user_unbanned", { uid: n, reason: o }), { ok: !0 };
  });
  qt.setStaffRole = Ha({ region: da }, async (e) => {
    let t = q.requireRole(e, ["super"]), a = e.data || {}, n = await Ct.auth().getUserByEmail(q.str(a.email, { max: 200, label: "Email" })), s = a.role === null ? null : q.str(a.role, { max: 20 });
    if (s && !q.STAFF_ROLES.includes(s)) throw q.bad("Invalid role.");
    if (n.uid === t && s !== "super") throw q.bad("You cannot demote yourself.");
    let o = aa(), r = s === "staff" ? [...new Set((Array.isArray(a.apps) ? a.apps : []).filter((c) => o.KEYS.includes(c)))] : null;
    if (s === "staff" && !r.length) throw q.bad("\u0985\u09A8\u09CD\u09A4\u09A4 \u098F\u0995\u099F\u09BE \u0985\u09CD\u09AF\u09BE\u09AA \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u0964");
    if (s === "staff" && n.uid === t) throw q.bad("You cannot demote yourself.");
    await Ct.auth().setCustomUserClaims(n.uid, s === "staff" ? { admin: !0, role: s, lim: r } : s ? { admin: !0, role: s } : { admin: !1, role: null }), await Ct.auth().revokeRefreshTokens(n.uid), await Be.doc(`users/${n.uid}`).set({ role: s || "user", staffApps: r || [] }, { merge: !0 });
    let i = Be.doc(`payoutAgents/${n.uid}`), d = await i.get();
    if (s === "payout") {
      let c = (await Be.doc(`users/${n.uid}`).get()).data() || {};
      await i.set(d.exists ? { active: !0, name: c.name || n.displayName || "", email: n.email } : { active: !0, name: c.name || n.displayName || "", email: n.email, methods: [], floatGiven: 0, floatReturned: 0, paidTotal: 0, paidCount: 0, reviewTotal: 0, reviewCount: 0, openCount: 0, createdAt: Date.now() }, { merge: !0 });
    } else d.exists && await i.set({ active: !1 }, { merge: !0 });
    return q.audit(null, t, "staff_role", { uid: n.uid, role: s, apps: r }), { ok: !0 };
  });
  qt.adminNotify = Ha({ region: da, timeoutSeconds: 300 }, async (e) => {
    let t = q.requireRole(e, ["super", "support"]), a = e.data || {}, n = q.str(a.title, { max: 80, label: "Title" }), s = q.str(a.body, { max: 400, label: "Message" }), o = (i) => ({ ref: Be.collection("users").doc(i).collection("notifications").doc(), data: { title: n, body: s, type: "announcement", read: !1, createdAt: qc.serverTimestamp() } }), r = 0;
    if (a.uid) {
      let i = o(String(a.uid));
      await i.ref.set(i.data), r = 1;
    } else {
      let i = null;
      for (; ; ) {
        let d = Be.collection("users").where("status", "==", "active").orderBy("__name__").limit(400);
        i && (d = d.startAfter(i));
        let c = await d.get();
        if (c.empty) break;
        let l = Be.batch();
        c.docs.forEach((u) => {
          let m = o(u.id);
          l.set(m.ref, m.data);
        }), await l.commit(), r += c.size, i = c.docs[c.docs.length - 1];
      }
    }
    return q.audit(null, t, "notify", { title: n, recipients: r }), { ok: !0, recipients: r };
  });
  qt.pushOnNotification = Lc({ document: "users/{uid}/notifications/{nid}", region: da }, async (e) => {
    let t = e.data?.data();
    if (!t) return;
    let n = (await Be.collection("users").doc(e.params.uid).collection("devices").get()).docs.map((r) => r.id);
    if (!n.length) return;
    let s = await Ct.messaging().sendEachForMulticast({ tokens: n, notification: { title: t.title, body: t.body } }), o = [];
    s.responses.forEach((r, i) => {
      !r.success && /registration-token-not-registered|invalid-registration-token/.test(r.error?.code || "") && o.push(n[i]);
    }), await Promise.all(o.map((r) => Be.doc(`users/${e.params.uid}/devices/${r}`).delete()));
  });
});

// src/math.js
var jo = E((tl, xo) => {
  "use strict";
  var Lo = Se("crypto"), es = {
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
  }, xc = 0.99, ts = () => Lo.randomInt(0, 2 ** 32) / 2 ** 32;
  function as(e) {
    let t = [], a = 1;
    for (let n = 0; n <= e; n++)
      t.push(a / 2 ** e), a = a * (e - n) / (n + 1);
    return t;
  }
  var jc = { low: { base: 1, spread: 4, e: 2 }, medium: { base: 0.4, spread: 30, e: 3 }, high: { base: 0.15, spread: 300, e: 4.5 } };
  function qo(e, t, a, n = 1e3) {
    let s = jc[t];
    if (!s) throw new Error("bad risk");
    let o = as(e), r = o.map((d, c) => s.base + Math.pow(Math.abs(c - e / 2) / (e / 2), s.e) * s.spread), i = r.reduce((d, c, l) => d + c * o[l], 0);
    return r.map((d) => Math.min(n, Math.round(d * a / i * 100) / 100));
  }
  function Gc(e, t, a, n) {
    let s = qo(e, t, a, n), o = as(e);
    return s.reduce((r, i, d) => r + i * o[d], 0);
  }
  function Fc(e) {
    let t = [];
    for (let a = 0; a < e; a++) t.push(Lo.randomInt(0, 2));
    return { path: t, slot: t.reduce((a, n) => a + n, 0) };
  }
  function Hc(e) {
    let t = e.reduce((a, n) => a + n.weight, 0);
    return e.reduce((a, n) => a + n.mult * n.weight, 0) / t;
  }
  function Wc(e) {
    let t = e.reduce((n, s) => n + s.weight, 0), a = ts() * t;
    for (let n = 0; n < e.length; n++)
      if (a -= e[n].weight, a < 0) return n;
    return e.length - 1;
  }
  function zc(e, t = 1e3) {
    let a = ts();
    return Math.min(t, Math.max(1, Math.floor(100 * e / (1 - a)) / 100));
  }
  var Kc = (e, t) => Math.floor(Math.exp(t * e) * 100) / 100, Vc = (e, t) => Math.log(e) / t;
  function Yc(e = {}) {
    let t = { ...es, ...e };
    for (let a of ["plinko", "wheel", "rocket"]) t[a] = { ...es[a], ...e[a] || {} };
    return t;
  }
  xo.exports = {
    DEFAULTS: es,
    MAX_RTP: xc,
    binomProbs: as,
    plinkoTable: qo,
    plinkoRtp: Gc,
    plinkoDrop: Fc,
    wheelRtp: Hc,
    wheelSpin: Wc,
    rocketCrashPoint: zc,
    rocketMultiplierAt: Kc,
    rocketCrashTimeMs: Vc,
    mergeConfig: Yc,
    randFloat: ts
  };
});

// src/games.js
var Fo = E((Nt) => {
  "use strict";
  var { onCall: xt } = ee(), j = z(), Le = jo(), { db: ne, FieldValue: ns, HttpsError: Wa, REGION: jt } = j;
  async function za() {
    let e = await ne.doc("settings/games").get();
    return Le.mergeConfig(e.exists ? e.data() : {});
  }
  function ss(e, t, a) {
    let n = e[t];
    if (!n.enabled) throw new Wa("failed-precondition", "This game is currently disabled.");
    if (e.rtp > Le.MAX_RTP) throw new Wa("failed-precondition", "Game configuration is invalid.");
    if (a < n.minBet || a > n.maxBet) throw j.bad(`Bet must be between ${n.minBet} and ${n.maxBet}.`);
  }
  function os(e, t, a, n, s, o, r) {
    let i = j.planDebit(a.balances, s, ["main", "winning"]), d = {};
    for (let [c, l] of Object.entries(i)) d[c] = -l;
    j.applyDelta(e, t, d), j.ledger(e, { uid: n, type: "bet", direction: "out", amount: s, bucket: Object.keys(i)[0], note: o, ref: r }), j.bumpStats(e, { betVolume: s });
  }
  function rs(e, t, a, n, s, o) {
    n <= 0 || (j.applyDelta(e, t, { winning: n }), j.ledger(e, { uid: a, type: "win", direction: "in", amount: n, bucket: "winning", note: s, ref: o }), j.bumpStats(e, { winPayout: n }));
  }
  Nt.getGameConfig = xt({ region: jt }, async (e) => {
    j.authUid(e);
    let t = await za(), a = {};
    for (let n of t.plinko.rows) {
      a[n] = {};
      for (let s of ["low", "medium", "high"]) a[n][s] = Le.plinkoTable(n, s, t.rtp, t.plinko.maxMultiplier);
    }
    return { rtp: t.rtp, plinko: { ...t.plinko, tables: a }, wheel: t.wheel, rocket: t.rocket };
  });
  Nt.playPlinko = xt({ region: jt }, async (e) => {
    let t = j.requireVerified(e), a = e.data || {}, n = await za(), s = j.amountOf(a.bet, { label: "Bet" });
    ss(n, "plinko", s);
    let o = Number(a.rows), r = String(a.risk);
    if (!n.plinko.rows.includes(o) || !["low", "medium", "high"].includes(r)) throw j.bad("Invalid Plinko settings.");
    let i = Le.plinkoTable(o, r, n.rtp, n.plinko.maxMultiplier), d = Le.plinkoDrop(o), c = i[d.slot], l = j.round2(s * c), u = ne.collection("gameHistory").doc();
    return await ne.runTransaction(async (m) => {
      let p = ne.doc(`users/${t}`), f = await m.get(p);
      j.assertActive(f.data()), os(m, p, f.data(), t, s, "plinko", u.id), rs(m, p, t, l, "plinko", u.id), m.set(u, { uid: t, game: "plinko", bet: s, payout: l, multiplier: c, status: "settled", detail: { rows: o, risk: r, path: d.path, slot: d.slot }, at: ns.serverTimestamp() });
    }), { path: d.path, slot: d.slot, multiplier: c, payout: l, historyId: u.id };
  });
  Nt.playWheel = xt({ region: jt }, async (e) => {
    let t = j.requireVerified(e), a = e.data || {}, n = await za(), s = j.amountOf(a.bet, { label: "Bet" });
    ss(n, "wheel", s);
    let o = n.wheel.segments;
    if (!Array.isArray(o) || o.length < 2 || Le.wheelRtp(o) > Le.MAX_RTP) throw new Wa("failed-precondition", "Wheel configuration is invalid.");
    let r = Le.wheelSpin(o), i = o[r].mult, d = j.round2(s * i), c = ne.collection("gameHistory").doc();
    return await ne.runTransaction(async (l) => {
      let u = ne.doc(`users/${t}`), m = await l.get(u);
      j.assertActive(m.data()), os(l, u, m.data(), t, s, "wheel", c.id), rs(l, u, t, d, "wheel", c.id), l.set(c, { uid: t, game: "wheel", bet: s, payout: d, multiplier: i, status: "settled", detail: { segment: r, label: o[r].label }, at: ns.serverTimestamp() });
    }), { segment: r, label: o[r].label, multiplier: i, payout: d, historyId: c.id };
  });
  Nt.rocketStart = xt({ region: jt }, async (e) => {
    let t = j.requireVerified(e), a = e.data || {}, n = await za(), s = j.amountOf(a.bet, { label: "Bet" });
    ss(n, "rocket", s);
    let o = Le.rocketCrashPoint(n.rtp, n.rocket.maxMultiplier), r = ne.collection("rocketRounds").doc().id, i = Date.now();
    return await ne.runTransaction(async (d) => {
      let c = ne.doc(`users/${t}`), l = await d.get(c);
      j.assertActive(l.data()), os(d, c, l.data(), t, s, "rocket", r), d.set(ne.doc(`rocketRounds/${r}`), { uid: t, bet: s, startedAt: i, status: "running", growth: n.rocket.growth }), d.set(ne.doc(`rocketSecrets/${r}`), { crash: o }), d.set(ne.doc(`gameHistory/${r}`), { uid: t, game: "rocket", bet: s, payout: 0, multiplier: 0, status: "running", detail: {}, at: ns.serverTimestamp() });
    }), { roundId: r, startedAt: i, growth: n.rocket.growth };
  });
  async function Go(e, t, a) {
    return ne.runTransaction(async (n) => {
      let s = ne.doc(`rocketRounds/${t}`), [o, r] = await Promise.all([n.get(s), n.get(ne.doc(`rocketSecrets/${t}`))]);
      if (!o.exists || o.data().uid !== e) throw new Wa("not-found", "Round not found.");
      let i = o.data(), d = r.data().crash;
      if (i.status !== "running") return { status: i.status, crash: i.status === "running" ? void 0 : d, multiplier: i.cashedAt || null, payout: i.payout || 0 };
      let c = Date.now() - i.startedAt, l = Le.rocketCrashTimeMs(d, i.growth), u = ne.doc(`gameHistory/${t}`);
      if (c >= l)
        return n.update(s, { status: "crashed", payout: 0 }), n.update(u, { status: "settled", detail: { crash: d } }), { status: "crashed", crash: d, payout: 0 };
      let m = Le.rocketMultiplierAt(c, i.growth);
      if (!a) return { status: "running", multiplier: m };
      let p = j.round2(i.bet * m);
      return rs(n, ne.doc(`users/${e}`), e, p, "rocket", t), n.update(s, { status: "cashed", payout: p, cashedAt: m }), n.update(u, { status: "settled", payout: p, multiplier: m, detail: { crash: d } }), { status: "cashed", multiplier: m, payout: p, crash: d };
    });
  }
  Nt.rocketPoll = xt({ region: jt }, (e) => Go(j.authUid(e), j.str((e.data || {}).roundId, { max: 80 }), !1));
  Nt.rocketCashout = xt({ region: jt }, (e) => Go(j.requireVerified(e), j.str((e.data || {}).roundId, { max: 80 }), !0));
});

// src/features.js
var Gt = E((nl, Wo) => {
  "use strict";
  var Jc = z(), { db: Xc, HttpsError: Zc } = Jc, is = { lottery: !0, bonus: !0, referral: !0, refms: !0, checkin: !0, board: !0, livedraw: !0, chat: !0, whatsapp: !0, histgames: !1, sound: !0 }, ua = { at: 0, v: null };
  async function Ho() {
    if (ua.v && Date.now() - ua.at < 15e3) return ua.v;
    let e = await Xc.doc("settings/content").get(), t = e.exists && e.data().features || {}, a = {};
    return Object.keys(is).forEach((n) => {
      a[n] = typeof t[n] == "boolean" ? t[n] : is[n];
    }), ua = { at: Date.now(), v: a }, a;
  }
  var Qc = { lottery: "\u09B2\u099F\u09BE\u09B0\u09BF", bonus: "\u09AC\u09CB\u09A8\u09BE\u09B8", referral: "\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2", refms: "\u0987\u09A8\u09AD\u09BE\u0987\u099F \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0", checkin: "\u09A6\u09C8\u09A8\u09BF\u0995 \u099A\u09C7\u0995-\u0987\u09A8", chat: "\u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099A\u09CD\u09AF\u09BE\u099F" };
  async function ed(e) {
    if (!(await Ho())[e]) throw new Zc("failed-precondition", `${Qc[e] || e} \u098F\u0996\u09A8 \u09AC\u09A8\u09CD\u09A7 \u0986\u099B\u09C7\u0964 (This feature is turned off.)`);
  }
  Wo.exports = { features: Ho, requireFeature: ed, DEFAULTS: is, _reset: () => {
    ua = { at: 0, v: null };
  } };
});

// src/lotdraw.js
var Va = E((sl, Yo) => {
  "use strict";
  var zo = Se("crypto"), It = z(), { db: nt, FieldValue: td, HttpsError: cs } = It, Ka = (e) => zo.createHash("sha256").update(String(e)).digest("hex"), Ko = (e, t, a) => parseInt(Ka(`${e}:${t}:${a}`).slice(0, 12), 16) % a;
  async function Vo(e) {
    let t = nt.doc(`lotteries/${e}/private/seed`), a = await t.get();
    if (a.exists) return a.data();
    let n = zo.randomBytes(32).toString("hex"), s = Ka(n);
    try {
      await t.create({ seed: n, hash: s, at: Date.now() });
    } catch (r) {
      let i = await t.get();
      if (i.exists) return i.data();
      throw r;
    }
    let o = await nt.doc(`lotteries/${e}`).get();
    return o.exists && !o.data().seedHash && await nt.doc(`lotteries/${e}`).update({ seedHash: s }), { seed: n, hash: s };
  }
  async function ad(e, t) {
    if (!(await nt.doc(`lotteries/${e}`).get()).exists) throw new cs("not-found", "Lottery not found.");
    return await Vo(e), nt.runTransaction(async (n) => {
      let s = nt.doc(`lotteries/${e}`), o = await n.get(s), r = o.data();
      if (!o.exists || !["open", "closed"].includes(r.status)) throw new cs("failed-precondition", "Lottery cannot be drawn.");
      let d = (await n.get(nt.doc(`lotteries/${e}/private/seed`))).data().seed, c = await n.get(nt.collection("lotteryTickets").where("lotteryId", "==", e).where("status", "==", "active"));
      if (c.empty) throw new cs("failed-precondition", "No tickets sold.");
      let l = c.docs.slice().sort((y, w) => (Number(y.data().number) || 0) - (Number(w.data().number) || 0)), u = l[Ko(d, e, l.length)], m = u.data(), p = It.round2(r.prize), f = nt.doc(`users/${m.uid}`), h = await n.get(f);
      return It.applyDelta(n, f, { winning: p }), It.ledger(n, { uid: m.uid, type: "lottery_win", direction: "in", amount: p, bucket: "winning", note: r.title, ref: e }), It.notify(n, m.uid, "You won the lottery! \u{1F389}", `${r.title}: ${p} added to your winnings.`, "lottery"), n.update(u.ref, { status: "won" }), n.update(s, {
        status: "drawn",
        winnerUid: m.uid,
        winnerName: h.data().username || "",
        winnerTicket: m.number,
        drawnAt: td.serverTimestamp(),
        drawSeed: d,
        seedHash: Ka(d),
        drawCount: l.length,
        drawBy: t === "auto" ? "auto" : "admin"
      }), It.bumpStats(n, { lotteryPayout: p }), It.audit(n, t === "auto" ? "system" : t, "lottery_drawn", { lotteryId: e, winner: m.uid, prize: p, auto: t === "auto" }), { winnerTicket: m.number, winnerUid: m.uid };
    });
  }
  Yo.exports = { sha: Ka, pickIndex: Ko, ensureSeed: Vo, drawLottery: ad };
});

// src/engagement.js
var Zo = E((la) => {
  "use strict";
  var ol = Se("crypto"), { onCall: Ja } = ee(), G = z(), { db: ge, FieldValue: Ya, HttpsError: Ye, REGION: Xa } = G;
  la.buyLotteryTickets = Ja({ region: Xa }, async (e) => {
    await Gt().requireFeature("lottery");
    let t = G.requireVerified(e), a = e.data || {}, n = G.str(a.lotteryId, { max: 80 }), s = Math.floor(G.amountOf(a.qty, { min: 1, max: 50, label: "Quantity" })), o = [];
    return (await ge.doc(`lotteries/${n}`).get()).exists && await Va().ensureSeed(n), await ge.runTransaction(async (r) => {
      let i = ge.doc(`lotteries/${n}`), d = ge.doc(`users/${t}`), [c, l] = await Promise.all([r.get(i), r.get(d)]);
      G.assertActive(l.data());
      let u = c.data();
      if (!c.exists || u.status !== "open") throw new Ye("failed-precondition", "This lottery is closed.");
      if (u.endsAt && u.endsAt.toMillis() <= Date.now()) throw new Ye("failed-precondition", "This lottery has ended.");
      if ((u.sold || 0) + s > u.totalTickets) throw new Ye("failed-precondition", "Not enough tickets left.");
      let m = l.data().rg?.excludedUntil;
      if ((m?.toMillis ? m.toMillis() : Number(m) || 0) > Date.now()) throw new Ye("failed-precondition", "You are on a self-exclusion break.");
      if (Number(u.maxPerUser) > 0 && (await r.get(ge.collection("lotteryTickets").where("lotteryId", "==", n).where("uid", "==", t).count())).data().count + s > Number(u.maxPerUser))
        throw new Ye("failed-precondition", `Maximum ${u.maxPerUser} tickets per player.`);
      let p = G.round2(u.price * s), f = G.planDebit(l.data().balances, p, ["main", "winning"]), h = {};
      for (let [y, w] of Object.entries(f)) h[y] = -w;
      G.applyDelta(r, d, h), G.ledger(r, { uid: t, type: "lottery", direction: "out", amount: p, bucket: Object.keys(f)[0], note: u.title, ref: n });
      for (let y = 1; y <= s; y++) {
        let w = (u.sold || 0) + y;
        o.push(w), r.set(ge.collection("lotteryTickets").doc(), { lotteryId: n, lotteryTitle: u.title, uid: t, number: w, price: u.price, status: "active", createdAt: Ya.serverTimestamp() });
      }
      r.update(i, { sold: Ya.increment(s) }), G.bumpStats(r, { lotterySales: p });
    }), { ok: !0, numbers: o };
  });
  la.adminDrawLottery = Ja({ region: Xa, timeoutSeconds: 120 }, async (e) => {
    let t = G.requireRole(e, ["super", "finance"]), a = G.str((e.data || {}).lotteryId, { max: 80 });
    return { ok: !0, winnerTicket: (await Va().drawLottery(a, t)).winnerTicket };
  });
  la.adminCancelLottery = Ja({ region: Xa, timeoutSeconds: 300 }, async (e) => {
    let t = G.requireRole(e, ["super", "finance"]), a = G.str((e.data || {}).lotteryId, { max: 80 });
    await ge.runTransaction(async (s) => {
      let o = await s.get(ge.doc(`lotteries/${a}`));
      if (!o.exists || !["open", "closed"].includes(o.data().status)) throw new Ye("failed-precondition", "Lottery cannot be cancelled.");
      s.update(o.ref, { status: "cancelled" });
    });
    let n = 0;
    for (; ; ) {
      let s = await ge.collection("lotteryTickets").where("lotteryId", "==", a).where("status", "==", "active").limit(100).get();
      if (s.empty) break;
      let o = {};
      s.docs.forEach((r) => {
        (o[r.data().uid] ||= []).push(r);
      });
      for (let [r, i] of Object.entries(o))
        await ge.runTransaction(async (d) => {
          let l = (await d.getAll(...i.map((m) => m.ref))).filter((m) => m.data().status === "active");
          if (!l.length) return;
          let u = G.round2(l.reduce((m, p) => m + p.data().price, 0));
          G.applyDelta(d, ge.doc(`users/${r}`), { main: u }), G.ledger(d, { uid: r, type: "lottery_refund", direction: "in", amount: u, bucket: "main", note: "Lottery cancelled", ref: a }), G.notify(d, r, "Lottery cancelled", `${u} was refunded to your wallet.`, "lottery"), l.forEach((m) => d.update(m.ref, { status: "refunded" })), n += l.length;
        });
    }
    return G.audit(null, t, "lottery_cancelled", { lotteryId: a, refundedTickets: n }), { ok: !0, refundedTickets: n };
  });
  function Xo(e, t) {
    let a = globalThis.crypto && globalThis.crypto.getRandomValues ? globalThis.crypto : Se("node:crypto").webcrypto, n = t - e + 1, s = new Uint32Array(1), o = Math.floor(4294967296 / n) * n, r;
    do
      a.getRandomValues(s), r = s[0];
    while (r >= o);
    return e + r % n;
  }
  function nd(e) {
    let t = e.reduce((n, s) => n + s.weight, 0), a = Xo(1, t);
    for (let n = 0; n < e.length; n++)
      if (a -= e[n].weight, a <= 0) return n;
    return e.length - 1;
  }
  var sd = (e) => (Array.isArray(e) ? e : []).map((t) => ({ amount: Math.round(Number(t && t.amount)), weight: Math.round(Number(t && t.weight)) })).filter((t) => t.amount > 0 && t.amount <= 1e6 && t.weight > 0 && t.weight <= 1e5).slice(0, 12), Jo = (e) => new Date(e + 6 * 36e5).toISOString().slice(0, 7);
  la.claimBonus = Ja({ region: Xa }, async (e) => {
    await Gt().requireFeature("bonus");
    let t = G.requireVerified(e), a = G.str((e.data || {}).bonusId, { max: 80 }), n = { once: 1 / 0, daily: 24 * 36e5, weekly: 168 * 36e5, monthly: 0 }, s = 0, o = -1;
    return await ge.runTransaction(async (r) => {
      let [i, d, c] = await Promise.all([r.get(ge.doc(`bonuses/${a}`)), r.get(ge.doc(`users/${t}`)), r.get(ge.doc(`bonusClaims/${t}_${a}`))]);
      G.assertActive(d.data());
      let l = i.data();
      if (!i.exists || !l.enabled) throw new Ye("failed-precondition", "This bonus is not available.");
      let u = l.type in n ? l.type : "once";
      if (c.exists) {
        if (u === "once") throw new Ye("already-exists", "You already claimed this bonus.");
        let p = c.data().lastClaimAt && c.data().lastClaimAt.toMillis ? c.data().lastClaimAt.toMillis() : Number(c.data().lastClaimMs) || 0;
        if (u === "monthly") {
          if (Jo(p) === Jo(Date.now())) throw new Ye("failed-precondition", "Already claimed this month. Available again next month.");
        } else {
          let f = p + n[u] - Date.now();
          if (f > 0) throw new Ye("failed-precondition", `Available again in ${Math.ceil(f / 6e4)} min.`);
        }
      }
      let m = sd(l.prizes);
      l.kind === "lucky" && m.length ? (o = nd(m), s = m[o].amount) : l.kind === "random" && Number(l.maxAmount) > Number(l.amount) ? s = Xo(Math.max(1, Math.round(l.amount)), Math.round(l.maxAmount)) : s = G.round2(l.amount), G.applyDelta(r, d.ref, { main: s }), G.ledger(r, { uid: t, type: "bonus", direction: "in", amount: s, bucket: "main", note: l.title, ref: a }), r.set(c.ref, { uid: t, bonusId: a, lastClaimAt: Ya.serverTimestamp(), lastClaimMs: Date.now(), lastAmount: s, count: Ya.increment(1) }, { merge: !0 }), G.bumpStats(r, { bonusPaid: s });
    }), { ok: !0, amount: s, prizeIndex: o };
  });
});

// src/ads.js
var er = E((Qo) => {
  "use strict";
  var { onCall: od } = ee(), Ft = z(), { db: Za, FieldValue: Qa } = Ft;
  Qo.adEvent = od({ region: Ft.REGION }, async (e) => {
    let t = Ft.authUid(e), a = e.data || {}, n = Ft.str(a.adId, { max: 80, label: "Ad" }), s = a.type === "click" ? "click" : a.type === "view" ? "view" : "";
    if (!s) throw Ft.bad("Invalid event.");
    let o = await Za.doc("settings/content").get();
    if (!(o.exists && Array.isArray(o.data().ads) ? o.data().ads : []).some((i) => i && i.id === n)) throw Ft.bad("Unknown ad.");
    return await Za.runTransaction(async (i) => {
      let d = Za.doc(`adSeen/${n}_${t}`), c = await i.get(d), l = c.exists ? c.data() : {}, u = { updatedAt: Date.now() };
      s === "view" ? (u.views = Qa.increment(1), l.viewedAt || (u.uniqueViews = Qa.increment(1))) : (u.clicks = Qa.increment(1), l.clickedAt || (u.uniqueClicks = Qa.increment(1))), i.set(Za.doc(`stats/ad_${n}`), u, { merge: !0 }), i.set(d, { uid: t, [s === "view" ? "viewedAt" : "clickedAt"]: Date.now() }, { merge: !0 });
    }), { ok: !0 };
  });
});

// supa/shims/functions-scheduler.js
var Ht = E((cl, tr) => {
  "use strict";
  tr.exports = { onSchedule: (e, t) => {
    let a = typeof e == "function" ? e : t;
    return a.__kind = "schedule", a;
  } };
});

// supa/shims/firebase-admin-firestore.js
var nr = E((dl, ar) => {
  "use strict";
  var { AggregateField: rd, FieldValue: id } = ta();
  ar.exports = { AggregateField: rd, FieldValue: id };
});

// src/ag/errors.js
var Wt = E((ul, or) => {
  "use strict";
  var en = {
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
  }, sr = (e) => en[e] || { msg: "Unknown error", en: "Something went wrong. Please try again.", bn: "\u0995\u09BF\u099B\u09C1 \u098F\u0995\u099F\u09BE \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" }, cd = (e) => !!(en[e] && en[e].retry), ds = class extends Error {
    constructor(t, a = "") {
      super(`${t} ${sr(t).msg}${a ? ` \u2014 ${a}` : ""}`), this.code = t, this.detail = a;
    }
  };
  or.exports = { CODES: en, info: sr, isRetryable: cd, AgError: ds };
});

// src/ag/config.js
var an = E((ll, cr) => {
  "use strict";
  var { db: rr } = z(), { AgError: dd } = Wt(), ud = 30 * 1e3, tn = null, us = 0, ir = {
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
  async function ld({ fresh: e = !1, requireSecret: t = !0 } = {}) {
    if (!e && tn && Date.now() - us < ud) return tn;
    let [a, n] = await Promise.all([rr.doc("adminConfig/gameApi").get(), rr.doc("adminPrivate/gameApi").get()]), s = { ...ir, ...a.exists ? a.data() : {}, secretKey: n.exists ? String(n.data().secretKey || "") : "" };
    if (s.terminalType = s.terminalType === "PC" ? "PC" : "PHONE", tn = s, us = Date.now(), t && (!s.baseUrl || !s.merchantCode || !s.secretKey)) throw new dd("C20001", "Game API is not configured (base URL, merchant code, secret key).");
    return s;
  }
  function md() {
    tn = null, us = 0;
  }
  cr.exports = { loadConfig: ld, clearConfigCache: md, DEFAULTS: ir };
});

// src/ag/sign.js
var ps = E((ml, mr) => {
  "use strict";
  var ls = Se("crypto"), nn = "HmacSHA256", pd = {
    merchant: "x-merchant-code",
    timestamp: "x-timestamp",
    nonce: "x-nonce",
    sign: "x-sign",
    signType: "x-content-processing-type"
  };
  function dr(e, t, a, n, s) {
    let o = s == null ? "" : Buffer.isBuffer(s) ? s.toString("utf8") : String(s);
    return String(e) + String(t) + String(a) + String(n) + o;
  }
  function ms(e, t, a, n, s, o = nn) {
    if (!e) throw new Error("Secret key missing");
    return ls.createHmac("sha256", Buffer.from(String(e), "utf8")).update(Buffer.from(dr(t, a, n, o, s), "utf8")).digest("hex");
  }
  function ur(e, t) {
    let a = String(e || "").toLowerCase(), n = String(t || "").toLowerCase();
    return !/^[0-9a-f]+$/.test(a) || a.length !== n.length ? !1 : ls.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(n, "utf8"));
  }
  function fd(e, t, a, n, s, o, r = nn) {
    return ur(ms(e, t, a, n, s, r), o);
  }
  var lr = () => ls.randomBytes(16).toString("hex");
  function hd(e, t, a) {
    let n = Date.now().toString(), s = lr();
    return {
      "X-MERCHANT-CODE": t,
      "X-TIMESTAMP": n,
      "X-NONCE": s,
      "X-SIGN": ms(e, t, n, s, a),
      "X-CONTENT-PROCESSING-TYPE": nn
    };
  }
  function wd(e, t) {
    if (!e) return "";
    if (typeof e.get == "function") return e.get(t) || "";
    let a = e[t] ?? e[t.toLowerCase()] ?? e[t.toUpperCase()];
    return Array.isArray(a) ? String(a[0]) : a == null ? "" : String(a);
  }
  mr.exports = { SIGN_TYPE: nn, HEADERS: pd, rawString: dr, sign: ms, verify: fd, safeEqualHex: ur, newNonce: lr, signedHeaders: hd, header: wd };
});

// src/ag/client.js
var hs = E((pl, gr) => {
  "use strict";
  var gd = Se("crypto"), mt = ps(), pr = Wt(), { db: yd, FieldValue: bd } = z(), fs = 12e3, Ad = [400, 1200, 2500], kd = 30, fr = () => "TRACE_" + gd.randomBytes(10).toString("hex").toUpperCase(), qe = class extends Error {
    /** kind: timeout | network | http | badjson | badsign | provider */
    constructor(t, a, n = {}) {
      super(a), this.kind = t, Object.assign(this, n);
    }
  }, hr = (e) => e instanceof qe && ["timeout", "network"].includes(e.kind) || e instanceof qe && e.kind === "http" && e.status >= 500 || e instanceof qe && e.kind === "provider" && pr.isRetryable(e.code), Sd = (e) => new Promise((t) => setTimeout(t, e)), wr = (e) => e && e.success !== !1 && (e.code === "C10000" || e.code == null && e.success === !0);
  async function vd(e, t, a, n) {
    let s = { "Content-Type": "application/json", ...mt.signedHeaders(e.secretKey, e.merchantCode, a) }, o = new AbortController(), r = setTimeout(() => o.abort(), fs), i, d;
    try {
      i = await n(e.baseUrl.replace(/\/+$/, "") + t, { method: "POST", headers: s, body: a, signal: o.signal }), d = await i.text();
    } catch (m) {
      throw new qe(
        m.name === "AbortError" ? "timeout" : "network",
        m.name === "AbortError" ? `Provider timed out after ${fs / 1e3}s` : `Could not reach provider: ${m.cause?.code || m.message}`
      );
    } finally {
      clearTimeout(r);
    }
    if (!i.ok) throw new qe("http", `Provider returned HTTP ${i.status}`, { status: i.status, body: String(d).slice(0, 300) });
    let c = mt.header(i.headers, "X-SIGN"), l = e.verifyResponseSign || "auto";
    if (l !== "off" && (c || l === "strict") && !(c && mt.verify(
      e.secretKey,
      mt.header(i.headers, "X-MERCHANT-CODE") || e.merchantCode,
      mt.header(i.headers, "X-TIMESTAMP"),
      mt.header(i.headers, "X-NONCE"),
      d,
      c,
      mt.header(i.headers, "X-CONTENT-PROCESSING-TYPE") || mt.SIGN_TYPE
    )))
      throw new qe("badsign", "Provider response signature is invalid");
    let u;
    try {
      u = JSON.parse(d);
    } catch {
      throw new qe("badjson", "Provider returned a non-JSON response", { body: String(d).slice(0, 300) });
    }
    if (!wr(u)) throw new qe("provider", `${u.code || "ERROR"}: ${u.msg || pr.info(u.code).msg}`, { code: u.code || "C10001", providerMsg: u.msg });
    return u;
  }
  async function Td(e, t, a = {}, n = {}) {
    let s = n.fetchImpl || fetch, o = n.retries ?? 2, r = { reqTraceId: fr(), ...a }, i = JSON.stringify(r), d = Date.now(), c = 0, l = null, u = null;
    for (; c <= o; c++)
      try {
        u = await vd(e, t, i, s), l = null;
        break;
      } catch (m) {
        if (l = m, !hr(m) || c === o) break;
        await Sd(Ad[c] || 2500);
      }
    if (n.log !== !1) {
      let m = {
        endpoint: t,
        reqTraceId: r.reqTraceId,
        attempts: Math.min(c + 1, o + 1),
        ok: !l,
        code: l ? l.code || l.kind : u.code,
        message: l ? l.message : "",
        latencyMs: Date.now() - d,
        request: i.slice(0, 2e3),
        at: bd.serverTimestamp(),
        expireAt: new Date(Date.now() + kd * 864e5)
      };
      yd.collection("agApiLogs").add(m).catch(() => {
      });
    }
    if (l) throw l;
    return u;
  }
  gr.exports = { call: Td, trace: fr, ClientError: qe, isSuccess: wr, transient: hr, TIMEOUT_MS: fs };
});

// src/ag/engine.js
var Dr = E((fl, Ir) => {
  "use strict";
  var ma = Se("crypto"), { AgError: x } = Wt(), F = (e) => Math.round((Number(e) + Number.EPSILON) * 100) / 100, pa = (e) => F(Math.max(0, e)).toFixed(2), _d = /^[A-Za-z0-9_\-.]{1,128}$/, Ar = 10;
  function le(e, t, a = 128) {
    let n = e[t];
    if (n == null || String(n).trim() === "") throw new x(t === "playerId" ? "G20001" : "C10002", `${t} is required`);
    let s = String(n).trim();
    if (s.length > a) throw new x("C10002", `${t} too long`);
    return s;
  }
  function sn(e, t) {
    let a = e[t];
    if (a == null || a === "") throw new x("C10002", `${t} is required`);
    if (typeof a != "number" && !/^\d+(\.\d+)?$/.test(String(a).trim())) throw new x("C10002", `${t} must be a non-negative decimal`);
    let n = Number(a);
    if (!Number.isFinite(n) || n < 0 || n > 1e12) throw new x("C10002", `${t} out of range`);
    return F(n);
  }
  function yr(e, t, a) {
    let n = e[t];
    if (n == null || n === "") {
      if (a !== void 0) return a;
      throw new x("C10002", `${t} is required`);
    }
    let s = String(n).trim().toLowerCase();
    if (n === !0 || n === 1 || ["true", "1", "y", "yes"].includes(s)) return !0;
    if (n === !1 || n === 0 || ["false", "0", "n", "no"].includes(s)) return !1;
    throw new x("C10002", `${t} must be boolean (got ${typeof n}: ${JSON.stringify(n).slice(0, 40)})`);
  }
  function br(e, t) {
    let a = e[t];
    if (a == null || a === "") throw new x("C10002", `${t} is required`);
    let n = Number(a);
    if (!Number.isFinite(n) || n < 0) throw new x("C10002", `${t} must be a Unix ms timestamp`);
    return n;
  }
  function fa(e) {
    let t = le(e, "playerId");
    if (!_d.test(t)) throw new x("G20006", "playerId has an invalid format");
    return t;
  }
  function ha(e, t) {
    let a = le(e, "currencyCode", 16);
    if (t.currencyCode && a !== t.currencyCode) throw new x("G20005", `wallet currency is ${t.currencyCode}, got ${a}`);
    return a;
  }
  function Dt(e) {
    let t = String(e);
    return /^[A-Za-z0-9_\-.:]{1,200}$/.test(t) && !/^\.+$/.test(t) && !t.startsWith("__") ? t : "h_" + ma.createHash("sha256").update(t).digest("hex");
  }
  function kr(e) {
    let t = Object.keys(e || {}).filter((a) => a !== "reqTraceId").sort();
    return ma.createHash("sha256").update(JSON.stringify(t.map((a) => [a, e[a]]))).digest("hex");
  }
  var pt = (e) => F((Number(e?.main) || 0) + (Number(e?.winning) || 0));
  function ws(e, t) {
    if (pt(e) + 1e-9 < t) return null;
    let a = F(t), n = {};
    for (let s of ["main", "winning"]) {
      let o = F(Math.min(Math.max(Number(e?.[s]) || 0, 0), a));
      o > 0 && (n[s] = o, a = F(a - o));
    }
    return a > 0 ? null : n;
  }
  function gs(e, t, a) {
    let { db: n, FieldValue: s } = e, o = {}, r = {}, i = s.serverTimestamp();
    return {
      delta(d, c) {
        o[d] = F((o[d] || 0) + c);
      },
      stat(d, c) {
        r[d] = F((r[d] || 0) + c);
      },
      ledger(d, c, l, u, m, p, f) {
        u > 0 && t.set(n.collection("transactions").doc(), { uid: d, type: c, direction: l, amount: F(u), bucket: m, note: p, ref: f, createdAt: i });
      },
      flush() {
        let d = {};
        for (let [l, u] of Object.entries(o)) u !== 0 && (d[`balances.${l}`] = s.increment(u));
        Object.keys(d).length && t.update(a, d);
        let c = {};
        for (let [l, u] of Object.entries(r)) u !== 0 && (c[l] = s.increment(u));
        Object.keys(c).length && t.set(n.doc(`statsShards/ag_${ma.randomInt(0, Ar)}`), c, { merge: !0 });
      },
      after(d) {
        let c = { ...d || {} };
        for (let [l, u] of Object.entries(o)) c[l] = F((Number(c[l]) || 0) + u);
        return c;
      }
    };
  }
  function Sr(e) {
    return "MB" + ma.createHash("sha1").update(String(e) + ma.randomBytes(4).toString("hex")).digest("hex").slice(0, 18).toUpperCase();
  }
  function vr(e, t, a) {
    if (e.status !== "active") throw new x("G30001", `account is ${e.status}`);
    let n = e.rg?.excludedUntil;
    if ((n?.toMillis ? n.toMillis() : Number(n) || 0) > a) throw new x("G30001", "player is self-excluded");
    if (t && t.status === "forced") throw new x("G30001", "session was force-logged-out");
  }
  async function ys(e, t, a, n, s) {
    let { db: o, FieldValue: r } = e, i = kr(a);
    return o.runTransaction(async (d) => {
      let c = o.doc(`agTransactions/${t}`), l = await d.get(c);
      if (l.exists) {
        let p = l.data();
        if (p.requestHash !== i) throw new x("G300016", `transactionId already used with a different payload (${t})`);
        return { data: p.response, replay: !0 };
      }
      let { data: u, record: m } = await s(d);
      return d.set(c, { ...n, ...m, requestHash: i, response: u, createdAt: r.serverTimestamp(), at: e.now }), { data: u, replay: !1 };
    });
  }
  async function Tr(e, t) {
    let a = fa(t);
    ha(t, e.cfg);
    let n = await e.db.doc(`users/${a}`).get();
    if (!n.exists) throw new x("G20006", a);
    return { balance: pa(pt(n.data().balances)) };
  }
  async function _r(e, t) {
    let a = fa(t);
    ha(t, e.cfg);
    let n = await e.db.doc(`users/${a}`).get();
    if (!n.exists) throw new x("G20006", a);
    let s = n.data(), o = String(e.cfg.siteUrl || "").replace(/\/+$/, ""), r = /^https:\/\//.test(s.photoURL || "") ? s.photoURL : e.cfg.defaultAvatarUrl || (o ? `${o}/icons/icon-192.png` : "");
    return { nickName: String(s.username || s.name || "Player").slice(0, 32), avatarUrl: r };
  }
  async function $r(e, t) {
    let a = fa(t), n = ha(t, e.cfg), s = le(t, "gameCode"), o = le(t, "roundId"), r = le(t, "betId"), i = le(t, "transactionId"), d = sn(t, "betAmount"), c = le(t, "timestamp", 40), { db: l } = e;
    return ys(e, `bet_${Dt(i)}`, t, { kind: "bet", transactionId: i, betId: r, roundId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: d, providerTime: c }, async (u) => {
      let m = l.doc(`users/${a}`), p = l.doc(`agBets/${Dt(r)}`), f = l.doc(`agSessions/${a}`), [h, y, w] = await Promise.all([u.get(m), u.get(p), u.get(f)]);
      if (!h.exists) throw new x("G20006", a);
      let v = h.data();
      vr(v, w.exists ? w.data() : null, e.now);
      let S = y.exists ? y.data() : null;
      if (S && S.status === "cancelled") throw new x("C10002", `bet ${r} was already cancelled`);
      if (S && S.uid !== a) throw new x("C10002", `bet ${r} belongs to another player`);
      let g = ws(v.balances, d);
      if (!g) throw new x("G30003", `needs ${d}, has ${pt(v.balances)}`);
      let b = gs(e, u, m);
      for (let [D, J] of Object.entries(g)) b.delta(D, -J);
      b.ledger(a, "game_bet", "out", d, Object.keys(g)[0] || "main", s, r), b.stat("agBetVolume", d), b.stat("agBetCount", 1);
      let k = S?.merchantBetId || Sr(r), $ = S?.debitPlan || {};
      u.set(p, {
        betId: r,
        merchantBetId: k,
        uid: a,
        playerId: a,
        gameCode: s,
        roundId: o,
        currencyCode: n,
        betAmount: F((S?.betAmount || 0) + d),
        debitPlan: { main: F(($.main || 0) + (g.main || 0)), winning: F(($.winning || 0) + (g.winning || 0)) },
        winAmount: S?.winAmount || 0,
        winReversed: S?.winReversed || 0,
        betRefunded: !1,
        status: S?.status === "settled" ? "settled" : "placed",
        isFree: !1,
        createdAt: S?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: S?.at || e.now
      }, { merge: !0 }), b.flush();
      let N = { merchantBetId: k, balance: pa(pt(b.after(v.balances))) };
      return { data: N, record: { merchantBetId: k, balanceAfter: N.balance, debitPlan: g } };
    });
  }
  async function Cr(e, t) {
    let a = fa(t), n = ha(t, e.cfg), s = le(t, "gameCode"), o = le(t, "roundId"), r = le(t, "betId"), i = le(t, "transactionId"), d = sn(t, "betAmount"), c = sn(t, "winAmount"), l = yr(t, "isFree", !1), u = yr(t, "isEnd"), m = br(t, "betTime"), p = br(t, "settledTime"), f = le(t, "type", 16);
    if (!["win", "bet_win"].includes(f)) throw new x("C10002", "type must be win or bet_win");
    let { db: h } = e;
    return ys(e, `win_${Dt(i)}`, t, { kind: "win", type: f, transactionId: i, betId: r, roundId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: d, winAmount: c, isFree: l, isEnd: u, betTime: m, settledTime: p }, async (y) => {
      let w = h.doc(`users/${a}`), v = h.doc(`agBets/${Dt(r)}`), S = h.doc(`agSessions/${a}`), [g, b, k] = await Promise.all([y.get(w), y.get(v), y.get(S)]);
      if (!g.exists) throw new x("G20006", a);
      let $ = g.data(), N = b.exists ? b.data() : null;
      if (N && N.uid !== a) throw new x("C10002", `bet ${r} belongs to another player`);
      if (N && N.status === "cancelled") throw new x("C10002", `bet ${r} was cancelled`);
      let D = gs(e, y, w), J = {}, ie = f === "bet_win" && !l && d > 0;
      if (ie) {
        if (vr($, k.exists ? k.data() : null, e.now), J = ws($.balances, d), !J) throw new x("G30003", `needs ${d}, has ${pt($.balances)}`);
        for (let [Ea, Ra] of Object.entries(J)) D.delta(Ea, -Ra);
        D.ledger(a, "game_bet", "out", d, Object.keys(J)[0] || "main", s, r), D.stat("agBetVolume", d), D.stat("agBetCount", 1);
      }
      c > 0 && (D.delta("winning", c), D.ledger(a, "game_win", "in", c, "winning", s + (l ? " (free spin)" : ""), r), D.stat("agWinPayout", c)), !N && f === "win" && D.stat("agOrphanWins", 1);
      let Y = N?.merchantBetId || Sr(r), ce = N?.debitPlan || {};
      y.set(v, {
        betId: r,
        merchantBetId: Y,
        uid: a,
        playerId: a,
        gameCode: s,
        roundId: o,
        currencyCode: n,
        betAmount: F((N?.betAmount || 0) + (ie ? d : 0)),
        declaredBetAmount: d,
        debitPlan: { main: F((ce.main || 0) + (J.main || 0)), winning: F((ce.winning || 0) + (J.winning || 0)) },
        winAmount: F((N?.winAmount || 0) + c),
        winReversed: N?.winReversed || 0,
        betRefunded: N?.betRefunded || !1,
        isFree: l,
        isEnd: u,
        status: u ? "settled" : N?.status || "placed",
        betTime: m,
        settledTime: u ? p : N?.settledTime || null,
        createdAt: N?.createdAt || e.FieldValue.serverTimestamp(),
        updatedAt: e.FieldValue.serverTimestamp(),
        at: N?.at || e.now
      }, { merge: !0 }), D.flush();
      let tt = { merchantBetId: Y, balance: pa(pt(D.after($.balances))) };
      return { data: tt, record: { merchantBetId: Y, balanceAfter: tt.balance, debitPlan: J } };
    });
  }
  async function Nr(e, t) {
    let a = fa(t), n = ha(t, e.cfg), s = le(t, "gameCode"), o = le(t, "betId"), r = le(t, "merchantBetId"), i = sn(t, "betAmount"), d = le(t, "cancelType", 8).toUpperCase(), c = le(t, "transactionId");
    if (!["BET", "WIN"].includes(d)) throw new x("C10002", "cancelType must be BET or WIN");
    let { db: l } = e;
    return ys(e, `cancel_${Dt(c)}`, t, { kind: "cancel", cancelType: d, transactionId: c, betId: o, gameCode: s, playerId: a, uid: a, currencyCode: n, betAmount: i, merchantBetId: r }, async (u) => {
      let m = l.doc(`users/${a}`), p = l.doc(`agBets/${Dt(o)}`), [f, h] = await Promise.all([u.get(m), u.get(p)]);
      if (!f.exists) throw new x("G20006", a);
      let y = f.data(), w = gs(e, u, m), v = h.exists ? h.data() : null;
      if (v && v.uid !== a) throw new x("C10002", `bet ${o} belongs to another player`);
      let S = 0, g = 0, b = "", k = e.FieldValue.serverTimestamp();
      if (!v)
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
          betRefunded: d === "BET",
          status: d === "BET" ? "cancelled" : "placed",
          cancelledBeforeBet: !0,
          createdAt: k,
          updatedAt: k,
          at: e.now
        }), b = "no matching bet; tombstone stored";
      else if (d === "BET") {
        if (v.betRefunded)
          b = "bet already refunded";
        else {
          let D = v.debitPlan || {};
          for (let J of ["main", "winning"]) D[J] > 0 && w.delta(J, D[J]);
          S = F((D.main || 0) + (D.winning || 0)), w.ledger(a, "game_refund", "in", S, "main", `${s} bet cancelled`, o), w.stat("agBetVolume", -S), w.stat("agCancelCount", 1), Math.abs(S - i) > 1e-3 && (b = `refunded the ${S} actually debited (request said ${i})`);
        }
        u.set(p, { status: "cancelled", betRefunded: !0, cancelledAt: k, updatedAt: k }, { merge: !0 });
      } else {
        let D = F((v.winAmount || 0) - (v.winReversed || 0));
        if (D > 0) {
          let J = y.balances || {}, ie = F(Math.min(Math.max(Number(J.winning) || 0, 0), D)), Y = F(Math.min(Math.max(Number(J.main) || 0, 0), F(D - ie))), ce = F(D - ie - Y);
          ie + ce > 0 && w.delta("winning", -(ie + ce)), Y > 0 && w.delta("main", -Y), g = D, w.ledger(a, "game_win_reversal", "out", g, "winning", `${s} win cancelled`, o), w.stat("agWinPayout", -g), w.stat("agCancelCount", 1), ce > 0 && (b = `player balance short by ${ce}; recorded as negative winning balance`, w.stat("agDebt", ce));
        } else b = "nothing to reverse";
        u.set(p, { winReversed: F((v.winReversed || 0) + g), winCancelledAt: k, updatedAt: k }, { merge: !0 });
      }
      w.flush();
      let N = { merchantBetId: v?.merchantBetId || r, betId: o, balance: pa(pt(w.after(y.balances))), currencyCode: n };
      return { data: N, record: { refunded: S, reversed: g, note: b, balanceAfter: N.balance } };
    });
  }
  var $d = {
    "/wallet/balance": (e, t) => Tr(e, t),
    "/player/info": (e, t) => _r(e, t),
    "/wallet/bet": async (e, t) => (await $r(e, t)).data,
    "/wallet/win": async (e, t) => (await Cr(e, t)).data,
    "/wallet/cancel": async (e, t) => (await Nr(e, t)).data
  };
  Ir.exports = { ROUTES: $d, STAT_SHARDS: Ar, balance: Tr, playerInfo: _r, bet: $r, win: Cr, cancel: Nr, planDebit: ws, safeId: Dt, requestHash: kr, playable: pt, round2: F, money: pa };
});

// src/ag/callbacks.js
var Or = E((hl, Mr) => {
  "use strict";
  var Cd = Se("crypto"), st = ps(), ye = Wt(), { ROUTES: Er, requestHash: Nd } = Dr(), Id = 24 * 36e5, Dd = 90;
  function on(e, t = null, a) {
    return { success: e === "C10000", code: e, msg: a || ye.info(e).msg, data: e === "C10000" ? t : null };
  }
  function Rr(e) {
    let t = String(e || "").split("?")[0].replace(/\/+$/, "");
    return Object.keys(Er).find((a) => t === a || t.endsWith(a)) || null;
  }
  function Ed(e, t) {
    let a = st.header(e, "x-forwarded-for");
    return (a ? a.split(",")[0] : t || "").trim();
  }
  var bs = Dn(), Rd = (e, t) => bs.run(() => Md(e, t));
  async function Md(e, t) {
    let a = Date.now(), n = Rr(t.path), s = Buffer.isBuffer(t.rawBody) ? t.rawBody.toString("utf8") : String(t.rawBody ?? ""), o = null, r, i = "";
    try {
      if (t.method !== "POST") throw new ye.AgError("C10003", "POST required");
      if (!n) throw new ye.AgError("C10002", `unknown endpoint ${t.path}`);
      let m = t.headers || {}, p = st.header(m, "X-MERCHANT-CODE"), f = st.header(m, "X-TIMESTAMP"), h = st.header(m, "X-NONCE"), y = st.header(m, "X-SIGN"), w = st.header(m, "X-CONTENT-PROCESSING-TYPE");
      if (!p || !f || !h || !y || !w) throw new ye.AgError("C10003", "missing signature headers");
      if (h.length > 64 || y.length > 256) throw new ye.AgError("C10003", "header too long");
      if (!e.cfg.merchantCode || !e.cfg.secretKey) throw new ye.AgError("C20001", "merchant not configured on our side");
      if (p !== e.cfg.merchantCode) throw new ye.AgError("C20001", `unknown merchant ${p}`);
      if (w !== st.SIGN_TYPE) throw new ye.AgError("C10003", `unsupported signType ${w}`);
      let v = Number(f), S = (Number(e.cfg.timestampToleranceSec) || 300) * 1e3;
      if (!/^\d{10,16}$/.test(f) || !Number.isFinite(v) || Math.abs(e.now - v) > S) throw new ye.AgError("C10003", "timestamp outside allowed window");
      if (!st.verify(e.cfg.secretKey, p, f, h, s, y, w)) throw new ye.AgError("C10004");
      let g = Array.isArray(e.cfg.callbackIpWhitelist) ? e.cfg.callbackIpWhitelist.filter(Boolean) : [];
      if (g.length && !g.includes(t.ip)) throw new ye.AgError("C10003", `IP ${t.ip} not allowed`);
      try {
        o = JSON.parse(s || "{}");
      } catch {
        throw new ye.AgError("C10002", "body is not valid JSON");
      }
      if (!o || typeof o != "object" || Array.isArray(o)) throw new ye.AgError("C10002", "body must be a JSON object");
      let b = e.db.doc(`agNonces/${Cd.createHash("sha256").update(p + ":" + h).digest("hex")}`), k = Nd(o);
      try {
        await b.create({ route: n, bodyHash: k, at: e.now, expireAt: new Date(e.now + Id) });
      } catch (N) {
        if (!(N.code === 6 || /ALREADY_EXISTS/i.test(String(N.message || N)))) throw N;
        let D = await b.get();
        if (!D.exists || D.data().bodyHash !== k) throw new ye.AgError("C10003", "nonce already used (replay)");
        i = "identical retry (same nonce + payload)";
      }
      let $ = await Er[n](e, o);
      r = on("C10000", $);
    } catch (m) {
      m instanceof ye.AgError ? (r = on(m.code), i = m.detail || i) : (r = on("C10001"), i = String(m && m.stack || m).slice(0, 500));
    }
    bs.mark("done");
    let d = bs.summary();
    d && Date.now() - a > 1500 && (i = (i ? i + " | " : "") + "timing " + d);
    let c = JSON.stringify(r), l = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
    e.cfg.secretKey && e.cfg.merchantCode && Object.assign(l, st.signedHeaders(e.cfg.secretKey, e.cfg.merchantCode, c));
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
      response: c.slice(0, 1e3),
      at: e.now,
      expireAt: new Date(e.now + Dd * 864e5)
    };
    return { status: t.method === "POST" ? 200 : 405, headers: l, body: c, log: u };
  }
  Mr.exports = { handle: Rd, wrap: on, routeOf: Rr, clientIp: Ed };
});

// src/ag/platform.js
var ks = E((me) => {
  "use strict";
  var Ur = Se("net"), { onCall: xe, onRequest: Od, HttpsError: ft } = ee(), { onSchedule: Br } = Ht(), { AggregateField: zt } = nr(), _ = z(), { db: O, admin: Pd, FieldValue: se, REGION: ve } = _, Kt = Wt(), { loadConfig: ot, clearConfigCache: Ud, DEFAULTS: Lr } = an(), be = hs(), Pr = Or(), Bd = ["slots", "live", "sports", "fishing", "lottery", "cards", "crash"], Ld = (e = "", t = "", a = "") => {
    let n = `${e} ${t} ${a}`.toUpperCase();
    return /LIVE|BACCARAT|ROULETTE/.test(n) ? "live" : /SPORT/.test(n) ? "sports" : /FISH/.test(n) ? "fishing" : /LOTT|KENO|BINGO/.test(n) ? "lottery" : /CARD|POKER|RUMMY|TEEN|ANDAR|TABLE/.test(n) ? "cards" : /CRASH|AVIATOR|ROCKET/.test(n) ? "crash" : "slots";
  }, rn = (e) => String(e).replace(/[\/\s]/g, "_").slice(0, 400), qd = ["BR_BRL", "GB_GBP", "DK_DKK", "DE_EUR", "ES_EUR", "FI_EUR", "FR_EUR", "ID_IDR", "IT_EUR", "NL_EUR", "NO_NOK", "PL_PLN", "PT_EUR", "TH_THB", "TR_TRY", "VN_VND", "MM_MMK", "SG_SGD", "NG_NGN", "US_USD", "PK_PKR", "CO_COP", "PH_PHP", "MX_MXN", "AR_ARS", "KE_KES", "CL_CLP", "ZA_ZAR", "BD_BDT", "IN_INR", "LK_LKR"], qr = ["en", "ar", "az", "bg", "bn", "cs", "da", "de", "el", "en-stkus", "es", "et", "fa", "fi", "fr", "hi", "hu", "hy", "id", "it", "ja", "ko", "lo", "lt", "mn", "my", "ms", "nl", "no", "pl", "pt", "pt-br", "ro", "ru", "sh", "si", "sk", "sq", "sv", "th", "tr", "uk", "ur", "uz", "vi"];
  function As(e, t = "Game service error") {
    if (e instanceof ft) return e;
    if (e instanceof Kt.AgError || e instanceof be.ClientError && e.kind === "provider") {
      let a = e.code || "C10001", n = Kt.info(a);
      return new ft("failed-precondition", n.en, { agCode: a, bn: n.bn, providerMsg: e.providerMsg || e.detail || "", retry: Kt.isRetryable(a) });
    }
    if (e instanceof be.ClientError) {
      let a = {
        timeout: "The game provider did not respond in time. Please try again.",
        network: "Could not reach the game provider. Please try again.",
        http: `The game provider returned an error (HTTP ${e.status}).`,
        badjson: "The game provider sent an invalid response.",
        badsign: "The game provider response failed the security check."
      }[e.kind] || t;
      return new ft("unavailable", a, { kind: e.kind, status: e.status || null, retry: ["timeout", "network", "http"].includes(e.kind) });
    }
    return console.error(e), new ft("internal", t);
  }
  var Je = (e) => async (t) => {
    try {
      return await e(t);
    } catch (a) {
      throw As(a);
    }
  }, xd = (e) => {
    let a = String(e.rawRequest?.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || String(e.rawRequest?.ip || "").replace(/^::ffff:/, "");
    return Ur.isIP(a) ? a : "";
  }, Et = (e, t, a, n) => {
    let s = Number(e);
    if (!Number.isInteger(s) || s < t || s > a) throw _.bad(`${n} must be a whole number ${t}-${a}.`);
    return s;
  }, dn = (e, t) => {
    let a = _.str(e, { max: 40, label: t }), n = Date.parse(a);
    if (!Number.isFinite(n)) throw _.bad(`${t} must be an ISO-8601 date/time.`);
    return { s: new Date(n).toISOString(), ms: n };
  }, cn = /^[A-Za-z0-9-]{1,50}$/, wa = /^[A-Za-z0-9_\-.]{1,128}$/;
  me.agCallback = Od({ region: ve, timeoutSeconds: 30, memory: "256MiB", minInstances: 0, concurrency: 80, invoker: "public" }, async (e, t) => {
    let a;
    try {
      a = await ot({ requireSecret: !1 });
    } catch {
      a = { ...Lr };
    }
    let n = await Pr.handle({ db: O, FieldValue: se, cfg: a, now: Date.now() }, {
      method: e.method,
      path: e.path || e.url,
      headers: e.headers,
      rawBody: e.rawBody || Buffer.from(""),
      ip: Pr.clientIp(e.headers, e.ip)
    });
    O.collection("agCallbackLogs").add({ ...n.log, at: se.serverTimestamp(), atMs: n.log.at }).catch((s) => console.error("log", s.message)), n.log.code === "C10001" && console.error("agCallback internal error", n.log.detail), t.status(n.status).set(n.headers).send(n.body);
  });
  me.adminSaveGameApiConfig = xe({ region: ve }, Je(async (e) => {
    let t = _.requireRole(e, ["super"]), a = e.data || {}, n = _.str(a.baseUrl, { max: 200, label: "Base URL", pattern: /^https:\/\/[^\s]+$/ }).replace(/\/+$/, ""), s = _.str(a.currencyCode || "BD_BDT", { max: 20, label: "Currency" });
    if (!qd.includes(s)) throw _.bad("Unsupported currency code (see PDF \xA72.7).");
    let o = _.str(a.lang || "bn", { max: 10, label: "Language" });
    if (!qr.includes(o)) throw _.bad("Unsupported language (see PDF \xA72.8).");
    let r = _.str(a.subMerchantCode || "site", { max: 50, label: "Sub-merchant code", pattern: cn }), i = a.siteUrl ? _.str(a.siteUrl, { max: 200, label: "Site URL", pattern: /^https:\/\/[^\s/]+(\/[^\s]*)?$/ }).replace(/\/+$/, "") : "", d = (Array.isArray(a.callbackIpWhitelist) ? a.callbackIpWhitelist : String(a.callbackIpWhitelist || "").split(/[\s,]+/)).map((u) => String(u).trim()).filter(Boolean);
    if (d.some((u) => !Ur.isIP(u))) throw _.bad("IP allow-list contains an invalid IP address.");
    let c = {
      baseUrl: n,
      merchantCode: _.str(a.merchantCode, { max: 64, label: "Merchant code" }),
      currencyCode: s,
      lang: o,
      subMerchantCode: r,
      siteUrl: i,
      terminalType: a.terminalType === "PC" ? "PC" : "PHONE",
      env: a.env === "prod" ? "prod" : "staging",
      verifyResponseSign: ["auto", "strict", "off"].includes(a.verifyResponseSign) ? a.verifyResponseSign : "auto",
      timestampToleranceSec: Et(a.timestampToleranceSec ?? 300, 30, 900, "Timestamp tolerance"),
      callbackIpWhitelist: d.slice(0, 50),
      categoryMap: typeof a.categoryMap == "object" && a.categoryMap ? a.categoryMap : {},
      updatedAt: se.serverTimestamp(),
      updatedBy: t
    };
    await O.doc("adminConfig/gameApi").set(c, { merge: !0 });
    let l = typeof a.secretKey == "string" && a.secretKey.trim().length > 0;
    return l && await O.doc("adminPrivate/gameApi").set({ secretKey: a.secretKey.trim(), rotatedAt: se.serverTimestamp() }), await O.doc("adminConfig/gameApiStatus").set({ ok: !1, testedAt: null, message: "Configuration changed \u2014 run the connection test." }), Ud(), _.audit(null, t, "game_api_config", { baseUrl: n, merchantCode: c.merchantCode, env: c.env, secretChanged: l }), { ok: !0 };
  }));
  me.adminGetGameApiConfig = xe({ region: ve }, Je(async (e) => {
    _.requireRole(e, ["super"]);
    let [t, a, n, s] = await Promise.all([O.doc("adminConfig/gameApi").get(), O.doc("adminPrivate/gameApi").get(), O.doc("adminConfig/gameApiStatus").get(), O.doc("adminConfig/agMerchant").get()]), o = String((globalThis.__ENV || process.env).SUPABASE_URL || "").replace(/\/+$/, ""), r = { ...Lr, ...t.exists ? t.data() : {} };
    return delete r.updatedAt, {
      config: r,
      secretSet: a.exists && !!a.data().secretKey,
      status: n.exists ? { ...n.data(), testedAt: n.data().testedAt?.toMillis?.() || null } : null,
      merchant: s.exists ? { ...s.data(), syncedAt: s.data().syncedAt?.toMillis?.() || null } : null,
      callbackUrls: [o ? `${o}/functions/v1/api/agw` : null].filter(Boolean)
    };
  }));
  me.adminTestGameApi = xe({ region: ve, timeoutSeconds: 60 }, async (e) => {
    _.requireRole(e, ["super"]);
    let t = Date.now(), a;
    try {
      let n = await ot({ fresh: !0 }), o = ((await be.call(n, "/game/v5/providers", {}, { retries: 0 })).data?.providers || []).length;
      a = { ok: !0, latencyMs: Date.now() - t, message: `Connected \u2014 ${o} provider(s) returned.`, providerCount: o };
    } catch (n) {
      let s = As(n);
      a = { ok: !1, latencyMs: Date.now() - t, message: n.message || s.message, agCode: s.details?.agCode || null, kind: n.kind || s.details?.kind || "config", httpStatus: n.status || null };
    }
    return await O.doc("adminConfig/gameApiStatus").set({ ...a, testedAt: se.serverTimestamp() }), a;
  });
  me.adminSyncGames = xe({ region: ve, timeoutSeconds: 540, memory: "512MiB" }, Je(async (e) => {
    let t = _.requireRole(e, ["super", "content"]), a = await ot({ fresh: !0 }), s = ((await be.call(a, "/game/v5/providers", {})).data?.providers || []).map((u) => typeof u == "string" ? { name: u, code: u } : u);
    await O.doc("adminConfig/agProviders").set({ providers: s, syncedAt: se.serverTimestamp() });
    let o = (await be.call(a, "/game/v5/categories", { currencyCode: a.currencyCode, lang: a.lang })).data?.categoryDataList || [], r = 0, i = [], d = /* @__PURE__ */ new Set(), c = new Set((await O.collection("games").limit(2e4).get()).docs.map((u) => u.id));
    for (let u of o) {
      let m = u.categoryCode || u.code;
      if (!m) continue;
      let p = (a.categoryMap || {})[m] || Ld(m, u.categoryName), f = 0;
      for (let h = 1; h <= 200; h++) {
        let y = await be.call(a, "/game/v5/games", { categoryCode: m, currencyCode: a.currencyCode, lang: a.lang, pageIndex: h }), w = y.data?.gameItemList || y.data?.gameltemList || [];
        if (!w.length) break;
        let v = O.batch();
        for (let g of w) {
          let b = g.gameCode;
          if (!b) continue;
          let k = Number.isInteger(Number(g.status)) ? Number(g.status) : 1;
          v.set(O.doc(`games/${rn(b)}`), {
            gameCode: String(b),
            name: g.gameName || g.name || String(b),
            gameType: g.gameType || "",
            status: k,
            imageUrl: g.imageUrl || g.gameIcon || g.iconUrl || "",
            provider: g.providerCode || g.provider || "",
            categoryCode: m,
            categoryName: u.categoryName || m,
            lobbyCategory: p,
            syncedAt: se.serverTimestamp(),
            ...c.has(rn(b)) ? {} : { addedAt: Date.now() }
          }, { merge: !0 }), d.add(String(b)), r++, f++;
        }
        await v.commit();
        let S = Number(y.data?.totalSize) || 0;
        if (S && f >= S) break;
      }
      i.push({ code: m, name: u.categoryName || m, lobby: p, count: f });
    }
    let l = O.batch();
    return i.forEach((u) => l.set(O.doc(`gameCategories/${rn(u.code)}`), { ...u, syncedAt: se.serverTimestamp() }, { merge: !0 })), await l.commit(), _.audit(null, t, "games_synced", { providers: s.length, categories: i.length, games: r, unique: d.size }), { ok: !0, providers: s.length, categories: i.length, games: d.size };
  }));
  function jd(e, t) {
    let a = String(e.rawRequest?.headers?.origin || "").replace(/\/+$/, ""), n = [t.siteUrl, String((globalThis.__ENV || process.env).SITE_URL || "").replace(/\/+$/, "")].filter(Boolean);
    if (a && (n.includes(a) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(a))) return a;
    if (t.siteUrl) return t.siteUrl;
    throw new ft("failed-precondition", "Set the Site URL in Admin \u2192 Game API (needed for the game exit page).");
  }
  me.launchGame = xe({ region: ve, timeoutSeconds: 30 }, Je(async (e) => {
    let t = _.requireVerified(e), a = e.data || {}, n = _.str(a.gameCode, { max: 120, label: "Game" }), [s, o, r] = await Promise.all([O.doc(`games/${rn(n)}`).get(), O.doc(`users/${t}`).get(), ot()]), i = o.data();
    _.assertActive(i);
    let d = i.rg?.excludedUntil;
    if ((d?.toMillis ? d.toMillis() : Number(d) || 0) > Date.now()) throw new ft("failed-precondition", "You are on a self-exclusion break. Games are unavailable until it ends.");
    if (!s.exists || s.data().enabled === !1) throw new Kt.AgError("G20002");
    if (s.data().status === 0) throw new Kt.AgError("G20003");
    if (s.data().status === 2) throw new Kt.AgError("G20010");
    let c = xd(e);
    if (!c) throw new ft("failed-precondition", "Could not determine your IP address.");
    let l = a.terminalType === "PC" ? "PC" : a.terminalType === "PHONE" ? "PHONE" : r.terminalType, u = jd(e, r), m = {
      gameCode: s.data().gameCode,
      playerId: t,
      currencyCode: r.currencyCode,
      language: qr.includes(a.language) ? a.language : r.lang,
      terminalType: l,
      returnUrl: `${u}/exitGame.html?game=${encodeURIComponent(s.data().gameCode)}`,
      ipAddress: c,
      subMerchantCode: r.subMerchantCode || "site",
      nickName: String(i.username || i.name || "Player").slice(0, 32)
    };
    /^https:\/\//.test(i.photoURL || "") && (m.avatarUrl = i.photoURL);
    let p = await be.call(r, "/game/v5/game/url", m), f = p.data?.gameUrl || p.data?.url;
    if (!f || !/^https?:\/\//.test(f)) throw new ft("unavailable", "The game provider did not return a game URL.");
    return await O.doc(`agSessions/${t}`).set({
      uid: t,
      status: "active",
      gameCode: s.data().gameCode,
      gameName: s.data().name || "",
      terminalType: l,
      ip: c,
      expireTime: p.data?.expireTime || null,
      launchedAt: se.serverTimestamp(),
      launchedAtMs: Date.now(),
      closedAt: null,
      forcedAt: null
    }, { merge: !0 }), await O.collection("gameHistory").add({ uid: t, game: s.data().gameCode, provider: "ag", status: "launched", at: se.serverTimestamp() }), { gameUrl: f, gameCode: s.data().gameCode, gameName: s.data().name || "", expireTime: p.data?.expireTime || null };
  }));
  me.agExitGame = xe({ region: ve }, Je(async (e) => {
    let t = _.authUid(e), a = O.doc(`agSessions/${t}`);
    return await O.runTransaction(async (n) => {
      let s = await n.get(a);
      s.exists && s.data().status === "active" && n.update(a, { status: "closed", closedAt: se.serverTimestamp() });
    }), { ok: !0 };
  }));
  async function xr(e, t, a, { revokeTokens: n = !1, reason: s = "" } = {}) {
    let o = "SKIPPED", r = "";
    try {
      let i = await be.call(e, "/game/v5/player/force/logout", { playerId: t });
      o = i.data?.logoutStatus || "SUCCESS", r = i.data?.message || "";
    } catch (i) {
      o = "FAILED", r = As(i).message;
    }
    return await O.doc(`agSessions/${t}`).set({ uid: t, status: "forced", forcedAt: se.serverTimestamp(), forcedBy: a, forceReason: s, providerLogout: o }, { merge: !0 }), n && (await Pd.auth().revokeRefreshTokens(t), await O.doc(`users/${t}`).set({ sessionsRevokedAt: se.serverTimestamp() }, { merge: !0 })), await O.collection("users").doc(t).collection("notifications").add({
      title: "Signed out of games",
      body: s || "Your game session was ended by support.",
      type: "security",
      read: !1,
      createdAt: se.serverTimestamp()
    }), { playerId: t, logoutStatus: o, message: r };
  }
  me.adminForceLogout = xe({ region: ve, timeoutSeconds: 300 }, Je(async (e) => {
    let t = _.requireRole(e, ["super", "support"]), a = e.data || {}, n = await ot(), s = typeof a.reason == "string" ? a.reason.trim().slice(0, 200) : "", o = [];
    a.all === !0 ? o = (await O.collection("agSessions").where("status", "==", "active").limit(200).get()).docs.map((d) => d.id) : o = [_.str(a.uid, { max: 128, label: "Player", pattern: wa })];
    let r = [];
    for (let i of o) r.push(await xr(n, i, t, { revokeTokens: a.revokeTokens === !0, reason: s }));
    return _.audit(null, t, "ag_force_logout", { count: r.length, all: a.all === !0, revokeTokens: a.revokeTokens === !0, failed: r.filter((i) => i.logoutStatus === "FAILED").length }), { ok: !0, results: r };
  }));
  me.forceLogoutOne = xr;
  me.adminAgRtp = xe({ region: ve, timeoutSeconds: 60 }, Je(async (e) => {
    let t = _.requireRole(e, ["super", "finance"]), a = e.data || {}, n = await ot(), s = n.currencyCode, o, r = null;
    switch (a.action) {
      case "subMerchant": {
        let i = _.str(a.subMerchantCode || n.subMerchantCode, { max: 50, label: "Sub-merchant", pattern: cn }), d = Et(a.rtp, 1, 100, "RTP");
        o = await be.call(n, "/game/v5/set/sub/merchant/rtp", { subMerchantCode: i, rtp: d, currencyCode: s }), r = { scope: "SUB_MERCHANT", subMerchantCode: i, rtp: d, changed: o.data?.changedRtpValue };
        break;
      }
      case "player": {
        let i = _.str(a.playerId, { max: 128, label: "Player", pattern: wa }), d = Et(a.rtp, 1, 100, "RTP");
        o = await be.call(n, "/game/v5/set/player/rtp", { currencyCode: s, rtp: d, playerId: i }), r = { scope: "PLAYER", playerId: i, rtp: d, changed: o.data?.changedRtpValue };
        break;
      }
      case "batch": {
        let i = [...new Set((Array.isArray(a.playerIds) ? a.playerIds : []).map((c) => String(c).trim()).filter(Boolean))];
        if (!i.length || i.length > 50) throw _.bad("Provide 1-50 player IDs.");
        if (i.some((c) => !wa.test(c))) throw _.bad("One of the player IDs is invalid.");
        let d = Et(a.rtp, 1, 100, "RTP");
        o = await be.call(n, "/game/v5/batch/set/player/rtp", { currencyCode: s, rtp: d, playerIds: i }), r = { scope: "BATCH", playerIds: i, rtp: d, accepted: !0 };
        break;
      }
      case "effective": {
        let i = { currencyCode: s };
        a.subMerchantCode && (i.subMerchantCode = _.str(a.subMerchantCode, { max: 50, pattern: cn, label: "Sub-merchant" })), a.playerId && (i.playerId = _.str(a.playerId, { max: 128, pattern: wa, label: "Player" })), o = await be.call(n, "/game/v5/rtp/effective", i);
        break;
      }
      case "history": {
        let i = dn(a.startTime, "Start time"), d = dn(a.endTime, "End time");
        if (i.ms >= d.ms) throw _.bad("Start time must be before end time.");
        if (i.ms < Date.now() - 31 * 864e5) throw _.bad("Only the past month can be queried (PDF \xA75.4.4).");
        let c = { currencyCode: s, startTime: i.s, endTime: d.s, pageSize: Et(a.pageSize ?? 20, 1, 100, "Page size") };
        a.cursor && (c.cursor = _.str(a.cursor, { max: 200, label: "Cursor" })), a.subMerchantCode && (c.subMerchantCode = _.str(a.subMerchantCode, { max: 50, pattern: cn, label: "Sub-merchant" })), a.playerId && (c.playerId = _.str(a.playerId, { max: 128, pattern: wa, label: "Player" })), Array.isArray(a.playerIds) && a.playerIds.length && (c.playerIds = a.playerIds.slice(0, 50).map(String)), o = await be.call(n, "/game/v5/rtp/change/history", c);
        break;
      }
      default:
        throw _.bad("Unknown RTP action.");
    }
    return r && (await O.collection("agRtpChanges").add({ ...r, currencyCode: s, by: t, at: se.serverTimestamp() }), _.audit(null, t, "ag_rtp_change", r)), { ok: !0, data: o.data ?? {} };
  }));
  async function jr(e, { startIso: t, endIso: a, pageNum: n, pageSize: s, sort: o }) {
    let i = (await be.call(e, "/game/v5/game/record", { pageNum: n, pageSize: s, reqData: { startTime: t, endTime: a, sort: o } })).data?.gameRecordList || [];
    if (i.length) {
      let d = O.batch();
      for (let c of i) {
        if (c.orderNo === void 0 || c.orderNo === null) continue;
        let l = c.playerId || c.playerUniqueId || "", u = Number(c.betAmount) || 0, m = Number(c.winAmount) || 0;
        d.set(O.doc(`agGameRecords/${String(c.orderNo)}`), {
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
          syncedAt: se.serverTimestamp()
        }, { merge: !0 });
      }
      await d.commit();
    }
    return i;
  }
  me.adminAgGameRecords = xe({ region: ve, timeoutSeconds: 120 }, Je(async (e) => {
    _.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = await ot(), n = dn(t.startTime, "Start time"), s = dn(t.endTime, "End time");
    if (n.ms >= s.ms) throw _.bad("Start time must be before end time.");
    let o = await jr(a, { startIso: n.s, endIso: s.s, pageNum: Et(t.pageNum ?? 1, 1, 1e5, "Page"), pageSize: Et(t.pageSize ?? 20, 1, 100, "Page size"), sort: t.sort !== !1 });
    return { ok: !0, records: o, hasMore: o.length >= (Number(t.pageSize) || 20) };
  }));
  async function Gr(e) {
    let a = (await be.call(e, "/game/v5/merchant/info", {})).data || {}, n = a.apiType === 0 || a.apiType === "0" || a.apiType === "SINGLE_WALLET" ? "SINGLE_WALLET" : a.apiType === 1 || a.apiType === "1" || a.apiType === "TRANSFER_WALLET" ? "TRANSFER_WALLET" : String(a.apiType ?? ""), s = (a.walletInfos || []).map((i) => ({ billingMode: i.billingMode || "", rtp: Number(i.rtp) || null, currencyCode: i.currencyCode || "", balance: Number(i.balance) || 0 })), o = s.find((i) => i.currencyCode === e.currencyCode), r = {
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
      syncedAt: se.serverTimestamp()
    };
    return await O.doc("adminConfig/agMerchant").set(r), r;
  }
  me.adminAgMerchantInfo = xe({ region: ve, timeoutSeconds: 60 }, Je(async (e) => (_.requireRole(e, ["super", "finance"]), { ok: !0, merchant: { ...await Gr(await ot({ fresh: !0 })), syncedAt: Date.now() } })));
  me.adminAgReport = xe({ region: ve, timeoutSeconds: 60 }, Je(async (e) => {
    _.requireRole(e, ["super", "finance"]);
    let t = e.data || {}, a = Number(t.from) || Date.now() - 864e5, n = Number(t.to) || Date.now();
    if (a >= n || n - a > 400 * 864e5) throw _.bad("Invalid date range.");
    let s = O.collection("agBets").where("at", ">=", a).where("at", "<", n), [o, r, i, d] = await Promise.all([
      s.aggregate({ bets: zt.sum("betAmount"), wins: zt.sum("winAmount"), reversed: zt.sum("winReversed"), n: zt.count() }).get(),
      s.where("status", "==", "cancelled").aggregate({ refunded: zt.sum("betAmount"), n: zt.count() }).get(),
      O.collection("statsShards").get(),
      O.collection("agSessions").where("status", "==", "active").count().get()
    ]), c = o.data(), l = r.data(), u = (c.bets || 0) - (l.refunded || 0), m = (c.wins || 0) - (c.reversed || 0), p = {};
    return i.docs.filter((f) => f.id.startsWith("ag_")).forEach((f) => {
      for (let [h, y] of Object.entries(f.data())) p[h] = Math.round(((p[h] || 0) + (Number(y) || 0)) * 100) / 100;
    }), {
      ok: !0,
      range: { from: a, to: n },
      betCount: c.n || 0,
      cancelledCount: l.n || 0,
      turnover: Math.round(u * 100) / 100,
      payout: Math.round(m * 100) / 100,
      ggr: Math.round((u - m) * 100) / 100,
      rtpActual: u > 0 ? Math.round(m / u * 1e4) / 100 : null,
      activeSessions: d.data().count,
      lifetime: p
    };
  }));
  me.agScheduledSync = Br({ region: ve, schedule: "every 30 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    let e;
    try {
      e = await ot({ fresh: !0 });
    } catch {
      return;
    }
    try {
      await Gr(e);
    } catch (a) {
      console.error("merchant sync", a.message);
    }
    try {
      let a = /* @__PURE__ */ new Date(), n = new Date(a.getTime() - 40 * 6e4);
      for (let s = 1; s <= 50 && !((await jr(e, { startIso: n.toISOString(), endIso: a.toISOString(), pageNum: s, pageSize: 100, sort: !1 })).length < 100); s++)
        ;
    } catch (a) {
      console.error("records sync", a.message);
    }
    let t = await O.collection("agSessions").where("status", "==", "active").where("launchedAtMs", "<", Date.now() - 12 * 36e5).limit(400).get();
    if (!t.empty) {
      let a = O.batch();
      t.docs.forEach((n) => a.update(n.ref, { status: "expired", closedAt: se.serverTimestamp() })), await a.commit();
    }
  });
  me.agCleanup = Br({ region: ve, schedule: "every day 04:10", timeZone: "Asia/Dhaka", timeoutSeconds: 540 }, async () => {
    let e = /* @__PURE__ */ new Date();
    for (let t of ["agNonces", "agCallbackLogs", "agApiLogs"])
      for (let a = 0; a < 40; a++) {
        let n = await O.collection(t).where("expireAt", "<", e).limit(400).get();
        if (n.empty) break;
        let s = O.batch();
        n.docs.forEach((o) => s.delete(o.ref)), await s.commit();
      }
  });
  me.LOBBY = Bd;
});

// src/account.js
var Fr = E((ga) => {
  "use strict";
  var { onCall: ln } = ee(), Ee = z(), { db: Rt, admin: Ss, FieldValue: un, HttpsError: Gd, REGION: mn } = Ee;
  ga.setResponsibleGaming = ln({ region: mn }, async (e) => {
    let t = Ee.authUid(e), a = e.data || {}, n = Rt.doc(`users/${t}`), s = {};
    if (await Rt.runTransaction(async (o) => {
      let r = await o.get(n);
      Ee.assertActive(r.data());
      let i = { ...r.data().rg || {} }, d = Date.now();
      if (i.pendingLimitAt && i.pendingLimitAt <= d && (i.dailyDepositLimit = i.pendingLimit, delete i.pendingLimit, delete i.pendingLimitAt), a.dailyDepositLimit !== void 0) {
        let c = Number(a.dailyDepositLimit) || 0;
        if (c < 0 || c > 1e8) throw Ee.bad("Invalid limit.");
        let l = Number(i.dailyDepositLimit) || 0;
        c > 0 && (l === 0 || c < l) ? (i.dailyDepositLimit = Ee.round2(c), delete i.pendingLimit, delete i.pendingLimitAt, s.applied = "now") : c !== l && (i.pendingLimit = Ee.round2(c), i.pendingLimitAt = d + 24 * 36e5, s.applied = "in24h");
      }
      if (a.excludeDays !== void 0) {
        let c = Number(a.excludeDays);
        if (![1, 7, 30, 90, 180, 365].includes(c)) throw Ee.bad("Choose 1, 7, 30, 90, 180 or 365 days.");
        let l = d + c * 864e5, u = i.excludedUntil?.toMillis ? i.excludedUntil.toMillis() : Number(i.excludedUntil) || 0;
        i.excludedUntil = Math.max(u, l), s.excludedUntil = i.excludedUntil, o.set(Rt.doc(`agSessions/${t}`), { uid: t, status: "forced", forcedAt: un.serverTimestamp(), forceReason: "self-exclusion" }, { merge: !0 });
      }
      o.update(n, { rg: i }), s.rg = i;
    }), s.excludedUntil)
      try {
        let { loadConfig: o } = an();
        await hs().call(await o(), "/game/v5/player/force/logout", { playerId: t }, { retries: 1 });
      } catch (o) {
        console.warn("self-exclusion provider logout", o.message);
      }
    return { ok: !0, ...s };
  });
  ga.revokeMySessions = ln({ region: mn }, async (e) => {
    let t = Ee.authUid(e);
    return await Ss.auth().revokeRefreshTokens(t), await Rt.doc(`users/${t}`).set({ sessionsRevokedAt: un.serverTimestamp() }, { merge: !0 }), await Rt.collection("loginHistory").add({ uid: t, event: "logout_all", at: un.serverTimestamp() }), { ok: !0 };
  });
  ga.adminListStaff = ln({ region: mn }, async (e) => (Ee.requireRole(e, ["super"]), { staff: (await Rt.collection("users").where("role", "in", Ee.STAFF_ROLES).limit(100).get()).docs.map((a) => ({ uid: a.id, name: a.data().name || "", username: a.data().username || "", email: a.data().email || "", role: a.data().role, status: a.data().status, apps: a.data().staffApps || [] })) }));
  ga.adminSignOutUser = ln({ region: mn, timeoutSeconds: 60 }, async (e) => {
    let t = Ee.requireRole(e, ["super", "support"]), a = Ee.str((e.data || {}).uid, { max: 128, label: "User" });
    if (!await Ss.auth().getUser(a).catch(() => null)) throw new Gd("not-found", "User not found.");
    await Ss.auth().revokeRefreshTokens(a), await Rt.doc(`users/${a}`).set({ sessionsRevokedAt: un.serverTimestamp() }, { merge: !0 });
    try {
      let { loadConfig: s } = an(), { forceLogoutOne: o } = ks();
      await o(await s(), a, t, { reason: "Signed out by support" });
    } catch (s) {
      console.warn("provider logout", s.message);
    }
    return Ee.audit(null, t, "user_signed_out", { uid: a }), { ok: !0 };
  });
});

// src/fswrite.js
var Yr = E((Vr) => {
  "use strict";
  var { onCall: Fd } = ee(), Mt = z(), { db: Hr, HttpsError: zr, REGION: Hd } = Mt, { merge: Wr, setPath: Wd, plain: zd } = ta(), Te = (e) => typeof e == "number" && Number.isFinite(e), Xe = (e) => typeof e == "string", vs = (e) => {
    let t = e.auth && e.auth.token || {};
    return t.admin === !0 ? t.role : null;
  }, Oe = (e, t) => t.includes(vs(e)) || vs(e) === "staff" && e.__path && aa().staffMayWrite(e.auth.token, e.__path), Kr = (e) => new zr("permission-denied", e || "You do not have permission."), Kd = (e, t) => [.../* @__PURE__ */ new Set([...Object.keys(e || {}), ...Object.keys(t || {})])].filter((n) => JSON.stringify((e || {})[n]) !== JSON.stringify((t || {})[n])), pn = (e, t, a) => Kd(e, t).every((n) => a.includes(n)), R = (e, t) => {
    if (!e) throw Kr(t);
  };
  function Vd(e, t, a, n, s, o) {
    e.__path = a;
    let r = a.split("/"), i = vs(e) !== null;
    if (r[0] === "users" && r.length === 2) {
      R(n === "update" && t === r[1], "Not allowed."), R(pn(s, o, ["name", "phone", "photoURL", "lastSeenAt"]), "You cannot change that field."), R(Xe(o.name) && o.name.length >= 2 && o.name.length <= 60, "Name must be 2-60 characters."), R(Xe(o.phone) && /^\+?[0-9]{8,15}$/.test(o.phone), "Invalid phone number."), R(Xe(o.photoURL) && o.photoURL.length < 600, "Invalid photo.");
      return;
    }
    if (r[0] === "users" && r[2] === "notifications" && r.length === 4) {
      if (R(t === r[1], "Not allowed."), n === "delete") return;
      R(n === "update" && pn(s, o, ["read"]) && typeof o.read == "boolean", "Not allowed.");
      return;
    }
    if (r[0] === "users" && r[2] === "devices" && r.length === 4) {
      if (R(t === r[1], "Not allowed."), n === "delete") return;
      R(Object.keys(o).every((d) => ["platform", "updatedAt"].includes(d)) && Xe(o.platform), "Invalid device.");
      return;
    }
    if (r[0] === "users" && r[2] === "private" && r[3] === "withdrawAccounts" && r.length === 4) {
      if (R(t === r[1], "Not allowed."), n === "delete") return;
      R(Object.keys(o).every((d) => ["list", "updatedAt"].includes(d)) && Array.isArray(o.list) && o.list.length <= 6, "Invalid saved accounts.");
      return;
    }
    if (r[0] === "paymentMethods" && r.length === 2) {
      if (R(Oe(e, ["super", "finance"])), n === "delete") return;
      R(Xe(o.name) && o.name.length > 0 && o.name.length <= 60 && typeof o.enabled == "boolean", "Invalid payment method."), R(o.type === void 0 || ["deposit", "withdraw", "both"].includes(o.type), "Invalid type."), R(o.minAmount === void 0 || Te(o.minAmount) && o.minAmount >= 0, "Invalid minimum."), R(o.cardChangeFee === void 0 || Te(o.cardChangeFee) && o.cardChangeFee >= 0 && o.cardChangeFee <= 1e5, "Invalid card change fee."), R(o.cardLock === void 0 || typeof o.cardLock == "boolean", "Invalid card lock."), R(["logo", "cardBg"].every((d) => o[d] === void 0 || Xe(o[d]) && o[d].length <= 300), "Invalid logo.");
      return;
    }
    if (r[0] === "paymentAccounts" && r.length === 2) {
      if (R(Oe(e, ["super", "finance"])), n === "delete") return;
      R(Xe(o.methodId) && Xe(o.accountNumber) && ["active", "standby", "cooldown", "paused", "disabled", "maintenance", "locked", "archived"].includes(o.status) && Te(o.dailyLimit) && Te(o.monthlyLimit), "Invalid payment account."), R(["bankName", "branch"].every((d) => o[d] === void 0 || typeof o[d] == "string" && o[d].length <= 60), "Invalid bank details."), R(o.cycleLimit === void 0 || Te(o.cycleLimit) && o.cycleLimit >= 0 && o.cycleLimit <= 1e8, "Invalid cycle limit."), R(o.cooldownDays === void 0 || Te(o.cooldownDays) && o.cooldownDays >= 0 && o.cooldownDays <= 365, "Invalid cooldown.");
      return;
    }
    if (r[0] === "paymentAccounts" && r[2] === "private" && r.length === 4) {
      R(Oe(e, ["super", "finance"]));
      return;
    }
    if ((r[0] === "banners" || r[0] === "legal") && r.length === 2) {
      R(Oe(e, ["super", "content"]));
      return;
    }
    if (r[0] === "bonuses" && r.length === 2) {
      if (R(Oe(e, ["super", "content", "finance"])), n === "delete") return;
      R(Xe(o.title) && Te(o.amount) && o.amount > 0 && o.amount <= 1e6 && ["once", "daily", "weekly", "monthly"].includes(o.type) && typeof o.enabled == "boolean", "Invalid bonus."), R(o.kind === void 0 || ["fixed", "random", "lucky"].includes(o.kind), "Invalid bonus kind."), R(o.maxAmount === void 0 || Te(o.maxAmount) && o.maxAmount >= o.amount && o.maxAmount <= 1e6, "Maximum must be \u2265 minimum (up to 1,000,000)."), R(o.prizes === void 0 || Array.isArray(o.prizes) && o.prizes.length <= 12 && o.prizes.every((d) => d && Te(d.amount) && d.amount > 0 && d.amount <= 1e6 && Te(d.weight) && d.weight > 0 && d.weight <= 1e5), "Invalid prizes (max 12)."), R(o.kind !== "lucky" || Array.isArray(o.prizes) && o.prizes.length >= 2, "A lucky draw needs at least 2 prizes.");
      return;
    }
    if (r[0] === "lotteries" && r.length === 2) {
      if (R(Oe(e, ["super", "content"])), n === "delete") {
        R(s && s.sold === 0, "Tickets were already sold.");
        return;
      }
      if (!s) {
        R(o.sold === 0 && o.status === "open" && Te(o.price) && Te(o.prize) && Te(o.totalTickets), "Invalid lottery.");
        return;
      }
      R(pn(s, o, ["title", "price", "prize", "endsAt", "totalTickets", "maxPerUser", "imageUrl", "status", "autoDraw"]), "You cannot change that field."), R(["open", "closed"].includes(o.status) && ["open", "closed"].includes(s.status) && o.totalTickets >= s.sold, "Invalid lottery.");
      return;
    }
    if (r[0] === "games" && r.length === 2) {
      R(n === "update" && Oe(e, ["super", "content"]) && pn(s, o, ["enabled", "featured", "sort", "lobbyCategory", "name", "imageUrl"]), "Not allowed.");
      return;
    }
    if (r[0] === "settings" && r.length === 2 && /^ban_/.test(r[1])) {
      if (R(Oe(e, ["super", "content"]) && /^ban_[a-z0-9_]{2,40}$/.test(r[1]), "Not allowed."), n === "delete") return;
      R(Xe(o.data) && /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(o.data) && o.data.length <= 7e5 && Te(o.v), "Picture must be a WEBP/JPG/PNG under 500 KB.");
      return;
    }
    if (r[0] === "settings" && r.length === 2) {
      let d = r[1];
      R(d === "support" && Oe(e, ["super", "support"]) || d === "content" && Oe(e, ["super", "content", "support"]) || d === "site" && Oe(e, ["super", "finance"]) || !["support", "content", "site"].includes(d) && Oe(e, ["super"]), "Not allowed.");
      return;
    }
    throw Kr("Not allowed.");
  }
  Vr.fsWrite = Fd({ region: Hd }, async (e) => {
    let t = Mt.authUid(e), a = (e.data || {}).ops;
    if (!Array.isArray(a) || !a.length || a.length > 400) throw Mt.bad("Invalid request.");
    return await Hr.runTransaction(async (n) => {
      let s = [];
      for (let o of a) {
        let r = Mt.str(o.path, { max: 300, label: "Path" });
        if (!/^[A-Za-z0-9_\-./]+$/.test(r) || r.includes("..") || r.split("/").length % 2 !== 0) throw Mt.bad("Invalid path.");
        let i = Hr.doc(r), d = await n.get(i), c = d.exists ? d.data() : void 0, l = o.op === "create" ? "set" : o.op;
        if (!["set", "update", "delete"].includes(l)) throw Mt.bad("Invalid operation.");
        let u;
        if (l === "delete") u = void 0;
        else {
          let m = zd(o.data || {});
          if (typeof m != "object" || Array.isArray(m)) throw Mt.bad("Invalid data.");
          if (l === "update") {
            if (!c) throw new zr("not-found", "Document not found.");
            u = JSON.parse(JSON.stringify(c));
            for (let [p, f] of Object.entries(m)) Wd(u, p, f);
          } else u = o.merge && c ? Wr(JSON.parse(JSON.stringify(c)), m) : Wr({}, m);
        }
        Vd(e, t, r, l === "delete" ? "delete" : c ? "update" : "create", c, u), s.push({ ref: i, type: l, data: o.data, merge: !!o.merge });
      }
      for (let o of s)
        o.type === "delete" ? n.delete(o.ref) : o.type === "update" ? n.update(o.ref, o.data) : n.set(o.ref, o.data, { merge: o.merge });
    }), { ok: !0 };
  });
});

// src/rotation.js
var Qr = E((ya) => {
  "use strict";
  var { onCall: _s } = ee(), { onSchedule: Yd } = Ht(), Re = z(), fn = Wn(), { db: je, FieldValue: Jd, HttpsError: Ts, REGION: hn } = Re, wn = fn.n0, Jr = async () => {
    let e = await Re.siteSettings();
    return Math.max(1, wn((e.deposit || {}).min) || 1);
  }, Xr = (e) => e && typeof e.toMillis == "function" ? e.toMillis() : wn(e);
  async function Zr(e = Date.now()) {
    let t = await Jr(), a = await je.collection("paymentMethods").get(), n = 0;
    for (let i of a.docs)
      (await je.runTransaction((c) => fn.rotateTx(c, i.id, { now: e, min: t, reason: "tick" }))).changed.length && n++;
    let s = await Re.siteSettings(), o = wn((s.deposit || {}).expireHours), r = 0;
    if (o > 0) {
      let i = await je.collection("deposits").where("status", "==", "pending").limit(200).get();
      for (let d of i.docs) {
        let c = d.data();
        if (!c.createdAt || Xr(c.createdAt) > e - o * 36e5) continue;
        await je.runTransaction(async (u) => {
          let m = await u.get(d.ref);
          return !m.exists || m.data().status !== "pending" ? !1 : (c.accountId && await fn.rotateTx(u, c.methodId, { now: e, min: t, settle: { accountId: c.accountId, amount: c.amount, outcome: "release" } }), u.update(d.ref, { status: "expired", note: "Expired: not reviewed in time", reviewedAt: Jd.serverTimestamp(), reviewedBy: "system" }), Re.notify(u, c.uid, "Deposit expired", "Your deposit request expired. Please contact support if you already paid.", "deposit"), Re.bumpStats(u, { pendingDeposits: -1 }), Re.audit(u, "system", "deposit_expired", { depositId: d.id, amount: c.amount }), !0);
        }) && r++;
      }
    }
    return { rotated: n, expired: r };
  }
  ya.paymentRotationTick = Yd({ region: hn, schedule: "every 10 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    await Zr();
  });
  ya.paymentSync = _s({ region: hn }, async (e) => {
    let t = Re.authUid(e), a = e.auth.token.admin === !0 && (["super", "finance"].includes(e.auth.token.role) || e.auth.token.role === "staff" && aa().limOf(e.auth.token).includes("payments")), n = je.doc("system/paymentTick"), s = await n.get(), o = s.exists ? wn(s.data().at) : 0;
    return !(a && (e.data || {}).force) && Date.now() - o < 45e3 ? { ok: !0, skipped: !0 } : (await n.set({ at: Date.now(), by: t }, { merge: !0 }), { ok: !0, ...await Zr() });
  });
  var Xd = ["activate", "pause", "resume", "reset"];
  ya.paymentAccountAction = _s({ region: hn }, async (e) => {
    let t = Re.requireRole(e, ["super", "finance"]), a = e.data || {}, n = Re.str(a.accountId, { max: 120, label: "Account" }), s = a.action;
    if (!Xd.includes(s)) throw Re.bad("Invalid action.");
    let o = await Jr(), i = await je.doc(`paymentAccounts/${n}`).get();
    if (!i.exists) throw new Ts("not-found", "Account not found.");
    let d = i.data().methodId;
    return await je.runTransaction(async (c) => {
      let u = (await fn.rotateTx(c, d, { now: Date.now(), min: o, force: { [s]: n }, reason: "manual" })).accounts.find((m) => m.id === n);
      if (!u) throw new Ts("not-found", "Account not found.");
      Re.audit(c, t, `payment_account_${s}`, { accountId: n, number: u.accountNumber || "", methodId: d });
    }).catch((c) => {
      throw c;
    }), { ok: !0 };
  });
  ya.paymentAccountHistory = _s({ region: hn }, async (e) => {
    Re.requireRole(e, ["super", "finance"]);
    let t = Re.str((e.data || {}).accountId, { max: 120, label: "Account" }), a = await je.doc(`paymentAccounts/${t}`).get();
    if (!a.exists) throw new Ts("not-found", "Account not found.");
    let [n, s, o] = await Promise.all([
      je.collection("paymentCycles").where("accountId", "==", t).get(),
      je.collection("deposits").where("accountId", "==", t).limit(200).get(),
      je.collection("paymentRotationLogs").where("methodId", "==", a.data().methodId).limit(200).get()
    ]), r = (i) => JSON.parse(JSON.stringify(i));
    return {
      cycles: n.docs.map((i) => r(i.data())).sort((i, d) => d.cycleNo - i.cycleNo),
      deposits: s.docs.map((i) => ({ id: i.id, amount: i.data().amount, status: i.data().status, trxId: i.data().trxId, username: i.data().username, at: Xr(i.data().createdAt) })).sort((i, d) => d.at - i.at).slice(0, 100),
      logs: o.docs.map((i) => r(i.data())).filter((i) => i.oldAccountId === t || i.newAccountId === t).sort((i, d) => d.at - i.at).slice(0, 50)
    };
  });
});

// src/payout.js
var ti = E((Pe) => {
  "use strict";
  var { onCall: Ge } = ee(), C = z(), $s = Zn(), ba = ca().helpers, { db: Z, FieldValue: pe, HttpsError: we, REGION: Fe } = C, te = $s.n0, _e = (e) => Z.doc(`payoutAgents/${e}`), Yt = ["super", "finance"], Vt = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0;
  async function Cs(e) {
    let t = C.requireRole(e, ["payout"]), a = await _e(t).get();
    if (!a.exists || a.data().active === !1) throw new we("permission-denied", "Your payout access is turned off.");
    return t;
  }
  var Zd = (e, t) => ({
    id: e,
    methodId: t.methodId,
    methodName: t.methodName,
    accountNumber: t.accountNumber,
    holderName: t.holderName || "",
    bankName: t.bankName || "",
    branch: t.branch || "",
    amount: t.net,
    stage: t.stage,
    createdAt: Vt(t.createdAt),
    assignedAt: Vt(t.assignedAt),
    reviewNote: t.reviewNote || "",
    paidAt: Vt(t.paidAt),
    payTrxId: t.payTrxId || "",
    hasProof: !!t.proofKey,
    status: t.status
  });
  Pe.payoutMyTasks = Ge({ region: Fe }, async (e) => {
    let t = await Cs(e), n = (await Z.collection("withdrawals").where("assignedTo", "==", t).limit(300).get()).docs.map((r) => Zd(r.id, r.data())), s = (await _e(t).get()).data() || {}, o = $s.startOfDhakaDay().getTime();
    return {
      open: n.filter((r) => r.status === "pending" && r.stage === "assigned").sort((r, i) => r.assignedAt - i.assignedAt),
      review: n.filter((r) => r.status === "pending" && r.stage === "paid_review").sort((r, i) => i.paidAt - r.paidAt),
      done: n.filter((r) => r.status === "approved").sort((r, i) => i.paidAt - r.paidAt).slice(0, 50),
      today: n.filter((r) => r.status === "approved" && r.paidAt >= o).reduce((r, i) => ({ count: r.count + 1, total: C.round2(r.total + te(i.amount)) }), { count: 0, total: 0 }),
      me: { name: s.name || "", methods: s.methods || [], ...gn(s) },
      storage: ba.configured()
    };
  });
  function gn(e) {
    let t = te(e.floatGiven), a = te(e.floatReturned), n = te(e.paidTotal), s = te(e.reviewTotal);
    return { floatGiven: t, floatReturned: a, paidTotal: n, paidCount: te(e.paidCount), reviewTotal: s, reviewCount: te(e.reviewCount), remaining: C.round2(t - a - n - s), openCount: Math.max(0, te(e.openCount)) };
  }
  Pe.payoutMarkPaid = Ge({ region: Fe }, async (e) => {
    let t = await Cs(e), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = C.str(a.trxId, { min: 4, max: 40, label: "Transaction ID", pattern: /^[A-Za-z0-9_-]+$/ }).toUpperCase(), o = typeof a.fromNumber == "string" ? a.fromNumber.replace(/[^0-9+]/g, "").slice(0, 20) : "", r = typeof a.proofKey == "string" ? a.proofKey.trim() : "";
    if (ba.configured()) {
      if (!r) throw C.bad("Please upload the payment screenshot.");
      if (!ba.safeKey(r) || !r.startsWith(`payouts/${n}/${t}-`)) throw C.bad("Invalid screenshot.");
      await ba.verifyImage(r);
    }
    return await Z.runTransaction(async (i) => {
      let d = Z.doc(`withdrawals/${n}`), c = await i.get(d), l = c.exists ? c.data() : null;
      if (!l || l.assignedTo !== t) throw new we("permission-denied", "This task is not assigned to you.");
      if (l.status !== "pending" || l.stage !== "assigned") throw new we("failed-precondition", "This task is not waiting for payment.");
      i.update(d, { stage: "paid_review", paidBy: t, paidAt: Date.now(), payTrxId: s, fromNumber: o, proofKey: r, reviewNote: "" }), i.update(_e(t), { reviewTotal: pe.increment(te(l.net)), reviewCount: pe.increment(1), openCount: pe.increment(-1), lastPaidAt: Date.now() }), C.audit(i, t, "payout_paid", { withdrawalId: n, net: l.net, trx: s });
    }), { ok: !0 };
  });
  Pe.payoutReturn = Ge({ region: Fe }, async (e) => {
    let t = await Cs(e), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = C.str(a.reason, { min: 3, max: 200, label: "Reason" });
    return await Z.runTransaction(async (o) => {
      let r = Z.doc(`withdrawals/${n}`), i = await o.get(r), d = i.exists ? i.data() : null;
      if (!d || d.assignedTo !== t) throw new we("permission-denied", "This task is not assigned to you.");
      if (d.status !== "pending" || d.stage !== "assigned") throw new we("failed-precondition", "You can only return a task you have not paid yet.");
      o.update(r, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null, returnReason: s, returnedBy: t, returnedAt: Date.now() }), o.update(_e(t), { openCount: pe.increment(-1), returnedCount: pe.increment(1) }), C.audit(o, t, "payout_returned", { withdrawalId: n, reason: s });
    }), { ok: !0 };
  });
  async function ei(e, t, a) {
    await Z.runTransaction(async (n) => {
      let s = Z.doc(`withdrawals/${e}`), [o, r] = await Promise.all([n.get(s), n.get(_e(t))]), i = o.exists ? o.data() : null;
      if (!r.exists || r.data().active === !1) throw new we("failed-precondition", "That agent is not active.");
      if (!i || i.status !== "pending") throw new we("failed-precondition", "This request is no longer pending.");
      if (i.stage === "paid_review") throw new we("failed-precondition", "Already paid \u2014 waiting for review.");
      i.assignedTo !== t && (i.assignedTo && n.update(_e(i.assignedTo), { openCount: pe.increment(-1) }), n.update(s, { stage: "assigned", assignedTo: t, assignedName: r.data().name || "", assignedAt: Date.now(), assignedBy: a }), n.update(_e(t), { openCount: pe.increment(1) }), C.notify(n, t, "New payout task", `Send ${i.net} by ${i.methodName}.`, "payout"));
    });
  }
  Pe.payoutAssign = Ge({ region: Fe }, async (e) => {
    let t = C.requireRole(e, Yt), a = e.data || {}, n = Array.isArray(a.withdrawalIds) ? a.withdrawalIds.slice(0, 100).map((r) => C.str(r, { max: 80 })) : [];
    if (!n.length) throw C.bad("Pick at least one request.");
    let s = C.str(a.agentUid, { max: 80, label: "Agent" }), o = { ok: 0, failed: [] };
    for (let r of n)
      try {
        await ei(r, s, t), o.ok++;
      } catch (i) {
        o.failed.push({ id: r, error: i.message });
      }
    return C.audit(null, t, "payout_assign", { agentUid: s, count: o.ok }), o;
  });
  Pe.payoutAutoAssign = Ge({ region: Fe }, async (e) => {
    let t = C.requireRole(e, Yt), a = e.data || {}, n = a.mode === "method" ? "method" : "equal", s = Array.isArray(a.agentUids) && a.agentUids.length ? new Set(a.agentUids.map(String)) : null, o = (await Z.collection("payoutAgents").where("active", "==", !0).get()).docs.map((d) => ({ uid: d.id, methods: d.data().methods || [], load: Math.max(0, te(d.data().openCount)) })).filter((d) => !s || s.has(d.uid));
    if (!o.length) throw new we("failed-precondition", "No active payout agents.");
    let r = (await Z.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.filter((d) => !d.data().assignedTo && d.data().stage !== "paid_review").sort((d, c) => Vt(d.data().createdAt) - Vt(c.data().createdAt)), i = { ok: 0, skipped: 0, failed: [] };
    for (let d of r) {
      let c = n === "method" ? o.filter((u) => !u.methods.length || u.methods.includes(d.data().methodId)) : o;
      if (!c.length) {
        i.skipped++;
        continue;
      }
      let l = c.reduce((u, m) => m.load < u.load ? m : u, c[0]);
      try {
        await ei(d.id, l.uid, t), l.load++, i.ok++;
      } catch (u) {
        i.failed.push({ id: d.id, error: u.message });
      }
    }
    return C.audit(null, t, "payout_auto_assign", { mode: n, count: i.ok }), i;
  });
  Pe.payoutUnassign = Ge({ region: Fe }, async (e) => {
    let t = C.requireRole(e, Yt), a = C.str((e.data || {}).withdrawalId, { max: 80 });
    return await Z.runTransaction(async (n) => {
      let s = Z.doc(`withdrawals/${a}`), o = await n.get(s), r = o.exists ? o.data() : null;
      if (!r || r.status !== "pending" || !r.assignedTo) throw new we("failed-precondition", "Nothing to unassign.");
      if (r.stage === "paid_review") throw new we("failed-precondition", "Already paid \u2014 review it instead.");
      n.update(s, { stage: "new", assignedTo: null, assignedName: "", assignedAt: null }), n.update(_e(r.assignedTo), { openCount: pe.increment(-1) }), C.audit(n, t, "payout_unassign", { withdrawalId: a });
    }), { ok: !0 };
  });
  Pe.payoutReview = Ge({ region: Fe }, async (e) => {
    let t = C.requireRole(e, Yt), a = e.data || {}, n = C.str(a.withdrawalId, { max: 80 }), s = a.action;
    if (!["approve", "send_back"].includes(s)) throw C.bad("Invalid action.");
    let o = typeof a.note == "string" ? a.note.trim().slice(0, 300) : "";
    if (s === "send_back" && o.length < 3) throw C.bad("Write why it is sent back.");
    return await Z.runTransaction(async (r) => {
      let i = Z.doc(`withdrawals/${n}`), d = await r.get(i), c = d.exists ? d.data() : null;
      if (!c || c.status !== "pending" || c.stage !== "paid_review") throw new we("failed-precondition", "This payment is not waiting for review.");
      if (c.paidBy === t) throw new we("permission-denied", "You cannot approve a payment you made yourself.");
      let l = te(c.net);
      s === "approve" ? ($s.finalize(r, i, c, !0, t, o, { approvedBy: t }), r.update(_e(c.paidBy), { reviewTotal: pe.increment(-l), reviewCount: pe.increment(-1), paidTotal: pe.increment(l), paidCount: pe.increment(1) })) : (r.update(i, { stage: "assigned", reviewNote: o, sentBackAt: Date.now(), sentBackBy: t }), r.update(_e(c.paidBy), { reviewTotal: pe.increment(-l), reviewCount: pe.increment(-1), openCount: pe.increment(1) }), C.notify(r, c.paidBy, "Payout sent back", o, "payout")), C.audit(r, t, s === "approve" ? "payout_approved" : "payout_sent_back", { withdrawalId: n, net: l, agent: c.paidBy });
    }), { ok: !0 };
  });
  Pe.payoutAgents = Ge({ region: Fe }, async (e) => {
    C.requireRole(e, Yt);
    let t = await Z.collection("payoutAgents").limit(50).get(), a = (await Z.collection("withdrawals").where("status", "==", "pending").limit(500).get()).docs.map((o) => ({ id: o.id, ...o.data() })), n = t.docs.map((o) => {
      let r = o.data(), i = a.filter((d) => d.assignedTo === o.id);
      return {
        uid: o.id,
        name: r.name || "",
        email: r.email || "",
        active: r.active !== !1,
        methods: r.methods || [],
        ...gn(r),
        openCount: i.filter((d) => d.stage === "assigned").length,
        reviewCount: i.filter((d) => d.stage === "paid_review").length,
        lastPaidAt: te(r.lastPaidAt)
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
      createdAt: Vt(o.createdAt),
      paidBy: o.paidBy || "",
      paidAt: te(o.paidAt),
      payTrxId: o.payTrxId || "",
      fromNumber: o.fromNumber || "",
      proofKey: o.proofKey || "",
      returnReason: o.returnReason || "",
      reviewNote: o.reviewNote || ""
    })).sort((o, r) => o.createdAt - r.createdAt);
    return { agents: n, queue: s, storage: ba.configured() };
  });
  Pe.payoutAgentSave = Ge({ region: Fe }, async (e) => {
    let t = C.requireRole(e, ["super"]), a = e.data || {}, n = C.str(a.agentUid, { max: 80 }), s = _e(n);
    if (!(await s.get()).exists) throw new we("not-found", "Agent not found.");
    let r = {};
    return typeof a.active == "boolean" && (r.active = a.active), Array.isArray(a.methods) && (r.methods = a.methods.slice(0, 20).map((i) => C.str(i, { max: 80 }))), await s.update(r), C.audit(null, t, "payout_agent_save", { uid: n, ...r }), { ok: !0 };
  });
  Pe.payoutFloat = Ge({ region: Fe }, async (e) => {
    let t = C.requireRole(e, ["super"]), a = e.data || {}, n = C.str(a.agentUid, { max: 80 }), s = C.amountOf(a.amount, { max: 1e8 }), o = a.direction === "take" ? "take" : "give", r = typeof a.note == "string" ? a.note.trim().slice(0, 200) : "";
    return await Z.runTransaction(async (i) => {
      let d = await i.get(_e(n));
      if (!d.exists) throw new we("not-found", "Agent not found.");
      if (o === "take" && s > gn(d.data()).remaining + 1e-9) throw C.bad("Cannot take back more than the agent has left.");
      i.update(_e(n), o === "give" ? { floatGiven: pe.increment(s) } : { floatReturned: pe.increment(s) }), i.set(Z.collection("payoutFloat").doc(), { agentUid: n, amount: s, direction: o, note: r, by: t, at: Date.now() }), C.audit(i, t, "payout_float", { uid: n, amount: s, dir: o });
    }), { ok: !0 };
  });
  Pe.payoutReport = Ge({ region: Fe }, async (e) => {
    C.requireRole(e, Yt);
    let t = e.data || {}, a = C.str(t.agentUid, { max: 80 }), n = te(t.from), s = te(t.to) || Date.now() + 864e5, o = await _e(a).get();
    if (!o.exists) throw new we("not-found", "Agent not found.");
    let r = (await Z.collection("withdrawals").where("paidBy", "==", a).limit(1e3).get()).docs.map((c) => ({ id: c.id, ...c.data() })).filter((c) => te(c.paidAt) >= n && te(c.paidAt) <= s).map((c) => ({ id: c.id, methodName: c.methodName, accountNumber: c.accountNumber, net: c.net, status: c.status, stage: c.stage, payTrxId: c.payTrxId || "", fromNumber: c.fromNumber || "", proofKey: c.proofKey || "", paidAt: te(c.paidAt), approvedBy: c.approvedBy || c.reviewedBy || "" })).sort((c, l) => l.paidAt - c.paidAt), i = (await Z.collection("payoutFloat").where("agentUid", "==", a).limit(300).get()).docs.map((c) => c.data()).sort((c, l) => l.at - c.at), d = {};
    for (let c of r.filter((l) => l.status === "approved")) {
      let l = c.accountNumber;
      d[l] = d[l] || { accountNumber: l, methodName: c.methodName, count: 0, total: 0 }, d[l].count++, d[l].total = C.round2(d[l].total + te(c.net));
    }
    return { agent: { uid: a, name: o.data().name || "", ...gn(o.data()) }, rows: r, float: i, byNumber: Object.values(d).sort((c, l) => l.total - c.total) };
  });
});

// src/community.js
var ii = E((Jt) => {
  "use strict";
  var { onCall: Sa } = ee(), H = z(), { db: Q, FieldValue: ai, HttpsError: Ns, REGION: va } = H, si = 24 * 36e5, Qd = 6 * 36e5, ni = (e) => new Date(e + Qd).toISOString().slice(0, 10), ka = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0, L = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, eu = ["super", "finance", "support"];
  async function oi() {
    let e = await Q.doc("settings/content").get();
    return e.exists ? e.data() : {};
  }
  var tu = (e) => (Array.isArray(e) ? e : []).slice(0, 7).map((t) => Math.max(0, Math.min(1e5, Math.round(L(t)))));
  function ri(e, t, a) {
    let n = tu(e && e.rewards), s = !!(e && e.enabled) && n.some((u) => u > 0), o = ni(a), r = ni(a - si), i = t ? L(t.streak) : 0, d = t ? t.lastDay : "", c = d === o;
    !c && d !== r && (i = 0);
    let l = i % 7;
    return { enabled: s, rewards: n, streak: i, claimedToday: c, today: o, nextIndex: l, lastDay: d || "" };
  }
  Jt.checkinStatus = Sa({ region: va }, async (e) => {
    let t = H.authUid(e), [a, n] = await Promise.all([oi(), Q.doc(`bonusClaims/${t}_checkin`).get()]), s = ri(a.checkin, n.exists ? n.data() : null, Date.now());
    return { enabled: s.enabled, rewards: s.rewards, streak: s.streak, claimedToday: s.claimedToday, nextIndex: s.nextIndex };
  });
  Jt.claimCheckin = Sa({ region: va }, async (e) => {
    await Gt().requireFeature("checkin");
    let t = H.requireVerified(e), a = 0, n = 0, s = 0;
    return await Q.runTransaction(async (o) => {
      let [r, i, d] = await Promise.all([o.get(Q.doc("settings/content")), o.get(Q.doc(`users/${t}`)), o.get(Q.doc(`bonusClaims/${t}_checkin`))]);
      H.assertActive(i.data());
      let c = Date.now(), l = ri((r.exists ? r.data() : {}).checkin, d.exists ? d.data() : null, c);
      if (!l.enabled) throw new Ns("failed-precondition", "Daily check-in is not available right now.");
      if (l.claimedToday) throw new Ns("failed-precondition", "You already checked in today. Come back tomorrow.");
      n = l.nextIndex, s = l.streak + 1, a = H.round2(l.rewards[n] || 0), a > 0 && (H.applyDelta(o, i.ref, { main: a }), H.ledger(o, { uid: t, type: "bonus", direction: "in", amount: a, bucket: "main", note: `Daily check-in \xB7 day ${n + 1}`, ref: "checkin" }), H.bumpStats(o, { bonusPaid: a })), o.set(d.ref, { uid: t, bonusId: "checkin", lastDay: l.today, streak: s, best: Math.max(s, L(d.exists ? d.data().best : 0)), lastClaimAt: ai.serverTimestamp(), lastClaimMs: c, lastAmount: a, count: ai.increment(1) }, { merge: !0 });
    }), { ok: !0, amount: a, day: n, streak: s };
  });
  var au = (e) => {
    let t = String(e || "").trim();
    return t ? t.slice(0, Math.min(2, t.length)) + "***" : "Player";
  }, Aa = { at: 0, data: null };
  Jt.publicBoard = Sa({ region: va }, async (e) => {
    H.authUid(e);
    let t = (await oi()).board || {};
    if (!t.enabled) return { enabled: !1, weekly: [], latest: [] };
    if (Aa.data && Date.now() - Aa.at < 6e4 && Aa.min === L(t.minShow)) return Aa.data;
    let a = Math.max(0, L(t.minShow)), n = Date.now() - 7 * si, o = (await Q.collection("transactions").where("type", "in", ["win", "game_win"]).where("createdAt", ">=", n).orderBy("createdAt", "desc").limit(4e3).get()).docs.map((m) => m.data()).filter((m) => L(m.amount) >= a && L(m.amount) > 0), r = /* @__PURE__ */ new Map();
    for (let m of o) {
      let p = r.get(m.uid);
      (!p || L(m.amount) > p.amount) && r.set(m.uid, { uid: m.uid, amount: L(m.amount), game: m.note || "" });
    }
    let i = [...r.values()].sort((m, p) => p.amount - m.amount).slice(0, 10), d = o.slice(0, 20), c = [.../* @__PURE__ */ new Set([...i.map((m) => m.uid), ...d.map((m) => m.uid)])], l = /* @__PURE__ */ new Map();
    await Promise.all(c.map(async (m) => {
      let p = await Q.doc(`users/${m}`).get(), f = p.exists ? p.data() : {};
      l.set(m, au(f.username || f.name));
    }));
    let u = {
      enabled: !0,
      weekly: i.map((m) => ({ name: l.get(m.uid), amount: m.amount, game: m.game })),
      latest: d.map((m) => ({ name: l.get(m.uid), amount: L(m.amount), game: m.note || "", at: ka(m.createdAt) }))
    };
    return Aa = { at: Date.now(), data: u, min: L(t.minShow) }, u;
  });
  var He = ["main", "winning", "referral", "commission"];
  Jt.adminReconcile = Sa({ region: va, timeoutSeconds: 120 }, async (e) => {
    H.requireRole(e, ["super", "finance"]);
    let t = 6e4, [a, n] = await Promise.all([Q.collection("users").limit(2e4).get(), Q.collection("transactions").orderBy("createdAt", "desc").limit(t).get()]), s = /* @__PURE__ */ new Map();
    for (let l of n.docs) {
      let u = l.data();
      if (!u.uid) continue;
      let m = L(u.amount) * (u.direction === "out" ? -1 : 1), p = He.includes(u.bucket) ? u.bucket : "main", f = s.get(u.uid) || { main: 0, winning: 0, referral: 0, commission: 0 };
      f[p] += m, s.set(u.uid, f);
    }
    let o = await Q.collection("userBooks").limit(5e4).get();
    for (let l of o.docs) {
      let u = l.data().carry;
      if (!u) continue;
      let m = s.get(l.id) || { main: 0, winning: 0, referral: 0, commission: 0 };
      for (let p of He) m[p] += L(u[p]);
      s.set(l.id, m);
    }
    let r = n.docs.length >= t, i = { main: 0, winning: 0, referral: 0, commission: 0 }, d = [];
    for (let l of a.docs) {
      let u = l.data(), m = u.balances || {};
      for (let y of He) i[y] += L(m[y]);
      let p = s.get(l.id) || { main: 0, winning: 0, referral: 0, commission: 0 }, f = {}, h = !1;
      for (let y of He)
        f[y] = H.round2(L(m[y]) - p[y]), Math.abs(f[y]) >= 0.01 && (h = !0);
      h && d.push({ uid: l.id, name: u.username || u.name || u.email || l.id, balances: He.reduce((y, w) => ({ ...y, [w]: H.round2(L(m[w])) }), {}), ledger: He.reduce((y, w) => ({ ...y, [w]: H.round2(p[w]) }), {}), diff: f });
    }
    d.sort((l, u) => Math.max(...He.map((m) => Math.abs(u.diff[m]))) - Math.max(...He.map((m) => Math.abs(l.diff[m]))));
    let c = (await Q.doc("stats/global").get()).data() || {};
    return {
      at: Date.now(),
      users: a.size,
      ledgerRows: n.size,
      partial: r,
      totals: He.reduce((l, u) => ({ ...l, [u]: H.round2(i[u]) }), {}),
      allBalances: H.round2(He.reduce((l, u) => l + i[u], 0)),
      deposits: L(c.totalDeposits),
      withdrawals: L(c.totalWithdrawals),
      bonusPaid: L(c.bonusPaid),
      mismatched: d.length,
      diffs: d.slice(0, 50)
    };
  });
  Jt.adminUserOverview = Sa({ region: va }, async (e) => {
    H.requireRole(e, eu);
    let t = H.str((e.data || {}).uid, { max: 128, label: "User" }), a = await Q.doc(`users/${t}`).get();
    if (!a.exists) throw new Ns("not-found", "User not found.");
    let n = a.data(), [s, o, r, i, d, c] = await Promise.all([
      Q.collection("transactions").where("uid", "==", t).orderBy("createdAt", "desc").limit(25).get(),
      Q.collection("deposits").where("uid", "==", t).orderBy("createdAt", "desc").limit(200).get(),
      Q.collection("withdrawals").where("uid", "==", t).orderBy("createdAt", "desc").limit(200).get(),
      Q.collection("loginHistory").where("uid", "==", t).orderBy("at", "desc").limit(10).get(),
      Q.collection("referrals").where("referrerUid", "==", t).limit(500).get(),
      Q.doc(`bonusClaims/${t}_checkin`).get()
    ]), l = await Q.doc(`userBooks/${t}`).get(), u = l.exists ? l.data() : {}, m = (h, y) => h.filter((w) => y(w.data())).reduce((w, v) => w + L(v.data().amount), 0), p = o.docs, f = r.docs;
    return {
      user: { uid: t, name: n.name || "", username: n.username || "", email: n.email || "", phone: n.phone || "", status: n.status || "active", role: n.role || "user", createdAt: ka(n.createdAt), lastLoginAt: ka(n.lastLoginAt), referredBy: n.referredBy || "" },
      balances: He.reduce((h, y) => ({ ...h, [y]: H.round2(L((n.balances || {})[y])) }), {}),
      totals: {
        deposited: H.round2(Math.max(L(u.dep), m(p, (h) => h.status === "approved"))),
        depositCount: Math.max(L(u.depN), p.filter((h) => h.data().status === "approved").length),
        withdrawn: H.round2(Math.max(L(u.wd), m(f, (h) => h.status === "approved" || h.status === "paid"))),
        withdrawCount: Math.max(L(u.wdN), f.filter((h) => ["approved", "paid"].includes(h.data().status)).length),
        pendingDeposits: p.filter((h) => h.data().status === "pending").length,
        pendingWithdraws: f.filter((h) => h.data().status === "pending").length,
        referrals: d.size,
        checkinStreak: c.exists ? L(c.data().streak) : 0
      },
      books: { dep: H.round2(u.dep), depN: L(u.depN), wd: H.round2(u.wd), wdN: L(u.wdN), bonus: H.round2(u.bonus), bet: H.round2(u.bet), win: H.round2(u.win), firstDep: L(u.firstDep), lastDep: L(u.lastDep), lastWd: L(u.lastWd) },
      ledger: s.docs.map((h) => {
        let y = h.data();
        return { type: y.type, direction: y.direction, amount: L(y.amount), bucket: y.bucket, note: y.note || "", at: ka(y.createdAt) };
      }),
      logins: i.docs.map((h) => {
        let y = h.data();
        return { at: ka(y.at), ok: y.success !== !1, device: y.device || y.ua || "", ip: y.ip || "" };
      })
    };
  });
});

// src/growth.js
var Ai = E((oe) => {
  "use strict";
  var { onCall: $e } = ee(), { onSchedule: nu } = Ht(), T = z(), su = Va(), { db: I, FieldValue: ci, HttpsError: We, REGION: Ae } = T, W = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, Zt = (e) => e && typeof e == "object" && e.__ts ? e.__ts : e && e.toMillis ? e.toMillis() : typeof e == "number" ? e : 0, Ds = (e) => (e = String(e || ""), e ? e.slice(0, 2) + "***" : "***"), Ot = () => globalThis.__ENV || process.env;
  async function li() {
    let e = await I.doc("settings/content").get();
    return e.exists ? e.data() : {};
  }
  function mi(e) {
    let t = e && e.refMs || {}, a = (Array.isArray(t.steps) ? t.steps : []).map((s) => ({ count: Math.round(W(s && s.count)), reward: T.round2(W(s && s.reward)) })).filter((s) => s.count >= 1 && s.count <= 1e5 && s.reward > 0 && s.reward <= 1e6).sort((s, o) => s.count - o.count).slice(0, 20), n = a.filter((s, o) => o === 0 || s.count !== a[o - 1].count);
    return { enabled: !!t.enabled && n.length > 0, minDeposit: Math.max(0, W(t.minDeposit)), bucket: t.bucket === "main" ? "main" : "referral", steps: n };
  }
  async function pi(e) {
    let a = (await I.collection("users").where("referredBy", "==", e).limit(3e3).get()).docs.map((n) => ({ uid: n.id, username: n.data().username || "", at: Zt(n.data().createdAt), deposited: 0 }));
    for (let n = 0; n < a.length; n += 100) {
      let s = a.slice(n, n + 100), o = s.map((c) => c.uid), r = await I.collection("deposits").where("uid", "in", o).where("status", "==", "approved").get(), i = {};
      r.docs.forEach((c) => {
        let l = c.data();
        i[l.uid] = (i[l.uid] || 0) + W(l.amount);
      }), (await Promise.all(o.map((c) => I.doc(`userBooks/${c}`).get()))).forEach((c) => {
        c.exists && (i[c.id] = Math.max(i[c.id] || 0, W(c.data().dep)));
      }), s.forEach((c) => {
        c.deposited = T.round2(i[c.uid] || 0);
      });
    }
    return a;
  }
  var fi = (e, t) => e.filter((a) => t.minDeposit > 0 ? a.deposited >= t.minDeposit : a.deposited > 0 || t.minDeposit === 0).length;
  oe.refProgress = $e({ region: Ae }, async (e) => {
    let t = T.authUid(e), a = mi(await li()), n = await pi(t), s = fi(n, a), o = await I.doc(`bonusClaims/${t}_refms`).get(), r = o.exists && Array.isArray(o.data().claimed) ? o.data().claimed : [];
    return {
      enabled: a.enabled,
      minDeposit: a.minDeposit,
      steps: a.steps,
      total: n.length,
      active: s,
      claimed: r,
      friends: n.sort((i, d) => d.at - i.at).slice(0, 100).map((i) => ({ name: Ds(i.username), at: i.at, active: a.minDeposit > 0 ? i.deposited >= a.minDeposit : !0, deposited: i.deposited > 0 }))
    };
  });
  oe.claimRefMilestone = $e({ region: Ae }, async (e) => {
    await Gt().requireFeature("refms");
    let t = T.requireVerified(e), a = Math.round(W((e.data || {}).count)), n = mi(await li());
    if (!n.enabled) throw new We("failed-precondition", "Invite rewards are off.");
    let s = n.steps.find((r) => r.count === a);
    if (!s) throw T.bad("Unknown reward step.");
    let o = fi(await pi(t), n);
    if (o < s.count) throw new We("failed-precondition", `\u0986\u09B0\u0993 ${s.count - o} \u099C\u09A8 \u09B8\u0995\u09CD\u09B0\u09BF\u09AF\u09BC \u09AC\u09A8\u09CD\u09A7\u09C1 \u09A6\u09B0\u0995\u09BE\u09B0\u0964`);
    return await I.runTransaction(async (r) => {
      let i = I.doc(`bonusClaims/${t}_refms`), d = I.doc(`users/${t}`), [c, l] = await Promise.all([r.get(i), r.get(d)]);
      T.assertActive(l.data());
      let u = c.exists && Array.isArray(c.data().claimed) ? c.data().claimed : [];
      if (u.includes(s.count)) throw new We("already-exists", "\u098F\u0987 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0 \u0986\u0997\u09C7\u0987 \u09A8\u09C7\u0993\u09AF\u09BC\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964");
      T.applyDelta(r, d, { [n.bucket]: s.reward }), T.ledger(r, { uid: t, type: "referral", direction: "in", amount: s.reward, bucket: n.bucket, note: `Invite reward \xB7 ${s.count} friends`, ref: "refms" }), T.notify(r, t, "Invite reward \u{1F389}", `${s.count} friends joined. +${s.reward}`, "referral"), r.set(i, { uid: t, kind: "refms", claimed: [...u, s.count], updatedAt: Date.now() }), T.bumpStats(r, { bonusPaid: s.reward });
    }), { ok: !0, reward: s.reward };
  });
  var di = { mobile: /^01[3-9]\d{8}$/, bank: /^[0-9A-Za-z\- ]{6,30}$/, crypto: /^[0-9A-Za-z]{20,100}$/ };
  oe.wdCardList = $e({ region: Ae }, async (e) => {
    let t = T.authUid(e), a = await I.doc(`users/${t}/private/wdCards`).get(), n = a.exists && Array.isArray(a.data().list) ? a.data().list : [], s = await Promise.all(n.map((o) => I.doc(`paymentMethods/${o.methodId}`).get()));
    return { cards: n.map((o, r) => ({ ...o, index: r, fee: s[r].exists ? Math.max(0, W(s[r].data().cardChangeFee)) : 0, lock: s[r].exists ? s[r].data().cardLock === !0 : !1 })) };
  });
  oe.wdCardChange = $e({ region: Ae }, async (e) => {
    let t = T.requireVerified(e), a = e.data || {}, n = Math.round(W(a.index));
    if (n < 0 || n > 5) throw T.bad("Invalid card.");
    let s = T.str(a.methodId, { max: 80, label: "Method" }), o = T.str(a.accountNumber, { min: 6, max: 34, label: "Account number", pattern: /^[0-9A-Za-z+\- ]+$/ }).replace(/\s+/g, " "), r = T.str(a.holderName, { min: 2, max: 60, label: "Name" }), i = typeof a.bankName == "string" ? a.bankName.trim().slice(0, 60) : "", d = typeof a.branch == "string" ? a.branch.trim().slice(0, 60) : "", c = 0;
    return await I.runTransaction(async (l) => {
      let u = I.doc(`users/${t}/private/wdCards`), m = I.doc(`users/${t}`), [p, f, h] = await Promise.all([l.get(u), l.get(m), l.get(I.doc(`paymentMethods/${s}`))]);
      T.assertActive(f.data());
      let y = p.exists && Array.isArray(p.data().list) ? p.data().list.slice() : [], w = y[n];
      if (!w) throw new We("not-found", "Card not found.");
      let v = await l.get(I.doc(`paymentMethods/${w.methodId}`)), S = h.data();
      if (!h.exists || S.enabled !== !0 || !["withdraw", "both"].includes(S.type || "both")) throw T.bad("This method is not available.");
      let g = S.kind || "mobile", b = g === "mobile" ? o.replace(/\s/g, "") : o;
      if (di[g] && !di[g].test(b)) throw T.bad(g === "mobile" ? "\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09E7\u09E7 \u09A1\u09BF\u099C\u09BF\u099F, 01 \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B6\u09C1\u09B0\u09C1\u0964" : "\u09B8\u09A0\u09BF\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09BF\u09A8\u0964");
      if (g === "bank" && (i.length < 2 || d.length < 2)) throw T.bad("\u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7\u09B0 \u09A8\u09BE\u09AE \u0993 \u09B6\u09BE\u0996\u09BE \u09A6\u09BF\u09A8\u0964");
      if (y.some((k, $) => $ !== n && k.methodId === s)) throw T.bad("\u098F\u0987 \u09AE\u09C7\u09A5\u09A1\u09C7 \u0986\u0997\u09C7\u0987 \u0986\u09B0\u09C7\u0995\u099F\u09BE \u0995\u09BE\u09B0\u09CD\u09A1 \u0986\u099B\u09C7\u0964");
      if (w.methodId === s && w.accountNumber === b && (w.holderName || "") === r && (w.bankName || "") === i && (w.branch || "") === d) throw T.bad("\u0995\u09BF\u099B\u09C1 \u09AC\u09A6\u09B2\u09BE\u09AF\u09BC\u09A8\u09BF\u0964");
      if (c = v.exists ? Math.min(1e5, Math.max(0, T.round2(W(v.data().cardChangeFee)))) : 0, c > 0) {
        let k = T.planDebit(f.data().balances, c, ["main", "winning", "referral", "commission"]), $ = {};
        for (let [N, D] of Object.entries(k)) $[N] = -D;
        T.applyDelta(l, m, $);
        for (let [N, D] of Object.entries(k)) T.ledger(l, { uid: t, type: "fee", direction: "out", amount: D, bucket: N, note: "Card number change", ref: "wdcard" });
        T.bumpStats(l, { feesCollected: c });
      }
      y[n] = { methodId: s, accountNumber: b, holderName: r, ...i ? { bankName: i, branch: d } : {}, savedAt: w.savedAt || Date.now(), changedAt: Date.now() }, l.set(u, { list: y, updatedAt: Date.now() }), T.notify(l, t, "Card updated", c > 0 ? `Withdraw card changed. Fee ${c}.` : "Withdraw card changed.", "withdraw"), T.audit(l, t, "wd_card_changed", { index: n, from: w.methodId, to: s, fee: c });
    }), { ok: !0, fee: c };
  });
  var Is = /* @__PURE__ */ new Map();
  async function ou(e) {
    let t = Is.get(e);
    if (t && t.at > Date.now() - 15e3) return t.v;
    let n = (await I.collection("lotteryTickets").where("lotteryId", "==", e).limit(3e3).get()).docs.map((i) => i.data()).filter((i) => i.status === "active" || i.status === "won").sort((i, d) => W(i.number) - W(d.number)), s = [...new Set(n.map((i) => i.uid))], o = {};
    for (let i = 0; i < s.length; i += 50)
      (await Promise.all(s.slice(i, i + 50).map((c) => I.doc(`users/${c}`).get()))).forEach((c) => {
        c.exists && (o[c.id] = c.data().username || "");
      });
    let r = { players: s.length, entries: n.slice(0, 600).map((i) => ({ t: i.number, n: Ds(o[i.uid]), uid: i.uid })) };
    return Is.set(e, { at: Date.now(), v: r }), r;
  }
  async function hi(e, t) {
    if (!t || t.autoDraw !== !0 || t.status !== "open" || !Zt(t.endsAt) || Zt(t.endsAt) > Date.now() || !(W(t.sold) > 0)) return !1;
    try {
      return await su.drawLottery(e, "auto"), Is.delete(e), !0;
    } catch {
      return !1;
    }
  }
  oe.lotteryLive = $e({ region: Ae }, async (e) => {
    let t = T.authUid(e), a = T.str((e.data || {}).lotteryId, { max: 80 }), n = await I.doc(`lotteries/${a}`).get();
    if (!n.exists) throw new We("not-found", "Lottery not found.");
    await hi(a, n.data()) && (n = await I.doc(`lotteries/${a}`).get());
    let s = n.data(), o = await ou(a);
    return {
      id: a,
      title: s.title || "",
      prize: W(s.prize),
      price: W(s.price),
      sold: W(s.sold),
      total: W(s.totalTickets),
      status: s.status,
      endsAt: Zt(s.endsAt),
      now: Date.now(),
      autoDraw: s.autoDraw === !0,
      seedHash: s.seedHash || "",
      drawSeed: s.status === "drawn" && s.drawSeed || "",
      drawCount: W(s.drawCount),
      winnerTicket: s.winnerTicket || null,
      winnerName: s.status === "drawn" ? Ds(s.winnerName) : "",
      winnerIsMe: s.status === "drawn" && s.winnerUid === t,
      players: o.players,
      mine: o.entries.filter((r) => r.uid === t).map((r) => r.t),
      entries: o.entries.map((r) => ({ t: r.t, n: r.n }))
    };
  });
  async function wi() {
    let e = await I.collection("lotteries").where("status", "==", "open").limit(100).get(), t = 0;
    for (let a of e.docs) await hi(a.id, a.data()) && t++;
    return t;
  }
  oe.lotteryTick = nu({ region: Ae, schedule: "every 1 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 120 }, async () => {
    await wi();
  });
  oe.lotteryAutoCheck = $e({ region: Ae }, async (e) => (T.authUid(e), { drawn: await wi() }));
  var ru = ["deposit", "withdraw", "account", "game", "other"], iu = { deposit: "\u09A1\u09BF\u09AA\u09CB\u099C\u09BF\u099F", withdraw: "\u0989\u0987\u09A5\u09A1\u09CD\u09B0", account: "\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F", game: "\u0997\u09C7\u09AE", other: "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF" }, gi = { fetch: (...e) => fetch(...e) };
  async function Xt(e, t) {
    let a = Ot().TELEGRAM_BOT_TOKEN;
    if (!a) return null;
    try {
      return await (await gi.fetch(`https://api.telegram.org/bot${a}/${e}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(t) })).json();
    } catch {
      return null;
    }
  }
  async function Es(e, t, a, n = {}) {
    let s = I.doc(`supportThreads/${e}`), o = Date.now();
    await I.collection(`supportThreads/${e}/msgs`).doc().set({ from: t, text: a, at: o, ...n });
    let r = { lastAt: o, lastText: a.slice(0, 120), lastFrom: t };
    t === "user" ? (r.unreadStaff = ci.increment(1), r.status = "open") : (r.unreadUser = ci.increment(1), r.unreadStaff = 0), await s.set(r, { merge: !0 });
  }
  oe.supportSend = $e({ region: Ae }, async (e) => {
    await Gt().requireFeature("chat");
    let t = T.authUid(e), a = e.data || {}, n = T.str(a.text, { min: 1, max: 1e3, label: "Message" }), s = ru.includes(a.topic) ? a.topic : "other", o = (await I.doc(`users/${t}`).get()).data() || {}, r = I.doc(`supportThreads/${t}`), i = await r.get(), d = i.exists ? i.data() : {}, c = Math.floor(Date.now() / 36e5), l = d.rateHour === c ? W(d.rateCount) : 0;
    if (l >= 30) throw new We("resource-exhausted", "\u0985\u09A8\u09C7\u0995 \u09AE\u09C7\u09B8\u09C7\u099C \u09AA\u09BE\u09A0\u09BF\u09AF\u09BC\u09C7\u099B\u09C7\u09A8, \u098F\u0995\u099F\u09C1 \u09AA\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u09B2\u09BF\u0996\u09C1\u09A8\u0964");
    i.exists || await r.set({ uid: t, username: o.username || "", createdAt: Date.now(), unreadUser: 0, unreadStaff: 0 }), await r.set({ rateHour: c, rateCount: l + 1, topic: s, username: o.username || "" }, { merge: !0 }), await Es(t, "user", n, { topic: s });
    let u = Ot().TELEGRAM_CHAT_ID;
    if (u) {
      let m = await Xt("sendMessage", { chat_id: u, text: `\u{1F198} ${o.username || "player"} \xB7 ${iu[s]}

${n}

#U${t.slice(0, 8)} \u2014 \u098F\u0987 \u09AE\u09C7\u09B8\u09C7\u099C\u09C7 Reply \u09A6\u09BF\u09B2\u09C7 \u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0 \u09B8\u09BE\u0987\u099F\u09C7 \u0989\u09A4\u09CD\u09A4\u09B0 \u09AA\u09BE\u09AC\u09C7` });
      m && m.ok && m.result && await I.doc(`tgMap/${m.result.message_id}`).set({ uid: t, at: Date.now() });
    }
    return { ok: !0 };
  });
  oe.supportMine = $e({ region: Ae }, async (e) => {
    let t = T.authUid(e), a = await I.collection(`supportThreads/${t}/msgs`).orderBy("at", "desc").limit(60).get(), n = await I.doc(`supportThreads/${t}`).get();
    return n.exists && W(n.data().unreadUser) && await I.doc(`supportThreads/${t}`).update({ unreadUser: 0 }), { msgs: a.docs.map((s) => {
      let o = s.data();
      return { from: o.from, text: o.text, at: o.at, via: o.via || "" };
    }).reverse() };
  });
  oe.adminSupportList = $e({ region: Ae }, async (e) => (T.requireRole(e, ["super", "support"]), {
    threads: (await I.collection("supportThreads").orderBy("lastAt", "desc").limit(100).get()).docs.map((a) => {
      let n = a.data();
      return { uid: a.id, username: n.username || "", lastAt: n.lastAt || 0, lastText: n.lastText || "", lastFrom: n.lastFrom || "", unread: W(n.unreadStaff), topic: n.topic || "" };
    }),
    telegram: !!(Ot().TELEGRAM_BOT_TOKEN && Ot().TELEGRAM_CHAT_ID)
  }));
  oe.adminSupportThread = $e({ region: Ae }, async (e) => {
    T.requireRole(e, ["super", "support"]);
    let t = T.str((e.data || {}).uid, { max: 80 }), a = await I.collection(`supportThreads/${t}/msgs`).orderBy("at", "desc").limit(100).get(), n = await I.doc(`supportThreads/${t}`).get();
    return n.exists && W(n.data().unreadStaff) && await I.doc(`supportThreads/${t}`).update({ unreadStaff: 0 }), { username: n.exists && n.data().username || "", msgs: a.docs.map((s) => {
      let o = s.data();
      return { from: o.from, text: o.text, at: o.at, via: o.via || "" };
    }).reverse() };
  });
  oe.adminSupportReply = $e({ region: Ae }, async (e) => {
    let t = T.requireRole(e, ["super", "support"]), a = e.data || {}, n = T.str(a.uid, { max: 80 }), s = T.str(a.text, { min: 1, max: 1e3, label: "Message" });
    if (!(await I.doc(`supportThreads/${n}`).get()).exists) throw new We("not-found", "Chat not found.");
    return await Es(n, "staff", s, { by: t, via: "panel" }), await I.runTransaction(async (o) => {
      T.notify(o, n, "Support replied", s.slice(0, 140), "support");
    }), { ok: !0 };
  });
  oe.adminSupportClose = $e({ region: Ae }, async (e) => {
    T.requireRole(e, ["super", "support"]);
    let t = T.str((e.data || {}).uid, { max: 80 });
    return await I.doc(`supportThreads/${t}`).set({ status: "closed", unreadStaff: 0 }, { merge: !0 }), { ok: !0 };
  });
  oe.adminTelegramSetup = $e({ region: Ae }, async (e) => {
    T.requireRole(e, ["super"]);
    let t = Ot();
    if (!t.TELEGRAM_BOT_TOKEN) throw new We("failed-precondition", "Supabase Secrets \u098F TELEGRAM_BOT_TOKEN \u09A8\u09C7\u0987\u0964");
    if (!t.TELEGRAM_WEBHOOK_SECRET) throw new We("failed-precondition", "Supabase Secrets \u098F TELEGRAM_WEBHOOK_SECRET \u09A8\u09C7\u0987\u0964");
    let a = await Xt("getMe", {});
    if (!a || !a.ok) throw new We("failed-precondition", "\u09AC\u099F\u09C7\u09B0 \u099F\u09CB\u0995\u09C7\u09A8 \u0995\u09BE\u099C \u0995\u09B0\u099B\u09C7 \u09A8\u09BE\u0964");
    let n = `${String(t.SUPABASE_URL || "").replace(/\/+$/, "")}/functions/v1/api/tg`, s = await Xt("setWebhook", { url: n, secret_token: t.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ["message"] });
    if (!s || !s.ok) throw new We("failed-precondition", "Webhook \u09B8\u09C7\u099F \u09B9\u09AF\u09BC\u09A8\u09BF: " + (s && s.description || "unknown"));
    return t.TELEGRAM_CHAT_ID && await Xt("sendMessage", { chat_id: t.TELEGRAM_CHAT_ID, text: "\u2705 DEEMBD \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u09AC\u099F \u099A\u09BE\u09B2\u09C1 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" }), { ok: !0, bot: a.result.username, chat: !!t.TELEGRAM_CHAT_ID };
  });
  async function yi(e) {
    let t = e && e.message;
    if (!t || typeof t.text != "string") return;
    let a = String(t.chat && t.chat.id), n = t.text.trim();
    if (/^\/(id|start)\b/.test(n)) {
      await Xt("sendMessage", { chat_id: a, text: `\u098F\u0987 \u099A\u09CD\u09AF\u09BE\u099F\u09C7\u09B0 \u0986\u0987\u09A1\u09BF: ${a}
\u098F\u099F\u09BE Supabase Secrets \u098F TELEGRAM_CHAT_ID \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09AC\u09B8\u09BE\u09A8\u0964` });
      return;
    }
    if (!Ot().TELEGRAM_CHAT_ID || a !== String(Ot().TELEGRAM_CHAT_ID)) return;
    let s = t.reply_to_message;
    if (!s) return;
    let o = await I.doc(`tgMap/${s.message_id}`).get();
    if (!o.exists) return;
    let r = o.data().uid, i = t.from && (t.from.first_name || t.from.username) || "Support";
    await Es(r, "staff", n.slice(0, 1e3), { via: "telegram", by: `tg:${i}` }), await I.runTransaction(async (d) => {
      T.notify(d, r, "Support replied", n.slice(0, 140), "support");
    }), await Xt("sendMessage", { chat_id: a, text: "\u2713 \u09AA\u09CD\u09B2\u09C7\u09AF\u09BC\u09BE\u09B0\u0995\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09AF\u09BC\u09C7\u099B\u09C7", reply_to_message_id: t.message_id });
  }
  yi.__kind = "hook";
  oe.telegramHook = yi;
  oe.__net = gi;
  var Ta = null;
  try {
    Ta = bt();
  } catch {
    Ta = null;
  }
  var bi = (e) => Zt(e && e.createdAt), cu = () => {
    let e = new Date(Date.now() + 216e5);
    return e.setUTCHours(0, 0, 0, 0), e.getTime() - 6 * 36e5;
  }, ui = (e, t) => ({
    kind: "deposit",
    id: e,
    trxId: t.trxId || "",
    username: t.username || "",
    uid: t.uid || "",
    method: t.methodName || t.methodId || "",
    amount: W(t.amount),
    from: t.senderNumber || "",
    to: t.accountNumber || "",
    holder: t.holderName || "",
    status: t.status || "",
    at: bi(t),
    reviewedBy: t.reviewedBy || "",
    shot: t.screenshotPath || "",
    shotStore: t.screenshotStore || "",
    bank: t.bankName ? `${t.bankName}${t.branch ? ", " + t.branch : ""}` : ""
  }), du = (e, t) => ({
    kind: "withdraw",
    id: e,
    trxId: t.payTrxId || "",
    username: t.username || "",
    uid: t.uid || "",
    method: t.methodName || t.methodId || "",
    amount: W(t.net || t.amount),
    from: t.fromNumber || "",
    to: t.accountNumber || "",
    holder: t.holderName || "",
    status: t.status || "",
    at: bi(t),
    reviewedBy: t.reviewedBy || "",
    shot: t.proofKey || "",
    shotStore: t.proofKey ? "s3" : "",
    bank: t.bankName ? `${t.bankName}${t.branch ? ", " + t.branch : ""}` : ""
  });
  async function uu(e, t, a, n) {
    let s = "%" + a.replace(/[\\%_]/g, (i) => "\\" + i) + "%", o = t.map((i, d) => `coalesce(data->>'${i}','') ilike $1`).join(" or ");
    return (await Ta.sql.unsafe(`select id, data from public.docs where collection = $2 and (${o}) order by coalesce((data->'createdAt'->>'__ts')::bigint, 0) desc limit ${n}`, [s, e])).map((i) => [i.id, i.data]);
  }
  async function lu(e, t, a, n) {
    let s = await I.collection(e).orderBy("createdAt", "desc").limit(5e3).get(), o = a.toLowerCase();
    return s.docs.filter((r) => t.some((i) => String(r.data()[i] || "").toLowerCase().includes(o))).slice(0, n).map((r) => [r.id, r.data()]);
  }
  oe.adminTrxSearch = $e({ region: Ae, timeoutSeconds: 60 }, async (e) => {
    T.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = ["deposit", "withdraw"].includes(t.kind) ? t.kind : "all", n = ["today", "approved", "pending", "dup"].includes(t.list) ? t.list : "";
    if (n === "dup") {
      let i = await I.collection("auditLogs").where("action", "==", "duplicate_trx_attempt").orderBy("at", "desc").limit(60).get(), d = [...new Set(i.docs.map((l) => l.data().actorUid).filter(Boolean))], c = {};
      return (await Promise.all(d.map((l) => I.doc(`users/${l}`).get()))).forEach((l) => {
        l.exists && (c[l.id] = l.data().username || "");
      }), { results: i.docs.map((l) => {
        let u = l.data(), m = u.detail || {};
        return { kind: "dup", id: l.id, trxId: m.trxId || "", method: m.methodId || "", username: c[u.actorUid] || "", uid: u.actorUid || "", count: W(m.count), at: Zt(u.at) };
      }) };
    }
    if (n) {
      let d = (await I.collection("deposits").where("createdAt", ">=", cu()).orderBy("createdAt", "desc").limit(500).get()).docs.map((c) => ui(c.id, c.data()));
      return n !== "today" && (d = d.filter((c) => c.status === n)), { results: d.slice(0, 200) };
    }
    let s = T.str(t.q, { min: 2, max: 60, label: "Search" }), o = Ta && Ta.sql ? uu : lu, r = [];
    return a !== "withdraw" && (await o("deposits", ["trxId", "senderNumber", "username", "accountNumber"], s, 40)).forEach(([i, d]) => r.push(ui(i, d))), a !== "deposit" && (await o("withdrawals", ["payTrxId", "accountNumber", "username", "fromNumber"], s, 40)).forEach(([i, d]) => r.push(du(i, d))), r.sort((i, d) => d.at - i.at), { results: r.slice(0, 60) };
  });
});

// src/books.js
var An = E((Qt) => {
  "use strict";
  var { onCall: Ms } = ee(), { onSchedule: mu } = Ht(), $a = z(), { db: pu, HttpsError: fu, REGION: yn } = $a, re = null;
  try {
    re = bt();
  } catch {
    re = null;
  }
  var Os = 864e5, Ti = 6 * 36e5, Ca = (e) => new Date(e + Ti).toISOString().slice(0, 10), hu = (e) => Date.parse(e + "T00:00:00Z") - Ti, M = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, Ne = (e) => Math.round(M(e) * 100) / 100, wu = (e, t = "createdAt") => {
    let a = e && e[t];
    return a && typeof a == "object" && a.__ts ? a.__ts : typeof a == "number" ? a : 0;
  }, gu = ["bet", "win", "game_bet", "game_win", "game_refund", "game_win_reversal"], Ps = ["super", "finance"], Ce = (e) => `coalesce((data->'${e}'->>'__ts')::numeric::bigint, case when jsonb_typeof(data->'${e}') = 'number' then (data->>'${e}')::numeric::bigint end, 0)`, ki = (e) => String(e || "other").trim().toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "other", yu = (e) => {
    let t = /Paid\s+([\d.]+)\s*\(fee\s*([\d.]+)\)/i.exec(String(e || ""));
    return t ? { net: M(t[1]), fee: M(t[2]) } : null;
  };
  function _i(e) {
    let t = M(e.amount);
    switch (e.type) {
      case "deposit":
        return { dep: t, depN: 1 };
      case "deposit_refund":
        return { depRef: t, depRefN: 1 };
      case "bonus":
        return e.ref === "checkin" ? { checkin: t } : { bonus: t };
      case "referral":
        return { ref: t };
      case "commission":
        return { com: t };
      case "lottery":
        return { lotSell: t, lotN: 1 };
      case "lottery_win":
        return { lotWin: t };
      case "lottery_refund":
        return { lotRef: t };
      case "fee":
        return { fee: t };
      case "admin_adjust":
        return e.direction === "out" ? { adjOut: t } : { adjIn: t };
      case "bet":
      case "game_bet":
        return { bet: t, betN: 1 };
      case "win":
      case "game_win":
        return { win: t };
      case "game_refund":
        return { bet: -t };
      case "game_win_reversal":
        return { win: -t };
      case "game_day":
        return e.direction === "out" ? { bet: t, betN: M(e.rounds) } : { win: t };
      default:
        return null;
    }
  }
  var bu = /* @__PURE__ */ new Set(["firstDep", "firstAt"]), Au = /* @__PURE__ */ new Set(["lastDep", "lastWd", "lastAt"]);
  function Na(e, t) {
    for (let [a, n] of Object.entries(t))
      n != null && (typeof n == "number" ? bu.has(a) ? e[a] = e[a] ? Math.min(e[a], n) : n : Au.has(a) ? e[a] = Math.max(M(e[a]), n) : e[a] = Ne(M(e[a]) + n) : typeof n == "object" ? (e[a] = e[a] && typeof e[a] == "object" ? e[a] : {}, Na(e[a], n)) : typeof n == "string" && (e[a] || (e[a] = n)));
    return e;
  }
  async function ku(e, t) {
    for (let a = 0; a < t.length; a += 500) {
      let n = t.slice(a, a + 500);
      await e`insert into public.docs (path, collection, id, data) select * from jsonb_to_recordset(${e.json(n)}::jsonb) as x(path text, collection text, id text, data jsonb)
      on conflict (path) do update set data = excluded.data`;
    }
  }
  async function $i(e, t) {
    let a = [...t.keys()];
    if (!a.length) return;
    let n = /* @__PURE__ */ new Map();
    for (let o = 0; o < a.length; o += 2e3) (await e`select path, data from public.docs where path = any(${a.slice(o, o + 2e3)}) for update`).forEach((r) => n.set(r.path, r.data));
    let s = a.map((o) => {
      let [r, i] = o.split("/");
      return { path: o, collection: r, id: i, data: Na(n.get(o) || {}, t.get(o)) };
    });
    await ku(e, s);
  }
  var _a = null;
  async function bn() {
    return !re || !re.sql ? { ok: !1, error: "db" } : _a || (_a = (async () => {
      let e = 0;
      for (let t = 0; t < 20; t++) {
        let a = await Su();
        if (e += a.rows, !a.more) return { ok: !0, rows: e, upTo: a.upTo };
      }
      return { ok: !0, rows: e, more: !0 };
    })().finally(() => {
      _a = null;
    }), _a);
  }
  async function Su() {
    return re.sql.begin(async (t) => {
      await t`insert into public.docs (path, collection, id, data) values ('books/meta', 'books', 'meta', '{"upTo":0}'::jsonb) on conflict (path) do nothing`;
      let [a] = await t`select data from public.docs where path = 'books/meta' for update`, n = M(a.data.upTo), s = Date.now() - 12e4;
      if (s <= n) return { rows: 0, upTo: n };
      let o = await t.unsafe(`select id, data, ${Ce("createdAt")} as ts from public.docs where collection = 'transactions' and ${Ce("createdAt")} >= $1 and ${Ce("createdAt")} < $2 order by 3 limit 20001`, [n, s]), r = !1;
      if (o.length > 2e4) {
        for (r = !0, s = Number(o[2e4].ts); o.length && Number(o[o.length - 1].ts) >= s; ) o.pop();
        o.length || (o.push(...await t.unsafe(`select id, data, ${Ce("createdAt")} as ts from public.docs where collection = 'transactions' and ${Ce("createdAt")} = $1`, [s])), s += 1);
      }
      let i = await t.unsafe(`select id, data, ${Ce("reviewedAt")} as ts from public.docs where collection = 'withdrawals' and data->>'status' in ('approved','rejected') and ${Ce("reviewedAt")} >= $1 and ${Ce("reviewedAt")} < $2`, [n, s]), d = await t.unsafe(`select id, data, ${Ce("reviewedAt")} as ts from public.docs where collection = 'deposits' and data->>'status' = 'rejected' and ${Ce("reviewedAt")} >= $1 and ${Ce("reviewedAt")} < $2`, [n, s]), c = /* @__PURE__ */ new Map(), l = (m, p) => {
        c.has(m) || c.set(m, {}), Na(c.get(m), p);
      }, u = (m, p, f) => {
        l("books/all", p), l("books/d_" + Ca(m), f ? { ...p, ...f } : p);
      };
      for (let m of o) {
        let p = m.data, f = Number(m.ts), h = _i(p);
        if (!h || !p.uid) continue;
        let y = {};
        p.type === "deposit" && (h.m = { [ki(p.note)]: { n: String(p.note || "").slice(0, 30), i: M(p.amount), iN: 1 } }, y.depU = { [p.uid]: 1 }), u(f, h, y);
        let w = {};
        p.type === "deposit" ? Object.assign(w, { dep: M(p.amount), depN: 1, firstDep: f, lastDep: f }) : p.type === "deposit_refund" ? Object.assign(w, { dep: -M(p.amount), depN: -1 }) : ["bonus", "referral", "commission"].includes(p.type) ? w.bonus = M(p.amount) : p.type === "lottery" ? w.lotSell = M(p.amount) : p.type === "lottery_win" ? w.lotWin = M(p.amount) : p.type === "lottery_refund" ? w.lotSell = -M(p.amount) : h.bet !== void 0 ? w.bet = h.bet : h.win !== void 0 ? w.win = h.win : p.type === "fee" ? w.fee = M(p.amount) : p.type === "admin_adjust" && (w[p.direction === "out" ? "adjOut" : "adjIn"] = M(p.amount)), Object.keys(w).length && l("userBooks/" + p.uid, w);
      }
      for (let m of i) {
        let p = m.data, f = Number(m.ts);
        p.status === "approved" ? (u(f, { wd: M(p.amount), wdNet: M(p.net), wdFee: M(p.fee), wdN: 1, m: { [ki(p.methodName)]: { n: String(p.methodName || "").slice(0, 30), o: M(p.net), oN: 1 } } }, { wdU: { [p.uid]: 1 } }), l("userBooks/" + p.uid, { wd: M(p.amount), wdN: 1, lastWd: f })) : u(f, { wdRejN: 1 });
      }
      for (let m of d) u(Number(m.ts), { depRejN: 1 });
      return await $i(t, c), await t`update public.docs set data = data || ${t.json({ upTo: s, at: Date.now() })}::jsonb where path = 'books/meta'`, { rows: o.length + i.length + d.length, upTo: s, more: r };
    });
  }
  async function Ci() {
    let e = await pu.doc("books/meta").get();
    return e.exists ? M(e.data().upTo) : 0;
  }
  var vu = (e) => e.reduce((t, a) => Na(t, Object.fromEntries(Object.entries(a).filter(([n]) => !["depU", "wdU", "at", "upTo"].includes(n)))), {});
  function Rs(e, t) {
    e = e || {};
    let a = { ...e };
    return delete a.depU, delete a.wdU, a.depUsers = e.depU ? Object.keys(e.depU).length : void 0, a.wdUsers = e.wdU ? Object.keys(e.wdU).length : void 0, a.netCash = Ne(M(e.dep) - M(e.depRef) - M(e.wdNet)), Object.assign(a, t || {});
  }
  Qt.booksTick = mu({ region: yn, schedule: "every 15 minutes", timeZone: "Asia/Dhaka", timeoutSeconds: 120 }, async () => {
    await bn();
  });
  Qt.adminBooks = Ms({ region: yn, timeoutSeconds: 120 }, async (e) => {
    $a.requireRole(e, Ps);
    let t = e.data || {};
    if (!re || !re.sql) throw new fu("unavailable", "Database not ready.");
    let a = await bn().catch((h) => ({ ok: !1, error: String(h.message || h) })), n = /^\d{4}-\d{2}-\d{2}$/, s = n.test(t.from || "") ? t.from : null, o = n.test(t.to || "") ? t.to : Ca(Date.now()), [r] = await re.sql`select data from public.docs where path = 'books/all'`, i = s || Ca(Date.now() - 365 * Os), d = await re.sql`select id, data from public.docs where collection = 'books' and id >= ${"d_" + i} and id <= ${"d_" + o} order by id`, c = s ? Rs(vu(d.map((h) => h.data)), {
      depUsers: new Set(d.flatMap((h) => Object.keys(h.data.depU || {}))).size,
      wdUsers: new Set(d.flatMap((h) => Object.keys(h.data.wdU || {}))).size
    }) : null, l = d.slice(-62).map((h) => ({ day: h.id.slice(2), dep: Ne(h.data.dep), wd: Ne(h.data.wdNet), depN: M(h.data.depN), wdN: M(h.data.wdN) })), [u] = await re.sql`select count(*) filter (where (data->>'depN')::numeric > 0)::int as dep, count(*) filter (where (data->>'wdN')::numeric > 0)::int as wd from public.docs where collection = 'userBooks'`, [m] = await re.sql`select coalesce(sum(coalesce((data->'balances'->>'main')::numeric,0) + coalesce((data->'balances'->>'winning')::numeric,0) + coalesce((data->'balances'->>'referral')::numeric,0) + coalesce((data->'balances'->>'commission')::numeric,0)),0)::float as b, count(*)::int as n from public.docs where collection = 'users'`, p = await re.sql`select collection, count(*)::int as n, coalesce(sum((data->>'amount')::numeric),0)::float as a from public.docs where collection in ('deposits','withdrawals') and data->>'status' = 'pending' group by collection`, f = Object.fromEntries(p.map((h) => [h.collection, { n: h.n, a: Ne(h.a) }]));
    return {
      all: Rs(r ? r.data : {}, { depUsers: u.dep, wdUsers: u.wd }),
      period: c,
      from: s,
      to: o,
      series: l,
      balances: Ne(m.b),
      players: m.n,
      pending: { deposits: f.deposits || { n: 0, a: 0 }, withdrawals: f.withdrawals || { n: 0, a: 0 } },
      upTo: a.upTo || await Ci(),
      roll: a.ok ? void 0 : a.error,
      firstDay: (await re.sql`select min(id) as d from public.docs where collection = 'books' and id like 'd\\_%'`)[0].d
    };
  });
  Qt.adminBooksUsers = Ms({ region: yn }, async (e) => {
    $a.requireRole(e, Ps);
    let t = e.data || {}, a = ["dep", "wd", "net", "bonus"].includes(t.sort) ? t.sort : "dep", n = String(t.q || "").trim().slice(0, 40), s = a === "net" ? "coalesce((b.data->>'dep')::numeric,0) - coalesce((b.data->>'wd')::numeric,0)" : `coalesce((b.data->>'${a}')::numeric,0)`, o = "%" + n.replace(/[%_\\]/g, (i) => "\\" + i) + "%", r = await re.sql.unsafe(`select b.id, b.data, u.data->>'username' as username, u.data->>'name' as name, u.data->>'phone' as phone from public.docs b
    left join public.docs u on u.path = 'users/' || b.id where b.collection = 'userBooks' ${n ? "and (u.data->>'username' ilike $1 or u.data->>'name' ilike $1 or u.data->>'phone' ilike $1 or b.id = $2)" : ""}
    order by ${s} desc limit 100`, n ? [o, n] : []);
    return { sort: a, list: r.map((i) => ({
      uid: i.id,
      username: i.username || "",
      name: i.name || "",
      dep: Ne(i.data.dep),
      depN: M(i.data.depN),
      wd: Ne(i.data.wd),
      wdN: M(i.data.wdN),
      bonus: Ne(i.data.bonus),
      bet: Ne(i.data.bet),
      win: Ne(i.data.win),
      lot: Ne(M(i.data.lotSell) - M(i.data.lotWin)),
      firstDep: M(i.data.firstDep),
      lastDep: M(i.data.lastDep),
      lastWd: M(i.data.lastWd),
      net: Ne(M(i.data.dep) - M(i.data.wd))
    })) };
  });
  var Si = {
    deposit: "\u09A1\u09BF\u09AA\u09CB\u099C\u09BF\u099F",
    deposit_refund: "\u09A1\u09BF\u09AA\u09CB\u099C\u09BF\u099F \u09AB\u09C7\u09B0\u09A4",
    withdraw: "\u0989\u0987\u09A5\u09A1\u09CD\u09B0 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F",
    bonus: "\u09AC\u09CB\u09A8\u09BE\u09B8",
    referral: "\u09B0\u09C7\u09AB\u09BE\u09B0 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0",
    commission: "\u09B0\u09C7\u09AB\u09BE\u09B0 \u0995\u09AE\u09BF\u09B6\u09A8",
    lottery: "\u09B2\u099F\u09BE\u09B0\u09BF \u099F\u09BF\u0995\u09BF\u099F",
    lottery_win: "\u09B2\u099F\u09BE\u09B0\u09BF \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0",
    lottery_refund: "\u09B2\u099F\u09BE\u09B0\u09BF \u09AB\u09C7\u09B0\u09A4",
    fee: "\u09AB\u09BF",
    admin_adjust: "\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09B8\u09AE\u09A8\u09CD\u09AC\u09AF\u09BC"
  };
  function vi(e, t) {
    let a = e.type;
    if (!Si[a]) return null;
    let n = M(e.amount), s;
    if (a === "withdraw") {
      let r = yu(e.note);
      if (!r) return null;
      n = r.net, s = -1;
    } else a === "deposit" || a === "lottery" || a === "fee" ? s = 1 : a === "admin_adjust" ? s = e.direction === "out" ? 1 : -1 : s = -1;
    let o = a === "bonus" && e.ref === "checkin" ? "\u099A\u09C7\u0995-\u0987\u09A8" : Si[a];
    return { t: wu(e), ty: a, label: o, u: t || "", uid: e.uid, a: Ne(n), s, note: a === "deposit" ? String(e.note || "") : a === "bonus" ? String(e.note || "").slice(0, 40) : "" };
  }
  async function Tu(e, t) {
    let a = hu(e), n = a + Os, s = /* @__PURE__ */ new Map(), o = await re.sql.unsafe(`select id, data from public.docs where collection = 'transactions' and data->>'type' not in (${gu.map((c) => `'${c}'`).join(",")}, 'game_day') and ${Ce("createdAt")} >= $1 and ${Ce("createdAt")} < $2 order by ${Ce("createdAt")} limit 5000`, [a, n]), r = {}, i = [...new Set(o.map((c) => c.data.uid))].filter(Boolean);
    for (let c = 0; c < i.length; c += 500) (await re.sql`select id, data->>'username' as u from public.docs where collection = 'users' and id = any(${i.slice(c, c + 500)})`).forEach((l) => {
      r[l.id] = l.u;
    });
    o.forEach((c) => {
      let l = vi(c.data, r[c.data.uid]);
      l && s.set(c.id, l);
    });
    let d = 0;
    if (t) for (let c of await t(e)) {
      if (c.c !== "tx" || s.has(c.id)) continue;
      let l = vi(c.d || c, c.u);
      l && (s.set(c.id, l), d++);
    }
    return { lines: [...s.values()].sort((c, l) => c.t - l.t), fromArchive: d };
  }
  Qt.adminBookDay = Ms({ region: yn, timeoutSeconds: 120 }, async (e) => {
    $a.requireRole(e, Ps);
    let t = String((e.data || {}).day || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) throw $a.bad("Invalid day.");
    t >= Ca(Date.now() - 3 * Os) && await bn().catch(() => null);
    let [a] = await re.sql`select data from public.docs where path = ${"books/d_" + t}`, n = Us().__archive, { lines: s, fromArchive: o } = await Tu(t, n && n.moneyOfDay), [r] = await re.sql`select min(id) as d from public.docs where collection = 'books' and id like 'd\\_%'`;
    return { day: t, book: Rs(a ? a.data : {}), lines: s.slice(0, 3e3), more: s.length > 3e3, count: s.length, fromArchive: o, firstDay: r.d ? r.d.slice(2) : null };
  });
  Qt.__books = { rollup: bn, dayKey: Ca, txEffect: _i, upToNow: Ci, mergeDocs: $i, add: Na };
});

// src/archive.js
var Us = E((Ue) => {
  "use strict";
  var Da = Se("zlib"), { onCall: wt } = ee(), { onSchedule: Ni } = Ht(), ke = z(), Me = ca().helpers, { db: V, HttpsError: ea, REGION: et } = ke, ae = null;
  try {
    ae = bt();
  } catch {
    ae = null;
  }
  var Ii = ["bet", "win", "game_bet", "game_win", "game_refund", "game_win_reversal"], ht = 864e5, Di = 6 * 36e5, Qe = (e) => new Date(e + Di).toISOString().slice(0, 10), Ia = (e) => Date.parse(e + "T00:00:00Z") - Di, U = (e) => {
    let t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }, vn = (e, t = "createdAt") => {
    let a = e && e[t];
    return a && typeof a == "object" && a.__ts ? a.__ts : typeof a == "number" ? a : 0;
  }, Bs = { fetch: (...e) => (ke.storageFetch || globalThis.fetch)(...e) };
  async function Tn() {
    let e = await V.doc("settings/archive").get(), t = e.exists ? e.data() : {};
    return {
      enabled: t.enabled !== !1,
      afterDays: Math.max(1, Math.min(30, Math.round(U(t.afterDays) || 1))),
      keepDays: Math.max(1, Math.min(365, Math.round(U(t.keepDays) || 90))),
      moneyDays: Math.max(2, Math.min(90, Math.round(U(t.moneyDays) || 7))),
      moneyKeep: Math.max(0, Math.min(3650, Math.round(U(t.moneyKeep) || 0))),
      backupKeep: Math.max(1, Math.min(30, Math.round(U(t.backupKeep) || 7))),
      backup: t.backup !== !1
    };
  }
  async function _n(e, t) {
    let a = await Me.presign("PUT", e, { expires: 300, contentType: "application/gzip" }), n = await Bs.fetch(a, { method: "PUT", headers: { "content-type": "application/gzip" }, body: t });
    if (!n.ok) throw new Error("upload failed " + n.status);
    let s = await Me.headObject(e);
    if (!s.exists || s.size && s.size !== t.length) throw new Error("upload not confirmed");
  }
  async function Ei(e) {
    let t = await Bs.fetch(await Me.presign("GET", e, { expires: 120 }), { method: "GET" });
    if (!t.ok) throw new ea("unavailable", "\u0986\u09B0\u09CD\u0995\u09BE\u0987\u09AD \u09AB\u09BE\u0987\u09B2 \u09AA\u09A1\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964");
    let a = await t.arrayBuffer();
    return Da.gunzipSync(Buffer.from(a)).toString("utf8");
  }
  async function Ri(e) {
    let t = {}, a = [...new Set(e)].filter(Boolean);
    for (let n = 0; n < a.length; n += 500)
      (await ae.sql`select id, data->>'username' as u from public.docs where collection = 'users' and id = any(${a.slice(n, n + 500)})`).forEach((o) => {
        t[o.id] = o.u || "";
      });
    return t;
  }
  async function Ls(e, t) {
    let a = V.doc(`archiveDays/${e}`), n = await a.get(), s = n.exists ? n.data() : { day: e, parts: [], rows: 0, ag: 0, bytes: 0 };
    t.money ? (s.money = [...s.money || [], t.key], s.mrows = U(s.mrows) + U(t.rows), s.mbytes = U(s.mbytes) + U(t.bytes)) : (s.parts = [...s.parts || [], t.key], s.rows = U(s.rows) + U(t.rows), s.ag = U(s.ag) + U(t.ag), s.bytes = U(s.bytes) + U(t.bytes)), s.updatedAt = Date.now(), await a.set(s);
  }
  async function _u(e) {
    let t = await ae.sql`select path, id, data from public.docs where collection = 'transactions' and data->>'type' = any(${Ii})
    and coalesce((data->'createdAt'->>'__ts')::numeric::bigint, 0) < ${e} order by coalesce((data->'createdAt'->>'__ts')::numeric::bigint, 0) limit 20000`;
    if (!t.length) return 0;
    let a = await Ri(t.map((s) => s.data.uid)), n = /* @__PURE__ */ new Map();
    t.forEach((s) => {
      let o = Qe(vn(s.data) || e - 1);
      n.has(o) || n.set(o, []), n.get(o).push(s);
    });
    for (let [s, o] of n) {
      let r = o.map((m) => {
        let p = m.data;
        return JSON.stringify({ c: "tx", id: m.id, t: vn(p), uid: p.uid, u: a[p.uid] || "", ty: p.type, d: p.direction, a: U(p.amount), b: p.bucket || "main", g: p.note || "", r: p.ref || "" });
      }), i = Da.gzipSync(Buffer.from(r.join(`
`) + `
`, "utf8")), d = `archive/rounds/${s}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jsonl.gz`;
      await _n(d, i);
      let c = /* @__PURE__ */ new Map();
      o.forEach((m) => {
        let p = m.data, f = String(p.note || "").replace(/ \(free spin\)$| bet cancelled$| win cancelled$/, ""), h = [p.uid, f, p.bucket || "main", p.direction === "out" ? "out" : "in"].join("|"), y = c.get(h) || { uid: p.uid, g: f, b: p.bucket || "main", d: p.direction === "out" ? "out" : "in", a: 0, n: 0 };
        y.a += U(p.amount), /bet$/.test(p.type) && (y.n += 1), c.set(h, y);
      });
      let l = Ia(s) + ht - 1e3, u = [...c.values()].filter((m) => m.a > 0).map((m, p) => {
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
      await ae.sql.begin(async (m) => {
        for (let f = 0; f < u.length; f += 500) {
          let h = u.slice(f, f + 500);
          await m`insert into public.docs (path, collection, id, data) select * from jsonb_to_recordset(${m.json(h)}::jsonb) as x(path text, collection text, id text, data jsonb)`;
        }
        let p = o.map((f) => f.path);
        for (let f = 0; f < p.length; f += 5e3) await m`delete from public.docs where path = any(${p.slice(f, f + 5e3)})`;
      }), await Ls(s, { key: d, rows: o.length, bytes: i.length });
    }
    return t.length;
  }
  async function $u(e) {
    let t = await ae.sql`select path, id, data from public.docs where collection = 'agTransactions' and coalesce((data->>'at')::numeric::bigint, 0) < ${e} order by coalesce((data->>'at')::numeric::bigint, 0) limit 20000`;
    if (!t.length) return 0;
    let a = /* @__PURE__ */ new Map();
    t.forEach((n) => {
      let s = Qe(U(n.data.at) || e - 1);
      a.has(s) || a.set(s, []), a.get(s).push(n);
    });
    for (let [n, s] of a) {
      let o = Da.gzipSync(Buffer.from(s.map((d) => JSON.stringify({ c: "ag", id: d.id, ...d.data })).join(`
`) + `
`, "utf8")), r = `archive/rounds/${n}/${Date.now()}-ag-${Math.random().toString(36).slice(2, 7)}.jsonl.gz`;
      await _n(r, o);
      let i = s.map((d) => d.path);
      for (let d = 0; d < i.length; d += 5e3) await ae.sql`delete from public.docs where path = any(${i.slice(d, d + 5e3)})`;
      await Ls(n, { key: r, ag: s.length, bytes: o.length });
    }
    return t.length;
  }
  async function Cu(e, t) {
    let a = Qe(Date.now() - e * ht), n = t > 0 ? Qe(Date.now() - t * ht) : "", s = await V.collection("archiveDays").get(), o = 0;
    for (let r of s.docs) {
      let i = r.data(), d = r.id < a && (i.parts || []).length, c = n && r.id < n && (i.money || []).length;
      if (!(!d && !c)) {
        if (d) {
          for (let l of i.parts || []) await Me.deleteObject(l);
          i.parts = [], i.rows = 0, i.ag = 0, i.bytes = 0, i.gamePurgedAt = Date.now();
        }
        if (c) {
          for (let l of i.money || []) await Me.deleteObject(l);
          i.money = [], i.mrows = 0, i.mbytes = 0;
        }
        !(i.parts || []).length && !(i.money || []).length ? await V.doc(`archiveDays/${r.id}`).delete() : await V.doc(`archiveDays/${r.id}`).set(i), o++;
      }
    }
    return o;
  }
  var kn = (e, t) => `select path, id, data from public.docs where collection = '${e}' ${t}`, Ze = (e) => `coalesce((data->'${e}'->>'__ts')::numeric::bigint, case when jsonb_typeof(data->'${e}') = 'number' then (data->>'${e}')::numeric::bigint end, 0)`;
  async function Nu(e, t) {
    let n = Math.min(e, t), s = Ii.map((p) => `'${p}'`).join(","), o = await ae.sql.unsafe(kn("transactions", `and data->>'type' not in (${s}) and ${Ze("createdAt")} < $1 order by ${Ze("createdAt")} limit 8000`), [n]), r = await ae.sql.unsafe(kn("deposits", `and data->>'status' <> 'pending' and ${Ze("createdAt")} < $1 and ${Ze("reviewedAt")} < $2 order by ${Ze("createdAt")} limit 8000`), [n, t]), i = await ae.sql.unsafe(kn("withdrawals", `and data->>'status' in ('approved','rejected') and ${Ze("createdAt")} < $1 and ${Ze("reviewedAt")} < $2 order by ${Ze("createdAt")} limit 8000`), [n, t]), d = await ae.sql.unsafe(kn("lotteryTickets", `and ${Ze("createdAt")} < $1 and data->>'lotteryId' in (select id from public.docs where collection = 'lotteries' and data->>'status' in ('drawn','cancelled')) order by ${Ze("createdAt")} limit 8000`), [n]), c = [...o.map((p) => ["tx", p]), ...r.map((p) => ["dep", p]), ...i.map((p) => ["wd", p]), ...d.map((p) => ["tk", p])];
    if (!c.length) return 0;
    let l = await Ri(c.map(([, p]) => p.data.uid)), u = /* @__PURE__ */ new Map();
    c.forEach(([p, f]) => {
      let h = Qe(vn(f.data) || n - 1);
      u.has(h) || u.set(h, []), u.get(h).push([p, f]);
    });
    let m = An().__books;
    for (let [p, f] of u) {
      let h = f.map(([S, g]) => JSON.stringify({ c: S, id: g.id, t: vn(g.data), u: l[g.data.uid] || g.data.username || "", d: g.data })), y = Da.gzipSync(Buffer.from(h.join(`
`) + `
`, "utf8")), w = `archive/money/${p}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jsonl.gz`;
      await _n(w, y);
      let v = /* @__PURE__ */ new Map();
      f.forEach(([S, g]) => {
        if (S !== "tx" || !g.data.uid) return;
        let b = g.data, k = ["main", "winning", "referral", "commission"].includes(b.bucket) ? b.bucket : "main", $ = "userBooks/" + b.uid;
        v.has($) || v.set($, { carry: {} });
        let N = v.get($).carry;
        N[k] = Math.round((U(N[k]) + U(b.amount) * (b.direction === "out" ? -1 : 1)) * 100) / 100;
      }), await ae.sql.begin(async (S) => {
        await m.mergeDocs(S, v);
        let g = f.map(([, b]) => b.path);
        for (let b = 0; b < g.length; b += 5e3) await S`delete from public.docs where path = any(${g.slice(b, b + 5e3)})`;
      }), await Ls(p, { key: w, rows: f.length, bytes: y.length, money: !0 });
    }
    return c.length;
  }
  async function qs(e) {
    if (!Me.configured()) return [];
    let t = await V.doc(`archiveDays/${e}`).get();
    if (!t.exists) return [];
    let a = [];
    for (let n of t.data().money || []) {
      let s = await Ei(n);
      for (let o of s.split(`
`))
        if (o)
          try {
            a.push(JSON.parse(o));
          } catch {
          }
    }
    return a;
  }
  async function xs(e) {
    let t = V.doc("archiveMeta/backup");
    if (!Me.configured())
      return await t.set({ lastRun: Date.now(), ok: !1, error: "storage", by: e }, { merge: !0 }), { ok: !1, error: "storage" };
    let a = await Tn();
    if (e === "auto" && !a.backup) return { ok: !1, error: "off" };
    let n = Qe(Date.now()), s = Date.now();
    try {
      let o = Da.createGzip({ level: 6 }), r = [];
      o.on("data", (f) => r.push(f));
      let i = new Promise((f, h) => {
        o.on("end", f), o.on("error", h);
      }), d = "", c = 0;
      for (; ; ) {
        let f = await ae.sql`select path, collection, id, data from public.docs where path > ${d} order by path limit 5000`;
        if (!f.length || (o.write(f.map((h) => JSON.stringify(h)).join(`
`) + `
`) || await new Promise((h) => o.once("drain", h)), c += f.length, d = f[f.length - 1].path, f.length < 5e3)) break;
      }
      o.end(), await i;
      let l = Buffer.concat(r), u = `backup/full/${n}-${Date.now().toString(36)}.jsonl.gz`;
      await _n(u, l), await V.doc(`backups/${n}`).set({ day: n, key: u, rows: c, bytes: l.length, at: Date.now(), by: e, ms: Date.now() - s });
      let m = (await V.collection("backups").get()).docs.map((f) => ({ id: f.id, ...f.data() })).sort((f, h) => f.id < h.id ? 1 : -1);
      for (let f of m.slice(a.backupKeep))
        await Me.deleteObject(f.key).catch(() => null), await V.doc(`backups/${f.id}`).delete();
      let p = { ok: !0, lastRun: Date.now(), rows: c, bytes: l.length, by: e, error: "" };
      return await t.set(p, { merge: !0 }), p;
    } catch (o) {
      let r = { ok: !1, lastRun: Date.now(), error: String(o && o.message || o).slice(0, 200), by: e };
      return await t.set(r, { merge: !0 }), r;
    }
  }
  async function js(e) {
    let t = V.doc("archiveMeta/state");
    if (!Me.configured())
      return await t.set({ lastRun: Date.now(), ok: !1, error: "storage", by: e }, { merge: !0 }), { ok: !1, error: "storage" };
    if (!ae || !ae.sql) return { ok: !1, error: "db" };
    let a = await Tn();
    if (e === "auto" && !a.enabled) return { ok: !1, error: "off" };
    let n = Ia(Qe(Date.now())), s = 0, o = 0, r = 0, i = 0, d = "", c = Date.now();
    try {
      let u = An().__books;
      await u.rollup();
      let m = await u.upToNow(), p = Math.min(n - (a.afterDays - 1) * ht, m), f = n - Math.max(3, a.afterDays) * ht, h = n - (a.moneyDays - 1) * ht;
      for (let y = 0; y < 40 && Date.now() - c < 9e4; y++) {
        let w = await _u(p);
        if (s += w, w < 2e4) break;
      }
      for (let y = 0; y < 20 && Date.now() - c < 12e4; y++) {
        let w = await Nu(h, m);
        if (r += w, w < 8e3) break;
      }
      for (let y = 0; y < 20 && Date.now() - c < 14e4; y++) {
        let w = await $u(f);
        if (o += w, w < 2e4) break;
      }
      i = await Cu(a.keepDays, a.moneyKeep);
    } catch (u) {
      d = String(u && u.message || u).slice(0, 200);
    }
    let l = { ok: !d, rounds: s, ag: o, money: r, purged: i, error: d, lastRun: Date.now(), by: e };
    return await t.set(l, { merge: !0 }), l;
  }
  Ue.archiveTick = Ni({ region: et, schedule: "0 3 * * *", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    await js("auto");
  });
  Ue.adminArchiveRun = wt({ region: et, timeoutSeconds: 300 }, async (e) => {
    let t = ke.requireRole(e, ["super", "finance"]);
    return js(t);
  });
  Ue.adminArchiveStatus = wt({ region: et }, async (e) => {
    ke.requireRole(e, ["super", "finance"]);
    let [t, a, n] = await Promise.all([Tn(), V.doc("archiveMeta/state").get(), V.collection("archiveDays").get()]), s = null;
    if (ae && ae.sql)
      try {
        let [o] = await ae.sql`select pg_database_size(current_database())::bigint as b`, r = await ae.sql`select collection, count(*)::int as n from public.docs where collection in ('transactions','agTransactions','notifications','auditLogs','loginEvents','deposits','withdrawals','users') group by collection`;
        s = { bytes: Number(o.b), counts: Object.fromEntries(r.map((i) => [i.collection, i.n])) };
      } catch {
        s = null;
      }
    return {
      configured: Me.configured(),
      cfg: t,
      state: a.exists ? a.data() : null,
      db: s,
      backup: (await V.doc("archiveMeta/backup").get()).data() || null,
      days: n.docs.map((o) => ({
        day: o.id,
        rows: U(o.data().rows),
        ag: U(o.data().ag),
        bytes: U(o.data().bytes) + U(o.data().mbytes),
        parts: (o.data().parts || []).length,
        mrows: U(o.data().mrows),
        mparts: (o.data().money || []).length
      })).sort((o, r) => o.day < r.day ? 1 : -1)
    };
  });
  Ue.adminArchiveDay = wt({ region: et, timeoutSeconds: 120 }, async (e) => {
    ke.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = String(t.day || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a)) throw ke.bad("Invalid day.");
    let n = await V.doc(`archiveDays/${a}`).get();
    if (!n.exists) throw new ea("not-found", "\u098F\u0987 \u09A6\u09BF\u09A8\u09C7\u09B0 \u0986\u09B0\u09CD\u0995\u09BE\u0987\u09AD \u09A8\u09C7\u0987\u0964");
    let s = String(t.q || "").trim().toLowerCase().slice(0, 60), o = String(t.game || "").slice(0, 120), r = 3e3, i = [], d = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = 0, u = 0, m = 0, p = /* @__PURE__ */ new Set();
    for (let f of n.data().parts || []) {
      if (/-ag-/.test(f)) continue;
      let h = await Ei(f);
      for (let y of h.split(`
`)) {
        if (!y) continue;
        let w;
        try {
          w = JSON.parse(y);
        } catch {
          continue;
        }
        if (w.c !== "tx" || (c.set(w.g, (c.get(w.g) || 0) + 1), o && w.g !== o) || s && !(String(w.u).toLowerCase().includes(s) || String(w.uid).toLowerCase().startsWith(s) || String(w.g).toLowerCase().includes(s))) continue;
        l++, p.add(w.uid), w.d === "out" ? u += w.a : m += w.a;
        let v = w.uid + "|" + w.g, S = d.get(v) || { u: w.u || w.uid.slice(0, 8), uid: w.uid, g: w.g, n: 0, bet: 0, win: 0 };
        /bet$/.test(w.ty) && S.n++, w.d === "out" ? S.bet += w.a : S.win += w.a, d.set(v, S), i.length < r && i.push({ t: w.t, u: w.u, uid: w.uid, g: w.g, ty: w.ty, d: w.d, a: w.a, b: w.b });
      }
    }
    return i.sort((f, h) => f.t - h.t), {
      day: a,
      total: l,
      players: p.size,
      bet: Math.round(u * 100) / 100,
      win: Math.round(m * 100) / 100,
      truncated: l > i.length,
      rows: i,
      groups: [...d.values()].sort((f, h) => h.bet - f.bet).slice(0, 200),
      games: [...c.entries()].sort((f, h) => h[1] - f[1]).slice(0, 60).map(([f, h]) => ({ g: f, n: h }))
    };
  });
  Ue.adminArchiveDownload = wt({ region: et }, async (e) => {
    ke.requireRole(e, ["super", "finance"]);
    let t = String((e.data || {}).day || ""), a = await V.doc(`archiveDays/${t}`).get();
    if (!a.exists) throw new ea("not-found", "\u098F\u0987 \u09A6\u09BF\u09A8\u09C7\u09B0 \u0986\u09B0\u09CD\u0995\u09BE\u0987\u09AD \u09A8\u09C7\u0987\u0964");
    return { files: await Promise.all((a.data().parts || []).map(async (n) => ({ name: n.split("/").pop(), url: await Me.presign("GET", n, { expires: 300 }) }))) };
  });
  Ue.backupTick = Ni({ region: et, schedule: "30 2 * * *", timeZone: "Asia/Dhaka", timeoutSeconds: 300 }, async () => {
    await xs("auto");
  });
  Ue.adminBackups = wt({ region: et, timeoutSeconds: 300 }, async (e) => {
    let t = ke.requireRole(e, ["super", "finance"]), a = e.data || {};
    if (a.run) {
      if (e.auth.token.role !== "super") throw new ea("permission-denied", "\u09B6\u09C1\u09A7\u09C1 Super Admin \u098F\u0996\u09A8\u0987 \u09AC\u09CD\u09AF\u09BE\u0995\u0986\u09AA \u099A\u09BE\u09B2\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u0964");
      await xs(t);
    }
    if (a.download) {
      let o = await V.doc(`backups/${String(a.download).slice(0, 12)}`).get();
      if (!o.exists) throw new ea("not-found", "\u098F\u0987 \u09AC\u09CD\u09AF\u09BE\u0995\u0986\u09AA \u09A8\u09C7\u0987\u0964");
      return ke.audit(null, t, "backup_download", { day: o.id }), { url: await Me.presign("GET", o.data().key, { expires: 300 }) };
    }
    let n = (await V.collection("backups").get()).docs.map((o) => ({ day: o.id, rows: U(o.data().rows), bytes: U(o.data().bytes), at: U(o.data().at), by: o.data().by || "" })).sort((o, r) => o.day < r.day ? 1 : -1), s = await V.doc("archiveMeta/backup").get();
    return { configured: Me.configured(), list: n, state: s.exists ? s.data() : null, cfg: await Tn() };
  });
  Ue.adminArchiveSearch = wt({ region: et, timeoutSeconds: 120 }, async (e) => {
    ke.requireRole(e, ["super", "finance", "support"]);
    let t = e.data || {}, a = String(t.q || "").trim().toLowerCase().slice(0, 60);
    if (a.length < 3) throw ke.bad("\u0985\u09A8\u09CD\u09A4\u09A4 \u09E9\u099F\u09BE \u0985\u0995\u09CD\u09B7\u09B0 \u09B2\u09BF\u0996\u09C1\u09A8\u0964");
    let n = /^\d{4}-\d{2}-\d{2}$/, s = n.test(t.to || "") ? t.to : Qe(Date.now()), o = n.test(t.from || "") ? t.from : Qe(Ia(s) - 30 * ht);
    if (Ia(s) - Ia(o) > 62 * ht) throw ke.bad("\u098F\u0995\u09AC\u09BE\u09B0\u09C7 \u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09EC\u09E8 \u09A6\u09BF\u09A8 \u0996\u09CB\u0981\u099C\u09BE \u09AF\u09BE\u09AF\u09BC\u0964");
    let r = (await V.collection("archiveDays").get()).docs.filter((c) => c.id >= o && c.id <= s && (c.data().money || []).length).map((c) => c.id).sort().reverse(), i = [], d = 0;
    for (let c of r) {
      for (let l of await qs(c)) {
        d++;
        let u = l.d || {};
        if ([l.u, u.uid, u.username, u.trxId, u.accountNumber, u.senderNumber, u.holderName, u.note, u.ref, l.id].map((p) => String(p || "").toLowerCase()).some((p) => p.includes(a)) && (i.push({ day: c, c: l.c, id: l.id, t: l.t, u: l.u, uid: u.uid, type: u.type || "", status: u.status || "", amount: U(u.amount), net: U(u.net), method: u.methodName || "", trxId: u.trxId || "", account: u.accountNumber || "", direction: u.direction || "", note: String(u.note || "").slice(0, 80), number: u.number }), i.length >= 300))
          break;
      }
      if (i.length >= 300) break;
    }
    return { q: a, from: o, to: s, days: r.length, scanned: d, hits: i };
  });
  Ue.myOldMonths = wt({ region: et }, async (e) => {
    ke.authUid(e);
    let t = (await V.collection("archiveDays").get()).docs.filter((a) => (a.data().money || []).length).map((a) => a.id.slice(0, 7));
    return { months: [...new Set(t)].sort().reverse() };
  });
  var Sn = /* @__PURE__ */ new Map();
  Ue.myOldHistory = wt({ region: et, timeoutSeconds: 120 }, async (e) => {
    let t = ke.authUid(e), a = String((e.data || {}).month || "");
    if (!/^\d{4}-\d{2}$/.test(a)) throw ke.bad("Invalid month.");
    let n = Date.now(), o = (Sn.get(t) || []).filter((l) => n - l < 36e5);
    if (o.length >= 20) throw new ea("resource-exhausted", "\u098F\u0995\u099F\u09C1 \u09AA\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964");
    o.push(n), Sn.set(t, o), Sn.size > 5e3 && Sn.clear();
    let r = await V.doc("settings/content").get(), i = r.exists && r.data().features && r.data().features.histgames === !0, d = (await V.collection("archiveDays").get()).docs.filter((l) => l.id.startsWith(a) && (l.data().money || []).length).map((l) => l.id).sort(), c = [];
    for (let l of d) for (let u of await qs(l)) {
      let m = u.d || {};
      if (m.uid === t)
        if (u.c === "tx") {
          if (!i && m.type === "game_day") continue;
          c.push({ k: "tx", id: u.id, t: u.t, type: m.type, direction: m.direction, amount: U(m.amount), bucket: m.bucket || "main", note: String(m.note || "").slice(0, 80) });
        } else u.c === "dep" ? c.push({ k: "dep", id: u.id, t: u.t, amount: U(m.amount), status: m.status, method: m.methodName || "", trxId: m.trxId || "" }) : u.c === "wd" ? c.push({ k: "wd", id: u.id, t: u.t, amount: U(m.amount), net: U(m.net), status: m.status, method: m.methodName || "", account: String(m.accountNumber || "").replace(/^(.{3}).*(.{3})$/, "$1\u2022\u2022\u2022$2") }) : u.c === "tk" && c.push({ k: "tk", id: u.id, t: u.t, number: m.number, won: !!m.won, lottery: m.lotteryTitle || "" });
    }
    return c.sort((l, u) => u.t - l.t), { month: a, items: c.slice(0, 2e3), more: c.length > 2e3 };
  });
  Ue.__archive = { runArchive: js, runBackup: xs, moneyOfDay: qs, net: Bs, dayKey: Qe };
});

// src/index.js
var Mi = E((rt) => {
  "use strict";
  Object.assign(
    rt,
    wo(),
    Mo(),
    Bo(),
    Fo(),
    Zo(),
    er(),
    ks(),
    Fr(),
    Yr(),
    Qr(),
    ti(),
    ca(),
    ii(),
    Ai(),
    Us(),
    An()
  );
  delete rt.ensureUserDoc;
  delete rt.LOBBY;
  delete rt.forceLogoutOne;
  delete rt.helpers;
  delete rt.__net;
  delete rt.__archive;
  delete rt.__books;
});

// supa/handler.js
var Bi = E(($l, Ui) => {
  "use strict";
  var fe = bt(), { HttpsError: Oi } = ee(), Iu = {
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
  }, Du = (e) => String(e).toUpperCase().replace(/-/g, "_"), Eu = null, $n = () => Eu ||= Mi();
  function Pi(e) {
    return {
      "access-control-allow-origin": fe.env.ALLOWED_ORIGIN || "*",
      "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
      "access-control-allow-methods": "POST, GET, OPTIONS",
      "access-control-max-age": "86400",
      vary: "origin",
      ...e
    };
  }
  var ze = (e, t, a) => ({ status: e, headers: Pi({ "content-type": "application/json", "cache-control": "no-store", ...a || {} }), body: JSON.stringify(t) }), Ru = (e) => e instanceof Oi || e && e.name === "HttpsError" ? ze(Iu[e.code] || 500, { error: { status: Du(e.code), code: e.code, message: e.message, details: e.details === void 0 ? null : e.details } }) : (console.error("unhandled", e && e.stack || e), ze(500, { error: { status: "INTERNAL", code: "internal", message: "Something went wrong on the server. Please try again.", details: null } })), Cn = fe.tokenCache = /* @__PURE__ */ new Map();
  async function Mu(e) {
    if (fe.verifyToken) return fe.verifyToken(e);
    let t = Cn.get(e);
    if (t && t.exp > Date.now()) return t.user;
    let a = String(fe.env.SUPABASE_URL || "").replace(/\/$/, "") + "/auth/v1/user", n = await fe.fetch(a, { headers: { apikey: fe.env.SUPABASE_ANON_KEY || fe.env.SUPABASE_SERVICE_ROLE_KEY || "", authorization: "Bearer " + e } });
    if (!n.ok) return null;
    let s = await n.json();
    if (!s || !s.id) return null;
    let o = { uid: s.id, email: s.email || "", confirmed: !!s.email_confirmed_at, app: s.app_metadata || {}, lastSignIn: s.last_sign_in_at };
    return Cn.set(e, { user: o, exp: Date.now() + (Number(fe.env.TOKEN_CACHE_MS) >= 0 && fe.env.TOKEN_CACHE_MS !== void 0 && fe.env.TOKEN_CACHE_MS !== "" ? Number(fe.env.TOKEN_CACHE_MS) : 3e3) }), Cn.size > 500 && Cn.clear(), o;
  }
  var Ou = (e) => e && {
    uid: e.uid,
    token: { uid: e.uid, email: e.email, email_verified: e.confirmed || !fe.requireVerified(), admin: e.app.admin === !0, role: e.app.role || null, lim: Array.isArray(e.app.lim) ? e.app.lim : null, auth_time: e.lastSignIn ? Math.floor(Date.parse(e.lastSignIn) / 1e3) : void 0 }
  }, Gs = (e) => e == null ? Buffer.alloc(0) : Buffer.from(e), Pu = (e) => {
    let t = {};
    for (let [a, n] of Object.entries(e || {})) t[String(a).toLowerCase()] = n;
    return t;
  };
  async function Uu(e) {
    let t = Pu(e.headers), a = String(e.method || "GET").toUpperCase();
    if (a === "OPTIONS") return { status: 204, headers: Pi(), body: "" };
    let s = new URL(e.url, "http://x").pathname, o = s.indexOf("/api/");
    o >= 0 ? s = s.slice(o + 4) : s.endsWith("/api") && (s = "/"), s = s.replace(/\/+$/, "") || "/";
    try {
      if (s === "/health") return ze(200, { ok: !0, time: Date.now() });
      if (s === "/agw" || s.startsWith("/agw/")) {
        let f = $n().agCallback, h = { status: 200, headers: {}, body: "" }, y = { status(w) {
          return h.status = w, y;
        }, set(w) {
          return Object.assign(h.headers, w), y;
        }, send(w) {
          return h.body = w, y;
        } };
        return await f({ method: a, path: s, url: s, headers: t, rawBody: Gs(e.body), ip: t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : "" }, y), { status: h.status, headers: { "cache-control": "no-store", ...h.headers }, body: typeof h.body == "string" ? h.body : JSON.stringify(h.body) };
      }
      if (s === "/tg") {
        if (!fe.env.TELEGRAM_WEBHOOK_SECRET || t["x-telegram-bot-api-secret-token"] !== fe.env.TELEGRAM_WEBHOOK_SECRET) return ze(401, { ok: !1 });
        let f = null;
        try {
          f = JSON.parse(Gs(e.body).toString("utf8") || "{}");
        } catch {
          f = null;
        }
        try {
          await $n().telegramHook(f);
        } catch {
        }
        return ze(200, { ok: !0 });
      }
      if (s.startsWith("/_cron/")) {
        if (!fe.env.CRON_SECRET || t["x-cron-secret"] !== fe.env.CRON_SECRET) return ze(401, { error: { code: "unauthenticated", message: "bad secret" } });
        let f = $n()[s.slice(7)];
        return !f || f.__kind !== "schedule" ? ze(404, { error: { code: "not-found", message: "unknown job" } }) : (await f(), ze(200, { ok: !0 }));
      }
      if (a !== "POST") return ze(405, { error: { code: "invalid-argument", message: "POST only" } });
      let r = s.slice(1), i = $n()[r];
      if (!i || i.__kind !== "call") return ze(404, { error: { status: "NOT_FOUND", code: "not-found", message: "Unknown function." } });
      let d = null, c = /^Bearer\s+(.+)$/i.exec(t.authorization || "");
      if (c) {
        let f = await Mu(c[1]).catch(() => null);
        f && (d = Ou(f));
      }
      let l = {}, u = Gs(e.body).toString("utf8");
      if (u)
        try {
          let f = JSON.parse(u);
          l = f && f.data !== void 0 ? f.data : f;
        } catch {
          throw new Oi("invalid-argument", "Bad JSON.");
        }
      let m = t["x-forwarded-for"] ? String(t["x-forwarded-for"]).split(",")[0].trim() : t["cf-connecting-ip"] || "", p = await i({ data: l, auth: d, fn: r, rawRequest: { headers: t, ip: m } });
      return ze(200, { result: p === void 0 ? null : p });
    } catch (r) {
      return Ru(r);
    }
  }
  Ui.exports = { handle: Uu };
});

// supa/entry-deno.mjs
var Li = Ks(bt(), 1), qi = Ks(Bi(), 1);
import Bu from "npm:postgres@3.4.4";
var xi = {};
for (let e of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET", "REQUIRE_VERIFIED", "ALLOWED_ORIGIN", "SITE_URL", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_REGION"]) xi[e] = Deno.env.get(e) || "";
var Lu = Deno.env.get("DB_URL") || Deno.env.get("SUPABASE_DB_URL"), qu = Bu(Lu, { max: 4, prepare: !1, idle_timeout: 20, connect_timeout: 10, onnotice() {
} });
Li.default.configure({ sql: qu, env: xi });
Deno.serve(async (e) => {
  let t = {};
  e.headers.forEach((s, o) => {
    t[o] = s;
  });
  let a = e.method === "GET" || e.method === "HEAD" || e.method === "OPTIONS" ? void 0 : new Uint8Array(await e.arrayBuffer()), n = await (0, qi.handle)({ method: e.method, url: e.url, headers: t, body: a });
  return new Response(n.status === 204 ? null : n.body, { status: n.status, headers: n.headers });
});
