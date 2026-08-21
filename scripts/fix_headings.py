# -*- coding: utf-8 -*-
"""Fix heading hierarchy: replace h5 with h2/h3 (+fs-5 to keep visual size)."""
import re
import pathlib

# files whose first heading is an h1 -> these h5s become h2 (no h2 in between)
TO_H2 = {'src/views/AdminDashboard.vue', 'src/views/AppointmentPage.vue'}


def fix_h5(path, new_tag):
    s = open(path, encoding='utf-8').read()

    def repl_open(m):
        attrs = m.group(1)
        if 'class=' in attrs:
            return '<%s%s fs-5">' % (new_tag, attrs[:-1])
        return '<%s%s class="fs-5">' % (new_tag, attrs)

    s = re.sub(r'<h5([^>]*)>', repl_open, s)
    s = s.replace('</h5>', '</%s>' % new_tag)
    open(path, 'w', encoding='utf-8').write(s)
    return s.count('<' + new_tag)


total = 0
for p in pathlib.Path('src').rglob('*.vue'):
    s = open(p, encoding='utf-8').read()
    if '<h5' in s:
        tag = 'h2' if p.as_posix() in TO_H2 else 'h3'
        n = fix_h5(p, tag)
        total += n
        print('%s: %d h5 -> %s' % (p, n, tag))
print('TOTAL', total)

# ContactPage: 'Send Us a Message' is h3 right after h1 (skips h2) -> h2
cp = 'src/views/ContactPage.vue'
s = open(cp, encoding='utf-8').read()
s = s.replace('<h3 class="mb-4">Send Us a Message</h3>',
              '<h2 class="h3 mb-4">Send Us a Message</h2>')
open(cp, 'w', encoding='utf-8').write(s)
print('ContactPage Send Us a Message h3 -> h2')
