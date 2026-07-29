#!/usr/bin/env python3
"""
Παράγει προσβάσιμη (tagged) εκδοχή της αφίσας δημοσιότητας ΔΥΠΑ,
σύμφωνα με το EN 301 549, Κεφ. 10 (non-web documents).

Το πρωτότυπο PDF είναι outlined ("Print To PDF"): 0 χαρακτήρες εξαγώγιμου
κειμένου, άρα εντελώς μη προσβάσιμο. Εδώ:
  * διατηρείται η διανυσματική εικαστική ταυτότητα (show_pdf_page)
  * προστίθεται αόρατο επίπεδο πραγματικού κειμένου (render mode 3)
  * το περιεχόμενο σημαίνεται (BDC/EMC + StructTreeRoot) ως H1/P/Figure
  * ορίζονται /Lang, τίτλος εγγράφου και DisplayDocTitle
"""
import sys
import fitz

SRC, DST = sys.argv[1], sys.argv[2]
FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

TITLE = "Δράσεις Συμβουλευτικής, Κατάρτισης, Απασχόλησης και Επιχειρηματικότητας ανέργων — Δ.ΥΠ.Α."

# (τύπος ετικέτας, κείμενο, περιοχή σε ποσοστά της σελίδας)
BLOCKS = [
    ("H1", "Δράσεις Συμβουλευτικής, Κατάρτισης, Απασχόλησης και Επιχειρηματικότητας ανέργων",
     (0.06, 0.06, 0.94, 0.20)),
    ("P", "στις Περιφερειακές Ενότητες Καστοριάς, Αχαΐας, Σερρών, Ρόδου και στους Δήμους "
          "Περάματος, Κερατσινίου – Δραπετσώνας και Σαλαμίνας",
     (0.06, 0.21, 0.94, 0.36)),
    ("P", "Φορέας Υλοποίησης: Δημόσια Υπηρεσία Απασχόλησης (Δ.ΥΠ.Α.)",
     (0.06, 0.42, 0.55, 0.50)),
    ("P", "Οι δράσεις εντάσσονται στα «Προγράμματα Ανοικτού Τύπου στο πλαίσιο των Ενεργητικών "
          "Πολιτικών Απασχόλησης» και υλοποιούνται με πόρους του Ταμείου Ανάκαμψης και "
          "Ανθεκτικότητας της Ευρωπαϊκής Ένωσης – NextGenerationEU.",
     (0.06, 0.60, 0.52, 0.80)),
    ("P", "Ελληνική Δημοκρατία — Υπουργείο Εργασίας και Κοινωνικής Ασφάλισης. "
          "Ελλάδα 2.0 — Εθνικό Σχέδιο Ανάκαμψης και Ανθεκτικότητας. "
          "Με τη χρηματοδότηση της Ευρωπαϊκής Ένωσης — NextGenerationEU.",
     (0.06, 0.88, 0.94, 0.98)),
]

FIGURE_ALT = (
    "Αφίσα δημοσιότητας της Δημόσιας Υπηρεσίας Απασχόλησης σε αποχρώσεις του μπλε. "
    "Εικονογράφηση με ανθρώπινες φιγούρες και εικονίδια που συνδέονται μεταξύ τους και "
    "συμβολίζουν τη συμβουλευτική, την πιστοποίηση, την κατάρτιση και την απασχόληση. "
    "Στο κάτω μέρος τα λογότυπα: Ελληνική Δημοκρατία – Υπουργείο Εργασίας και Κοινωνικής "
    "Ασφάλισης, Ελλάδα 2.0 – Εθνικό Σχέδιο Ανάκαμψης και Ανθεκτικότητας, και σημαία της "
    "Ευρωπαϊκής Ένωσης με την ένδειξη «Με τη χρηματοδότηση της Ευρωπαϊκής Ένωσης – "
    "NextGenerationEU». Ολόκληρο το κείμενο της αφίσας παρατίθεται σε αυτό το έγγραφο."
)

src = fitz.open(SRC)
spage = src[0]
W, H = spage.rect.width, spage.rect.height

doc = fitz.open()
page = doc.new_page(width=W, height=H)


def contents_set():
    return set(page.get_contents())


# --- 1. Εικαστικό (διανυσματικά, χωρίς απώλεια ποιότητας) --------------
before = contents_set()
page.show_pdf_page(page.rect, src, 0)
figure_streams = contents_set() - before

# --- 2. Αόρατο επίπεδο πραγματικού κειμένου ----------------------------
page.insert_font(fontname="GRK", fontfile=FONT)
text_streams = []
for tag, text, (x0, y0, x1, y1) in BLOCKS:
    before = contents_set()
    rect = fitz.Rect(x0 * W, y0 * H, x1 * W, y1 * H)
    size = 22
    while size >= 5:
        # render_mode=3 → αόρατο, αλλά κανονικά εξαγώγιμο/αναγνώσιμο κείμενο
        rc = page.insert_textbox(rect, text, fontname="GRK", fontsize=size,
                                 render_mode=3, align=0)
        if rc >= 0:
            break
        size -= 1
    else:
        raise SystemExit(f"Δεν χώρεσε το μπλοκ: {text[:40]}")
    new = contents_set() - before
    if not new:
        raise SystemExit("Το PyMuPDF δεν δημιούργησε ξεχωριστό content stream")
    text_streams.append((tag, sorted(new)))

