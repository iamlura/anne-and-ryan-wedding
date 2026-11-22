import json, time, http.server, hashlib
DB={'rsvp':[], 'msg':[]}
GUESTS=[  # [party, name, email, table, code, rsvp, food, plusName]
 ['Santos Family','Maria Santos','maria@example.com','5','AR-7K2QX9','','',''],
 ['Santos Family','Jose Santos','','5','AR-7K2QX9','','',''],
 ['Racquel Ochoa and Plus One','Racquel Ochoa','racquel@example.com','','AR-PL5ONE','','',''],
 ['Racquel Ochoa and Plus One','Plus One','','','AR-PL5ONE','','',''],
 ['Celine Zamora','Celine Zamora','celine@example.com','','AR-SOLO01','','',''],
 ['Pauline Zamora','Pauline Zamora','','','AR-SOLO02','','',''],
]
FORGOT=[]
def norm(c):
    c=''.join(ch for ch in str(c).upper() if ch.isalnum())
    if c.startswith('AR') and len(c)==8: c=c[2:]
    return 'AR-'+c if len(c)==6 else ''
LOG=[]
def party(c):
    rows=[(i,g) for i,g in enumerate(GUESTS) if g[4]==c]
    if not rows: return None
    g0=rows[0][1]
    return {'name':g0[0],'code':c,'table':g0[3],'email':g0[2],'replied':any(g[5] for _,g in rows),
      'guests':[{'row':i+2,'name':(g[7] if g[1]=='Plus One' else g[1]),'plusOne':g[1]=='Plus One','attending':{'Joyfully accepts':'Yes','Respectfully declines':'No'}.get(g[5],''),'food':g[6]} for i,g in rows]}

class H(http.server.BaseHTTPRequestHandler):
    def _send(self, obj):
        b=json.dumps(obj).encode(); self.send_response(200)
        self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers(); self.wfile.write(b)
    def log_message(self,*a): pass
    def do_GET(self):
        if 'action=log' in self.path: return self._send({'ok':True,'log':LOG})
        if 'action=notes' in self.path:
            self._send({'ok':True,'notes':[{k:m[k] for k in ('id','t','from','flowers','pos')} for m in DB['msg']]})
        else: self._send({'ok':True})
    def do_POST(self):
        n=int(self.headers.get('Content-Length',0)); body=json.loads(self.rfile.read(n) or b'{}')
        a=body.get('action')
        if a=='rsvp': DB['rsvp'].append(body); print('RSVP', body, flush=True); return self._send({'ok':True})
        if a=='login':
            LOG.append('login')
            p=party(norm(body.get('code')))
            return self._send({'ok':True,'party':p} if p else {'ok':False,'error':'nomatch'})
        if a=='find':
            LOG.append('find')  # Nov 17: last name → invitations (code = internal id)
            q=' '.join(''.join(ch if ch.isalpha() else ' ' for ch in str(body.get('last','')).lower()).split())
            seen={}
            for g in GUESTS:
                n=' '.join(''.join(ch if ch.isalpha() else ' ' for ch in g[1].lower()).split())
                if g[1]=='Plus One' or len(q)<2: continue
                if (' '+n).endswith(' '+q) or q in n.split()[1:]: seen.setdefault(g[4], g[0])
            ps=[{'code':c,'name':p} for c,p in seen.items()]
            if len(ps)<=12:
                for x in ps: x['party']=party(x['code'])   # Nov 19: details come with the search (one request)
            return self._send({'ok':True,'parties':ps})
        if a=='forgot': FORGOT.append(body.get('email')); print('FORGOT', body.get('email'), flush=True); return self._send({'ok':True})
        if a=='rsvp_party':
            c=norm(body.get('code')); saved=locked=0
            for x in body.get('guests',[]):
                g=GUESTS[int(x['row'])-2]
                if g[4]!=c: continue
                if g[5]: locked+=1; continue   # Nov 22: sent answers are locked
                saved+=1
                g[5]={'Yes':'Joyfully accepts','No':'Respectfully declines'}[x['attending']]; g[6]=x.get('food','') if x['attending']=='Yes' else ''
                if g[1]=='Plus One': g[7]=x.get('name','')
                print('RSVP', g, flush=True)
            if not saved and locked: return self._send({'ok':False,'error':'This RSVP was already sent.'})
            return self._send({'ok':True})
        if a=='message':
            m=dict(body); m['id']='m%d'%len(DB['msg']); m['t']=int(time.time()*1000); m['key']=hashlib.sha256(m.pop('token','').encode()).hexdigest(); DB['msg'].append(m); print('MSG', m['from'], m['pos'], flush=True); return self._send({'ok':True,'id':m['id'],'t':m['t']})
        if a=='inbox':
            if body.get('password')!='261226': return self._send({'ok':False,'error':'Wrong password'})
            return self._send({'ok':True,'messages':[{k:v for k,v in m.items() if k!='key'} for m in DB['msg']]})
        if a=='delete':
            k=hashlib.sha256(body.get('token','').encode()).hexdigest()
            for m in DB['msg']:
                if m['id']==body.get('id'):
                    if m['key']!=k: return self._send({'ok':False,'error':"Couldn't delete this letter."})
                    DB['msg'].remove(m); print('DEL', m['id'], flush=True); break
            return self._send({'ok':True})
        self._send({'ok':False,'error':'Unknown'})
http.server.ThreadingHTTPServer(('127.0.0.1',8766),H).serve_forever()
