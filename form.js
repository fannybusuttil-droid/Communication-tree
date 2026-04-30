// ═══════════════════════════════════════════════
// Belita NGO — Add Staff Form (form.js)
// ═══════════════════════════════════════════════

var newSubs = []; // list of subordinate IDs being added

function showAddModal() {
  newSubs = [];
  S.modal = 'addstaff';
  render();
  setTimeout(function() {
    var nb = document.getElementById('nb');
    if (nb) {
      nb.addEventListener('change', function() { updateReportsTo(); });
    }
  }, 50);
}

function updateReportsTo() {
  var nbEl = document.getElementById('nb') || document.getElementById('nb-select'); var base = nbEl ? nbEl.value : '';
  var sel = document.getElementById('nr');
  var subSel = document.getElementById('sub-picker');
  if (!sel) return;

  sel.innerHTML = '<option value="NA">N/A — Directeur de base</option>';
  if (subSel) subSel.innerHTML = '<option value="">+ Ajouter un subordonné...</option>';

  if (!base) {
    sel.innerHTML += '<option value="" disabled>── Choisir une base d\'abord ──</option>';
    return;
  }

  var baseStaff = STAFF.filter(function(s) { return s.base === base; })
    .sort(function(a, b) { return a.name.localeCompare(b.name); });

  baseStaff.forEach(function(s) {
    sel.innerHTML += '<option value="' + s.name + '">' + s.name + ' — ' + s.title + ' (' + s.level + ')</option>';
    if (subSel && !newSubs.includes(s.id)) {
      subSel.innerHTML += '<option value="' + s.id + '">' + s.name + ' — ' + s.title + ' (' + s.level + ')</option>';
    }
  });
}

function addSubordinate(sel) {
  var id = sel.value;
  if (!id) return;
  if (!newSubs.includes(id)) newSubs.push(id);
  renderSubsList();
  // Remove from picker
  var opt = sel.querySelector('option[value="' + id + '"]');
  if (opt) opt.remove();
  sel.value = '';
}

function removeSubordinate(id) {
  newSubs = newSubs.filter(function(s) { return s !== id; });
  // Re-add to picker
  var sub = STAFF.find(function(s) { return s.id === id; });
  var picker = document.getElementById('sub-picker');
  if (sub && picker) {
    picker.innerHTML += '<option value="' + sub.id + '">' + sub.name + ' — ' + sub.title + ' (' + sub.level + ')</option>';
  }
  renderSubsList();
}

function renderSubsList() {
  var container = document.getElementById('subs-list');
  if (!container) return;
  if (!newSubs.length) {
    container.innerHTML = '<div style="font-size:10px;color:#aaa;font-style:italic;padding:4px 0">Aucun subordonné ajouté</div>';
    return;
  }
  container.innerHTML = '';
  newSubs.forEach(function(sid) {
    var sp = STAFF.find(function(s) { return s.id === sid; });
    if (!sp) return;
    container.innerHTML +=
      '<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:#E8F4F3;border-radius:5px;margin-bottom:4px">'
      + '<div style="width:24px;height:24px;border-radius:50%;background:#1A6B65;display:flex;align-items:center;justify-content:center;color:white;font-size:9px;font-weight:700;flex-shrink:0">' + sp.name.split(' ').map(function(w){return w[0];}).join('').slice(0,2) + '</div>'
      + '<span style="flex:1;font-size:11px;color:#1C2B2A">' + sp.name + ' <span style="color:#4A6361;font-size:9px">— ' + sp.title + '</span></span>'
      + '<button onclick="removeSubordinate(\'' + sid + '\')" style="background:transparent;border:none;color:#C0392B;font-size:16px;cursor:pointer;line-height:1">×</button>'
      + '</div>';
  });
}