# --- 3. Σήμανση περιεχομένου (BDC/EMC) ---------------------------------
# Κάθε content stream τυλίγεται σε ένα marked-content block με μοναδικό MCID.
items = [("Figure", sorted(figure_streams))] + text_streams
mcid_of = {}
for mcid, (tag, xrefs) in enumerate(items):
    mcid_of[mcid] = tag
    for i, xref in enumerate(xrefs):
        stream = doc.xref_stream(xref)
        if i == 0:
            stream = f"/{tag} <</MCID {mcid}>> BDC\n".encode() + stream
        if i == len(xrefs) - 1:
            stream = stream + b"\nEMC\n"
        doc.update_stream(xref, stream)

# --- 4. Δέντρο δομής (StructTreeRoot) ----------------------------------
struct_root = doc.get_new_xref()
document_el = doc.get_new_xref()

elem_xrefs = []
for mcid, (tag, _) in enumerate(items):
    elem_xrefs.append(doc.get_new_xref())

page_xref = page.xref
for mcid, (tag, _) in enumerate(items):
    extra = f"/Alt {fitz.get_pdf_str(FIGURE_ALT)} " if tag == "Figure" else ""
    doc.update_object(elem_xrefs[mcid], (
        f"<< /Type /StructElem /S /{tag} /P {document_el} 0 R "
        f"/Pg {page_xref} 0 R /K {mcid} {extra}>>"
    ))

# Σειρά ανάγνωσης: πρώτα το κείμενο, τελευταία η εικόνα (η σειρά στο /K
# είναι ανεξάρτητη από τη σειρά σχεδίασης που ορίζουν τα MCID).
read_order = elem_xrefs[1:] + elem_xrefs[:1]
kids = " ".join(f"{x} 0 R" for x in read_order)
doc.update_object(document_el, (
    f"<< /Type /StructElem /S /Document /P {struct_root} 0 R /K [ {kids} ] >>"
))

# ParentTree: για /StructParents 0 της σελίδας, πίνακας με σειρά MCID
parent_tree = doc.get_new_xref()
# Το ParentTree ακολουθεί τη σειρά των MCID, όχι τη σειρά ανάγνωσης.
mcid_order = " ".join(f"{x} 0 R" for x in elem_xrefs)
doc.update_object(parent_tree, f"<< /Nums [ 0 [ {mcid_order} ] ] >>")

doc.update_object(struct_root, (
    f"<< /Type /StructTreeRoot /K [ {document_el} 0 R ] "
    f"/ParentTree {parent_tree} 0 R /ParentTreeNextKey 1 >>"
))

# --- 5. Ιδιότητες εγγράφου ---------------------------------------------
page_obj = doc.xref_object(page_xref)
doc.xref_set_key(page_xref, "StructParents", "0")
doc.xref_set_key(page_xref, "Tabs", "/S")

cat = doc.pdf_catalog()
doc.xref_set_key(cat, "Lang", "(el-GR)")
doc.xref_set_key(cat, "MarkInfo", "<< /Marked true >>")
doc.xref_set_key(cat, "StructTreeRoot", f"{struct_root} 0 R")
doc.xref_set_key(cat, "ViewerPreferences", "<< /DisplayDocTitle true >>")

doc.set_metadata({
    "title": TITLE,
    "author": "Δημόσια Υπηρεσία Απασχόλησης (Δ.ΥΠ.Α.)",
    "subject": "Αφίσα δημοσιότητας — Ταμείο Ανάκαμψης και Ανθεκτικότητας, NextGenerationEU",
    "keywords": "ΔΥΠΑ, Ελλάδα 2.0, NextGenerationEU, δημοσιότητα, προσβάσιμο PDF",
})

# Χωρίς subsetting ενσωματώνεται ολόκληρο το Arial Unicode (~17 MB).
doc.subset_fonts(verbose=False)
doc.save(DST, garbage=4, deflate=True, clean=True)
doc.close()

# --- Έλεγχος ------------------------------------------------------------
chk = fitz.open(DST)
txt = chk[0].get_text().strip()
cat = chk.pdf_catalog()
obj = chk.xref_object(cat)
print(f"σελίδες: {len(chk)}")
print(f"εξαγώγιμο κείμενο: {len(txt)} χαρακτήρες")
print(f"Marked: {'/Marked true' in obj}  StructTreeRoot: {'/StructTreeRoot' in obj}  Lang: {'/Lang' in obj}")
print(f"τίτλος: {chk.metadata['title']}")
print("--- πρώτοι 220 χαρακτήρες ---")
print(txt[:220])
