import json, time, http.server
DB={'rsvp':[], 'msg':[]}
class H(http.server.BaseHTTPRequestHandler):
    def _send(self, obj):
        b=json.dumps(obj).encode(); self.send_response(200)
        self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers(); self.wfile.write(b)
    def log_message(self,*a): pass
    def do_GET(self):
        if 'action=notes' in self.path:
            self._send({'ok':True,'notes':[{k:m[k] for k in ('id','t','from','flowers','pos')} for m in DB['msg']]})
        else: self._send({'ok':True})
    def do_POST(self):
        n=int(self.headers.get('Content-Length',0)); body=json.loads(self.rfile.read(n) or b'{}')
        a=body.get('action')
        if a=='rsvp': DB['rsvp'].append(body); print('RSVP', body, flush=True); return self._send({'ok':True})
        if a=='message':
            m=dict(body); m['id']='m%d'%len(DB['msg']); m['t']=int(time.time()*1000); DB['msg'].append(m); print('MSG', m['from'], m['pos'], flush=True); return self._send({'ok':True,'id':m['id'],'t':m['t']})
        if a=='inbox':
            if body.get('password')!='261226': return self._send({'ok':False,'error':'Wrong password'})
            return self._send({'ok':True,'messages':DB['msg']})
        self._send({'ok':False,'error':'Unknown'})
http.server.ThreadingHTTPServer(('127.0.0.1',8766),H).serve_forever()