function renderAddStaffModal() {
  var h = '<div class="mbg" onclick="if(event.target===this){S.modal=null;render()}">'
    + '<div class="mbox" onclick="event.stopPropagation()">'
    + '<div class="mh2">+ Ajouter un staff</div>'
    + '<div class="msub">Champs * obligatoires</div>';

  // Name
  h += '<div class="form-group"><label class="form-label">Nom *</label>'
    + '<input type="text" class="form-input" id="nn" placeholder="Prénom Nom"></div>';

  // Title
  h += '<div class="form-group"><label class="form-label">Poste *</label>'
    + '<input type="text" class="form-input" id="nt" placeholder="ex: Medical Officer"></div>';

  // Dept
  h += '<div class="form-group"><label class="form-label">Département *</label>'
    + '<select class="form-select" id="nd"><option value="">Choisir...</option>';
  DEPTS.forEach(function(d) { h += '<option value="' + d + '">' + d + '</option>'; });
  h += '</select></div>';

  // Base
  h += '<div class="form-group"><label class="form-label">Base *</label>'
    + '<select class="form-select" id="nb" id="nb-select" onchange="updateReportsTo()"><option value="">Choisir...</option>';
  BASES.forEach(function(b) { h += '<option value="' + b + '">' + b + '</option>'; });
  h += '</select></div>';

  // Level
  h += '<div class="form-group"><label class="form-label">Niveau *</label>'
    + '<select class="form-select" id="nl"><option value="">Choisir...</option>'
    + '<option value="L1">L1 — Directeur de base</option>'
    + '<option value="L2">L2 — Programme Manager</option>'
    + '<option value="L3">L3 — Officer</option>'
    + '<option value="L4">L4 — Field Staff</option>'
    + '</select></div>';

  // Superior
  h += '<div class="form-group"><label class="form-label">Supérieur hiérarchique</label>'
    + '<select class="form-select" id="nr">'
    + '<option value="NA">N/A — Directeur de base</option>'
    + '<option value="" disabled>── Choisir une base d\'abord ──</option>'
    + '</select>'
    + '<div style="font-size:9px;color:#4A6361;margin-top:3px">Se met à jour selon la base sélectionnée</div>'
    + '</div>';

  // Subordinates
  h += '<div class="form-group"><label class="form-label">Subordonnés</label>'
    + '<div id="subs-list"><div style="font-size:10px;color:#aaa;font-style:italic;padding:4px 0">Aucun subordonné ajouté</div></div>'
    + '<select class="form-select" id="sub-picker" onchange="addSubordinate(this)" style="margin-top:6px">'
    + '<option value="">+ Ajouter un subordonné...</option>'
    + '</select>'
    + '<div style="font-size:9px;color:#4A6361;margin-top:3px">Se met à jour selon la base sélectionnée</div>'
    + '</div>';

  // Phone
  h += '<div class="form-group"><label class="form-label">Téléphone</label>'
    + '<input type="text" class="form-input" id="np" placeholder="+000 00 000 0000"></div>';

  // Email
  h += '<div class="form-group"><label class="form-label">Email</label>'
    + '<input type="email" class="form-input" id="ne" placeholder="nom@belita.org"></div>';

  // Buttons
  h += '<button class="mbtn" style="background:#C9A84C;color:#1C2B2A" onclick="addStaff()">💾 Enregistrer</button>'
    + '<button class="mbtn" style="background:transparent;color:#4A6361;border:1px solid #e2e6e5" onclick="S.modal=null;render()">Annuler</button>'
    + '</div></div>';

  return h;
}

async function addStaff() {
  var f = {
    name:      document.getElementById('nn').value.trim(),
    title:     document.getElementById('nt').value.trim(),
    dept:      document.getElementById('nd').value,
    base:      document.getElementById('nb').value,
    level:     document.getElementById('nl').value,
    phone:     document.getElementById('np').value.trim() || '+000 00 000 0000',
    email:     document.getElementById('ne').value.trim(),
    reportsTo: document.getElementById('nr').value
  };

  if (!f.name || !f.title || !f.dept || !f.base || !f.level) {
    alert('Remplir les champs obligatoires (*)');
    return;
  }

  if (!f.email) f.email = f.name.toLowerCase().replace(/\s+/g, '.') + '@belita.org';
  if (f.reportsTo === 'NA' || !f.reportsTo) f.reportsTo = 'N/A';

  // Generate ID
  var px = f.base.slice(0, 3).toUpperCase();
  var nums = STAFF.filter(function(s) { return s.id.startsWith(px); })
    .map(function(s) { return parseInt(s.id.split('-')[1]); });
  var nextNum = nums.length ? Math.max.apply(null, nums) + 1 : 1;
  var ns = {
    id: px + '-' + nextNum.toString().padStart(3, '0'),
    base: f.base, name: f.name, title: f.title,
    dept: f.dept, level: f.level, reportsTo: f.reportsTo,
    phone: f.phone, email: f.email
  };

  // Save to Supabase
  if (AUTH.org_id) {
    var r = await sb.from('staff').insert({
      id: ns.id, org_id: AUTH.org_id, base: ns.base,
      name: ns.name, title: ns.title, dept: ns.dept,
      level: ns.level, reports_to: ns.reportsTo,
      phone: ns.phone, email: ns.email
    });
    if (r.error) { alert('Erreur Supabase: ' + r.error.message); return; }
  }

  STAFF.push(ns);

  // Update subordinates reportsTo
  newSubs.forEach(function(sid) {
    var sub = STAFF.find(function(s) { return s.id === sid; });
    if (sub) {
      sub.reportsTo = ns.name;
      if (AUTH.org_id) {
        sb.from('staff').update({ reports_to: ns.name }).eq('id', sid).eq('org_id', AUTH.org_id);
      }
    }
  });

  saveStaff();

  // Reset tree layout for this base
  if (S.treePositions[ns.base]) delete S.treePositions[ns.base];
  saveTree();

  newSubs = [];
  S.modal = null;
  S.tab = 'orgchart';
  S.ob = ns.base;
  S.od = 'All';
  render();

  alert('✅ ' + ns.name + ' ajouté avec succès !');
}
