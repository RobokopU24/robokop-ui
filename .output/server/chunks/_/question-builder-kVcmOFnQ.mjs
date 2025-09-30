import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Button, Dialog, DialogTitle, IconButton, DialogContent, Tooltip, Popover, Paper, Modal, List, ListItemButton, ListItemText, Chip, ListSubheader, Divider, DialogActions, Collapse, Autocomplete, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';
import { withStyles, makeStyles } from '@mui/styles';
import { blue } from '@mui/material/colors';
import React, { useState, useEffect, useReducer, useContext, useMemo, useRef } from 'react';
import { u as usePageStatus, D as DownloadDialog, t as trapiUtils, d as dragUtils, h as highlighter, g as graphUtils, e as edgeUtils, a as useDebounce } from './trapi-sNuYVYIj.mjs';
import { u as useAuth } from './AuthContext-MCs-YjR3.mjs';
import { u as usePasskey } from './usePasskey-DKEsSi17.mjs';
import { u as useAlert, r as routes } from './AlertProvider-wxvwEFCh.mjs';
import { useNavigate } from '@tanstack/react-router';
import { q as queryGraphUtils, s as stringUtils } from './queryGraph-DEhAVldC.mjs';
import { A as API, B as BiolinkContext } from './biolink-BMtGoYHa.mjs';
import { u as useQueryBuilderContext } from './queryBuilder-B0Yriqen.mjs';
import { set } from 'idb-keyval';
import CloseIcon from '@mui/icons-material/Close';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import axios from 'axios';
import Check from '@mui/icons-material/Check';
import FileCopy from '@mui/icons-material/FileCopy';
import * as d3 from 'd3';
import { a as authApi } from './baseUrlProxy-CL-Lrxdy.mjs';
import ReactJsonView from 'react-json-view';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import './Loading-Df2nHO8-.mjs';
import 'papaparse';
import '@simplewebauthn/browser';
import '@mui/material/Snackbar';
import '@mui/material/Alert';
import 'lodash/isString.js';
import 'lodash/transform.js';
import 'lodash/omitBy.js';
import 'lodash/pick.js';
import 'lodash/cloneDeep.js';
import 'lodash/startCase.js';
import 'lodash/camelCase.js';
import 'lodash/snakeCase.js';

const aras = ["robokop"];
function RegisterPasskeyDialog({ open, onClose }) {
  const { displayAlert } = useAlert();
  const { user, setUser } = useAuth();
  const { registerPasskey } = usePasskey();
  const handleRegisterPasskey = async () => {
    try {
      await registerPasskey();
      if (user) {
        setUser({ ...user, _count: { ...user._count, WebAuthnCredential: 1 } });
      }
      displayAlert("success", "Passkey registered successfully!");
      onClose();
    } catch (error) {
      console.error("Error registering passkey:", error);
      displayAlert("error", "Failed to register passkey. Please try again.");
    }
  };
  const skipSetup = () => {
    localStorage.setItem("passkeyPopupDenied", "true");
    onClose();
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onClose, maxWidth: "xs", fullWidth: true, children: [
    /* @__PURE__ */ jsx(DialogTitle, { children: /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        },
        children: [
          /* @__PURE__ */ jsx("p", { style: { margin: 0 }, children: "Set a passkey" }),
          /* @__PURE__ */ jsx(IconButton, { style: { fontSize: "18px" }, title: "Close", onClick: onClose, children: /* @__PURE__ */ jsx(CloseIcon, {}) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { children: "You can set a passkey for your account to enable passwordless login. This is optional but recommended for enhanced security." }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            marginTop: "20px",
            marginBottom: "20px"
          },
          children: [
            /* @__PURE__ */ jsx(Button, { variant: "contained", color: "primary", onClick: handleRegisterPasskey, children: "Register Passkey" }),
            /* @__PURE__ */ jsx(Button, { onClick: skipSetup, children: "Skip for now" })
          ]
        }
      )
    ] }) })
  ] });
}
async function fetchCuries(entity, displayAlert, cancel2, biolinkType) {
  const response = await API.nameResolver.entityLookup(entity, 1e3, cancel2, biolinkType);
  if (response.status === "error") {
    displayAlert(
      "error",
      "Failed to contact name resolver to search curies. Please try again later."
    );
    return [];
  }
  if (!Array.isArray(response)) {
    return [];
  }
  return response.map(({ curie, label, types, taxa }) => ({
    name: label,
    categories: types,
    ids: [curie],
    taxa
  }));
}
const taxaCurieLookup = {
  "NCBITaxon:9606": "Homo sapiens",
  "NCBITaxon:3702": "Arabidopsis thaliana",
  "NCBITaxon:10090": "Mus musculus",
  "NCBITaxon:9913": "Bos taurus",
  "NCBITaxon:9823": "Sus scrofa",
  "NCBITaxon:7227": "Drosophila melanogaster",
  "NCBITaxon:10116": "Rattus norvegicus",
  "NCBITaxon:7955": "Danio rerio",
  "NCBITaxon:559292": "Saccharomyces cerevisiae S288C",
  "NCBITaxon:4577": "Zea mays",
  "NCBITaxon:4896": "Schizosaccharomyces pombe",
  "NCBITaxon:352472": "Dictyostelium discoideum AX4",
  "NCBITaxon:9031": "Gallus gallus",
  "NCBITaxon:511145": "Escherichia coli str. K-12 substr. MG1655",
  "NCBITaxon:192222": "Campylobacter jejuni subsp. jejuni NCTC 11168 = ATCC 700819",
  "NCBITaxon:36329": "Plasmodium falciparum 3D7",
  "NCBITaxon:8355": "Xenopus laevis",
  "NCBITaxon:237561": "Candida albicans SC5314",
  "NCBITaxon:9615": "Canis lupus familiaris",
  "NCBITaxon:261594": 'Bacillus anthracis str. "Ames Ancestor"',
  "NCBITaxon:8364": "Xenopus tropicalis",
  "NCBITaxon:224308": "Bacillus subtilis subsp. subtilis str. 168",
  "NCBITaxon:6239": "Caenorhabditis elegans",
  "NCBITaxon:93061": "Staphylococcus aureus subsp. aureus NCTC 8325",
  "NCBITaxon:1035377": "Yersinia pestis A1122",
  "NCBITaxon:273123": "Yersinia pseudotuberculosis IP 32953",
  "NCBITaxon:491078": "Treponema pallidum subsp. pertenue str. SamoaD",
  "NCBITaxon:413999": "Clostridium botulinum A str. ATCC 3502",
  "NCBITaxon:9986": "Oryctolagus cuniculus",
  "NCBITaxon:2104": "Mycoplasmoides pneumoniae",
  "NCBITaxon:39947": "Oryza sativa Japonica Group",
  "NCBITaxon:83332": "Mycobacterium tuberculosis H37Rv",
  "NCBITaxon:300852": "Thermus thermophilus HB8",
  "NCBITaxon:208964": "Pseudomonas aeruginosa PAO1",
  "NCBITaxon:2026186": "Bacillus paranthracis",
  "NCBITaxon:309800": "Haloferax volcanii DS2",
  "NCBITaxon:10359": "Human betaherpesvirus 5",
  "NCBITaxon:483179": "Brucella canis ATCC 23365",
  "NCBITaxon:311400": "Thermococcus kodakarensis",
  "NCBITaxon:759272": "Thermochaetoides thermophila DSM 1495",
  "NCBITaxon:185431": "Trypanosoma brucei brucei TREU927",
  "NCBITaxon:1772": "Mycolicibacterium smegmatis",
  "NCBITaxon:621": "Shigella boydii",
  "NCBITaxon:1313": "Streptococcus pneumoniae",
  "NCBITaxon:186497": "Pyrococcus furiosus DSM 3638",
  "NCBITaxon:480808": "Mycobacterium phage Giles",
  "NCBITaxon:70601": "Pyrococcus horikoshii OT3",
  "NCBITaxon:37296": "Human gammaherpesvirus 8",
  "NCBITaxon:1286640": "Sinorhizobium meliloti 2011",
  "NCBITaxon:312017": "Tetrahymena thermophila SB210",
  "NCBITaxon:10376": "Human gammaherpesvirus 4",
  "NCBITaxon:10245": "Vaccinia virus",
  "NCBITaxon:1076": "Rhodopseudomonas palustris",
  "NCBITaxon:246197": "Myxococcus xanthus DK 1622",
  "NCBITaxon:224914": "Brucella melitensis bv. 1 str. 16M",
  "NCBITaxon:10029": "Cricetulus griseus",
  "NCBITaxon:3055": "Chlamydomonas reinhardtii",
  "NCBITaxon:272561": "Chlamydia trachomatis D/UW-3/CX",
  "NCBITaxon:145262": "Methanothermobacter thermautotrophicus",
  "NCBITaxon:10298": "Human alphaherpesvirus 1",
  "NCBITaxon:359391": "Brucella abortus 2308",
  "NCBITaxon:330879": "Aspergillus fumigatus Af293",
  "NCBITaxon:33708": "Murid gammaherpesvirus 4",
  "NCBITaxon:121224": "Pediculus humanus corporis",
  "NCBITaxon:2681611": "Escherichia phage Lambda",
  "NCBITaxon:1169293": "Enterococcus faecalis EnGen0336",
  "NCBITaxon:2287": "Saccharolobus solfataricus",
  "NCBITaxon:5693": "Trypanosoma cruzi",
  "NCBITaxon:644": "Aeromonas hydrophila",
  "NCBITaxon:44689": "Dictyostelium discoideum",
  "NCBITaxon:10141": "Cavia porcellus",
  "NCBITaxon:243230": "Deinococcus radiodurans R1 = ATCC 13939 = DSM 20539",
  "NCBITaxon:243232": "Methanocaldococcus jannaschii DSM 2661",
  "NCBITaxon:3562": "Spinacia oleracea",
  "NCBITaxon:284591": "Yarrowia lipolytica CLIB122",
  "NCBITaxon:210": "Helicobacter pylori",
  "NCBITaxon:10036": "Mesocricetus auratus",
  "NCBITaxon:1450527": "Francisella tularensis subsp. novicida D9876",
  "NCBITaxon:235443": "Cryptococcus neoformans var. grubii H99",
  "NCBITaxon:59241": "Streptococcus phage Dp-1",
  "NCBITaxon:204722": "Brucella suis 1330",
  "NCBITaxon:10335": "Human alphaherpesvirus 3",
  "NCBITaxon:1048245": "Mycobacterium canettii CIPT 140010059",
  "NCBITaxon:1509": "Clostridium sporogenes",
  "NCBITaxon:565050": "Caulobacter vibrioides NA1000",
  "NCBITaxon:7719": "Ciona intestinalis",
  "NCBITaxon:367110": "Neurospora crassa OR74A",
  "NCBITaxon:227377": "Coxiella burnetii RSA 493",
  "NCBITaxon:7091": "Bombyx mori",
  "NCBITaxon:44275": "Leptospira interrogans serovar Copenhageni",
  "NCBITaxon:10366": "Murid betaherpesvirus 1",
  "NCBITaxon:4097": "Nicotiana tabacum",
  "NCBITaxon:10760": "Escherichia phage T7",
  "NCBITaxon:444178": "Brucella ovis ATCC 25840",
  "NCBITaxon:198214": "Shigella flexneri 2a str. 301",
  "NCBITaxon:818": "Bacteroides thetaiotaomicron",
  "NCBITaxon:4081": "Solanum lycopersicum",
  "NCBITaxon:9544": "Macaca mulatta",
  "NCBITaxon:28985": "Kluyveromyces lactis",
  "NCBITaxon:1283": "Staphylococcus haemolyticus",
  "NCBITaxon:470": "Acinetobacter baumannii",
  "NCBITaxon:565042": "Bifidobacterium longum subsp. longum JCM 1217",
  "NCBITaxon:662476": "Haloarcula sinaiiensis ATCC 33800",
  "NCBITaxon:644223": "Komagataella phaffii GS115",
  "NCBITaxon:442694": "Xanthomonas perforans",
  "NCBITaxon:1341656": "Francisella tularensis subsp. tularensis str. SCHU S4 substr. NR-28534",
  "NCBITaxon:1176649": "Agrobacterium fabrum",
  "NCBITaxon:446": "Legionella pneumophila",
  "NCBITaxon:485": "Neisseria gonorrhoeae",
  "NCBITaxon:645": "Aeromonas salmonicida",
  "NCBITaxon:666": "Vibrio cholerae",
  "NCBITaxon:38323": "Bartonella henselae",
  "NCBITaxon:4113": "Solanum tuberosum",
  "NCBITaxon:10747": "Streptococcus phage Cp1",
  "NCBITaxon:9796": "Equus caballus",
  "NCBITaxon:1183413": "Agrobacterium salinitolerans",
  "NCBITaxon:1396": "Bacillus cereus",
  "NCBITaxon:9940": "Ovis aries",
  "NCBITaxon:1140": "Synechococcus elongatus PCC 7942 = FACHB-805",
  "NCBITaxon:1314": "Streptococcus pyogenes",
  "NCBITaxon:182082": "Chlamydia pneumoniae TW-183",
  "NCBITaxon:272942": "Rhodobacter capsulatus SB 1003",
  "NCBITaxon:420247": "Methanobrevibacter smithii ATCC 35061",
  "NCBITaxon:2681598": "Escherichia phage T4",
  "NCBITaxon:622": "Shigella dysenteriae",
  "NCBITaxon:24": "Shewanella putrefaciens",
  "NCBITaxon:1914243": "Citrobacter europaeus",
  "NCBITaxon:359110": "Pseudomonas extremaustralis",
  "NCBITaxon:47715": "Lacticaseibacillus rhamnosus",
  "NCBITaxon:227321": "Aspergillus nidulans FGSC A4",
  "NCBITaxon:1197719": "Salmonella bongori N268-08",
  "NCBITaxon:306263": "Campylobacter lari RM2100",
  "NCBITaxon:1355477": "Bradyrhizobium diazoefficiens",
  "NCBITaxon:45351": "Nematostella vectensis",
  "NCBITaxon:1496": "Clostridioides difficile",
  "NCBITaxon:72758": "Staphylococcus capitis subsp. capitis",
  "NCBITaxon:306537": "Corynebacterium jeikeium K411",
  "NCBITaxon:341663": "Aspergillus terreus NIH2624",
  "NCBITaxon:198628": "Dickeya dadantii 3937",
  "NCBITaxon:436717": "Acinetobacter oleivorans DR1",
  "NCBITaxon:821": "Phocaeicola vulgatus",
  "NCBITaxon:1311": "Streptococcus agalactiae",
  "NCBITaxon:2317": "Methanosphaera stadtmanae",
  "NCBITaxon:12509": "Human herpesvirus 4 type 2",
  "NCBITaxon:630": "Yersinia enterocolitica",
  "NCBITaxon:431895": "Monosiga brevicollis MX1",
  "NCBITaxon:7165": "Anopheles gambiae",
  "NCBITaxon:2026188": "Bacillus tropicus",
  "NCBITaxon:108015": "Bradyrhizobium yuanmingense",
  "NCBITaxon:6183": "Schistosoma mansoni",
  "NCBITaxon:284813": "Encephalitozoon cuniculi GB-M1",
  "NCBITaxon:10345": "Suid alphaherpesvirus 1",
  "NCBITaxon:9598": "Pan troglodytes",
  "NCBITaxon:557760": "Cereibacter sphaeroides KD131",
  "NCBITaxon:508536": "Leptospira borgpetersenii serovar Ceylonica",
  "NCBITaxon:283643": "Cryptococcus neoformans var. neoformans B-3501A",
  "NCBITaxon:2026187": "Bacillus pacificus",
  "NCBITaxon:663": "Vibrio alginolyticus",
  "NCBITaxon:515620": "[Eubacterium] eligens ATCC 27750",
  "NCBITaxon:211044": "Influenza A virus (A/Puerto Rico/8/1934(H1N1))",
  "NCBITaxon:3847": "Glycine max",
  "NCBITaxon:214684": "Cryptococcus neoformans var. neoformans JEC21",
  "NCBITaxon:29518": "Borreliella afzelii",
  "NCBITaxon:388396": "Aliivibrio fischeri MJ11",
  "NCBITaxon:272944": "Rickettsia conorii str. Malish 7",
  "NCBITaxon:568814": "Streptococcus suis BM407",
  "NCBITaxon:6500": "Aplysia californica",
  "NCBITaxon:208223": "Kosakonia cowanii",
  "NCBITaxon:1344584": "Archaeoglobus fulgidus DSM 8774",
  "NCBITaxon:1134454": "Cutibacterium acnes HL096PA1",
  "NCBITaxon:2746961": "Streptomyces caniscabiei",
  "NCBITaxon:93838": "Influenza A virus (A/goose/Guangdong/1/1996(H5N1))",
  "NCBITaxon:318586": "Paracoccus denitrificans PD1222",
  "NCBITaxon:1263550": "Edwardsiella piscicida",
  "NCBITaxon:95485": "Burkholderia stabilis",
  "NCBITaxon:79929": "Methanothermobacter marburgensis str. Marburg",
  "NCBITaxon:1318": "Streptococcus parasanguinis",
  "NCBITaxon:11676": "Human immunodeficiency virus 1",
  "NCBITaxon:381666": "Cupriavidus necator H16",
  "NCBITaxon:267377": "Methanococcus maripaludis S2",
  "NCBITaxon:110321": "Sinorhizobium medicae",
  "NCBITaxon:52242": "Lactobacillus gallinarum",
  "NCBITaxon:187420": "Methanothermobacter thermautotrophicus str. Delta H",
  "NCBITaxon:294747": "Candida tropicalis MYA-3404",
  "NCBITaxon:347515": "Leishmania major strain Friedlin",
  "NCBITaxon:272569": "Haloarcula marismortui ATCC 43049",
  "NCBITaxon:8030": "Salmo salar",
  "NCBITaxon:375899": "Trichormus variabilis 0441",
  "NCBITaxon:520": "Bordetella pertussis",
  "NCBITaxon:223283": "Pseudomonas syringae pv. tomato str. DC3000",
  "NCBITaxon:186538": "Zaire ebolavirus",
  "NCBITaxon:985002": "Staphylococcus argenteus",
  "NCBITaxon:2908168": "Salmonella phage P22",
  "NCBITaxon:7460": "Apis mellifera",
  "NCBITaxon:488241": "Influenza A virus (A/Korea/426/1968(H2N2))",
  "NCBITaxon:4952": "Yarrowia lipolytica",
  "NCBITaxon:169963": "Listeria monocytogenes EGD-e",
  "NCBITaxon:436113": "Mycoplasma mycoides subsp. capri str. GM12",
  "NCBITaxon:300876": "Vibrio europaeus",
  "NCBITaxon:9601": "Pongo abelii",
  "NCBITaxon:937593": "Geobacillus stearothermophilus ATCC 7953",
  "NCBITaxon:5478": "Nakaseomyces glabratus",
  "NCBITaxon:487": "Neisseria meningitidis",
  "NCBITaxon:637914": "Methanococcus maripaludis KA1",
  "NCBITaxon:359385": "Xanthomonas campestris pv. raphani",
  "NCBITaxon:3085316": null,
  "NCBITaxon:2026190": "Bacillus mobilis",
  "NCBITaxon:10310": "Human alphaherpesvirus 2",
  "NCBITaxon:2209": "Methanosarcina mazei",
  "NCBITaxon:7237": "Drosophila pseudoobscura",
  "NCBITaxon:129951": "Human mastadenovirus C",
  "NCBITaxon:1389922": "Achromobacter mucicolens",
  "NCBITaxon:9541": "Macaca fascicularis",
  "NCBITaxon:5741": "Giardia intestinalis",
  "NCBITaxon:7070": "Tribolium castaneum",
  "NCBITaxon:28171": "Vibrio aestuarianus",
  "NCBITaxon:9103": "Meleagris gallopavo",
  "NCBITaxon:32603": "Human betaherpesvirus 6A",
  "NCBITaxon:12643": "Ectromelia virus",
  "NCBITaxon:518987": "Influenza B virus (B/Lee/1940)",
  "NCBITaxon:284811": "Eremothecium gossypii ATCC 10895",
  "NCBITaxon:3052225": "Henipavirus nipahense",
  "NCBITaxon:83559": "Chlamydia suis",
  "NCBITaxon:8022": "Oncorhynchus mykiss",
  "NCBITaxon:294381": "Entamoeba histolytica HM-1:IMSS",
  "NCBITaxon:665029": "Erwinia amylovora CFBP1430",
  "NCBITaxon:57975": "Burkholderia thailandensis",
  "NCBITaxon:2497436": "Enterobacter quasiroggenkampii",
  "NCBITaxon:694008": "Pipistrellus bat coronavirus HKU5",
  "NCBITaxon:445984": "Borreliella burgdorferi Bol26",
  "NCBITaxon:158849": "Moellerella wisconsensis",
  "NCBITaxon:572545": "Acetivibrio thermocellus DSM 2360",
  "NCBITaxon:10600": "Human papillomavirus type 6b",
  "NCBITaxon:5855": "Plasmodium vivax",
  "NCBITaxon:330779": "Sulfolobus acidocaldarius DSM 639",
  "NCBITaxon:3888": "Pisum sativum",
  "NCBITaxon:10506": "Paramecium bursaria Chlorella virus 1",
  "NCBITaxon:9483": "Callithrix jacchus",
  "NCBITaxon:11909": "Human T-lymphotropic virus 2",
  "NCBITaxon:10258": "Orf virus",
  "NCBITaxon:333760": "Human papillomavirus type 16",
  "NCBITaxon:10255": "Variola virus",
  "NCBITaxon:328668": "Bombyx mori densovirus 3",
  "NCBITaxon:331636": "Chlamydia psittaci 6BC",
  "NCBITaxon:7245": "Drosophila yakuba",
  "NCBITaxon:273063": "Sulfurisphaera tokodaii str. 7",
  "NCBITaxon:7668": "Strongylocentrotus purpuratus",
  "NCBITaxon:47716": "Streptomyces olivaceus",
  "NCBITaxon:1309": "Streptococcus mutans",
  "NCBITaxon:246410": "Coccidioides immitis RS",
  "NCBITaxon:2587529": "Klebsiella pasteurii",
  "NCBITaxon:559295": "Lachancea thermotolerans CBS 6340",
  "NCBITaxon:2026240": "Klebsiella quasivariicola",
  "NCBITaxon:47770": "Lactobacillus crispatus",
  "NCBITaxon:332186": "Shewanella xiamenensis",
  "NCBITaxon:823": "Parabacteroides distasonis",
  "NCBITaxon:502780": "Paracoccidioides brasiliensis Pb18",
  "NCBITaxon:271108": "Bombyx mori nucleopolyhedrovirus",
  "NCBITaxon:2742203": "Staphylococcus borealis",
  "NCBITaxon:129875": "Human mastadenovirus A",
  "NCBITaxon:243275": "Treponema denticola ATCC 35405",
  "NCBITaxon:3052505": "Orthomarburgvirus marburgense",
  "NCBITaxon:10228": "Trichoplax adhaerens",
  "NCBITaxon:10326": "Equid alphaherpesvirus 1",
  "NCBITaxon:2912228": "Staphylococcus shinii",
  "NCBITaxon:510516": "Aspergillus oryzae RIB40",
  "NCBITaxon:222929": "Coccidioides posadasii C735 delta SOWgp",
  "NCBITaxon:502779": "Paracoccidioides lutzii Pb01",
  "NCBITaxon:242507": "Pyricularia oryzae 70-15",
  "NCBITaxon:237631": "Ustilago maydis 521",
  "NCBITaxon:1173064": "Anaplasma phagocytophilum str. JM",
  "NCBITaxon:3046": "Dunaliella salina",
  "NCBITaxon:527031": "Bacillus thuringiensis serovar berliner ATCC 10792",
  "NCBITaxon:364410": "Granulibacter bethesdensis",
  "NCBITaxon:2886895": "Halobacterium salinarum NRC-34001",
  "NCBITaxon:3052223": "Henipavirus hendraense",
  "NCBITaxon:2703794": "Serratia nevei",
  "NCBITaxon:573729": "Thermothelomyces thermophilus ATCC 42464",
  "NCBITaxon:680": "Vibrio campbellii",
  "NCBITaxon:991791": "Clostridium acetobutylicum DSM 1731",
  "NCBITaxon:333923": "Human papillomavirus 5",
  "NCBITaxon:334380": "Orientia tsutsugamushi str. Ikeda",
  "NCBITaxon:37636": "Thermus scotoductus",
  "NCBITaxon:10621": "Human papillomavirus 9",
  "NCBITaxon:674529": "Bacteroides faecis",
  "NCBITaxon:195": "Campylobacter coli",
  "NCBITaxon:334203": "Mupapillomavirus 1",
  "NCBITaxon:218496": "Tropheryma whipplei TW08/27",
  "NCBITaxon:122928": "Norovirus GI",
  "NCBITaxon:1767": "Mycobacterium intracellulare",
  "NCBITaxon:8090": "Oryzias latipes",
  "NCBITaxon:7425": "Nasonia vitripennis",
  "NCBITaxon:1134687": "Klebsiella michiganensis",
  "NCBITaxon:490": "Neisseria sicca",
  "NCBITaxon:11138": "Murine hepatitis virus",
  "NCBITaxon:2886926": "Escherichia phage P1",
  "NCBITaxon:3694": "Populus trichocarpa",
  "NCBITaxon:694006": "Rousettus bat coronavirus HKU9",
  "NCBITaxon:155322": "Bacillus toyonensis",
  "NCBITaxon:1054460": "Streptococcus pseudopneumoniae IS7493",
  "NCBITaxon:11908": "Human T-cell leukemia virus type I",
  "NCBITaxon:265293": "Burkholderia ubonensis subsp. mesacidophila",
  "NCBITaxon:2907838": "Streptococcus phage C1",
  "NCBITaxon:803": "Bartonella quintana",
  "NCBITaxon:588": "Providencia stuartii",
  "NCBITaxon:392021": 'Rickettsia rickettsii str. "Sheila Smith"',
  "NCBITaxon:624": "Shigella sonnei",
  "NCBITaxon:6279": "Brugia malayi",
  "NCBITaxon:336963": "Uncinocarpus reesii 1704",
  "NCBITaxon:1525": "Moorella thermoacetica",
  "NCBITaxon:223926": "Vibrio parahaemolyticus RIMD 2210633",
  "NCBITaxon:1885902": "Xanthomonas cannabis pv. phaseoli",
  "NCBITaxon:333763": "Human papillomavirus type 32",
  "NCBITaxon:333761": "human papillomavirus 18",
  "NCBITaxon:1714621": "Borna disease virus 1",
  "NCBITaxon:269145": "Sulfolobus turreted icosahedral virus 1",
  "NCBITaxon:2885909": "Bordetella phage BPP-1",
  "NCBITaxon:5661": "Leishmania donovani",
  "NCBITaxon:386585": "Escherichia coli O157:H7 str. Sakai",
  "NCBITaxon:1354": "Enterococcus hirae",
  "NCBITaxon:224325": "Archaeoglobus fulgidus DSM 4304",
  "NCBITaxon:186540": "Sudan ebolavirus",
  "NCBITaxon:523850": "Thermococcus onnurineus NA1",
  "NCBITaxon:11801": "Moloney murine leukemia virus",
  "NCBITaxon:3052310": "Mammarenavirus lassaense",
  "NCBITaxon:67824": "Citrobacter farmeri",
  "NCBITaxon:435258": "Leishmania infantum JPCM5",
  "NCBITaxon:46015": "Autographa californica nucleopolyhedrovirus",
  "NCBITaxon:559305": "Trichophyton rubrum CBS 118892",
  "NCBITaxon:75985": "Mannheimia haemolytica",
  "NCBITaxon:69966": "Macrococcus caseolyticus",
  "NCBITaxon:11120": "Infectious bronchitis virus",
  "NCBITaxon:10804": "adeno-associated virus 2",
  "NCBITaxon:277944": "Human coronavirus NL63",
  "NCBITaxon:10243": "Cowpox virus",
  "NCBITaxon:1580": "Levilactobacillus brevis",
  "NCBITaxon:9595": "Gorilla gorilla gorilla",
  "NCBITaxon:672": "Vibrio vulnificus",
  "NCBITaxon:41202": "Ewingella americana",
  "NCBITaxon:2902907": "Mycobacterium phage Bxb1",
  "NCBITaxon:7159": "Aedes aegypti",
  "NCBITaxon:1343": "Streptococcus vestibularis",
  "NCBITaxon:83555": "Chlamydia abortus",
  "NCBITaxon:11886": "Rous sarcoma virus",
  "NCBITaxon:11250": "Human orthopneumovirus",
  "NCBITaxon:1226753": "Mycolicibacterium mucogenicum DSM 44124",
  "NCBITaxon:2681617": "Escherichia phage HK97",
  "NCBITaxon:735": "Haemophilus parahaemolyticus",
  "NCBITaxon:730": "[Haemophilus] ducreyi",
  "NCBITaxon:5888": "Paramecium tetraurelia",
  "NCBITaxon:9365": "Erinaceus europaeus",
  "NCBITaxon:7370": "Musca domestica",
  "NCBITaxon:192": "Azospirillum brasilense",
  "NCBITaxon:82541": "Cupriavidus gilardii",
  "NCBITaxon:12558": "Sesbania mosaic virus",
  "NCBITaxon:12639": "Duck hepatitis B virus",
  "NCBITaxon:10724": "Bacillus phage SPP1",
  "NCBITaxon:208962": "Escherichia albertii",
  "NCBITaxon:649604": "Banna virus strain JKT-6423",
  "NCBITaxon:2928686": "Pseudomonas phage phi6",
  "NCBITaxon:2172043": "Bifidobacterium tibiigranuli",
  "NCBITaxon:11277": "Vesicular stomatitis Indiana virus",
  "NCBITaxon:62977": "Acinetobacter baylyi ADP1",
  "NCBITaxon:213585": "Methanosarcina mazei S-6",
  "NCBITaxon:7998": "Ictalurus punctatus",
  "NCBITaxon:11723": "Simian immunodeficiency virus",
  "NCBITaxon:1353": "Enterococcus gallinarum",
  "NCBITaxon:82983": "Obesumbacterium proteus",
  "NCBITaxon:1286": "Staphylococcus simulans",
  "NCBITaxon:1281486": "Lactococcus formosensis",
  "NCBITaxon:1642": "Listeria innocua",
  "NCBITaxon:591001": "Acidaminococcus fermentans DSM 20731",
  "NCBITaxon:529507": "Proteus mirabilis HI4320",
  "NCBITaxon:280147": "Acinetobacter courvalinii",
  "NCBITaxon:4558": "Sorghum bicolor",
  "NCBITaxon:2494701": "Enterobacter chengduensis",
  "NCBITaxon:1434109": "Methanosarcina barkeri str. Wiesmoor",
  "NCBITaxon:9685": "Felis catus",
  "NCBITaxon:10730": "Escherichia phage 933W",
  "NCBITaxon:1310165": "Ralstonia pseudosolanacearum",
  "NCBITaxon:12242": "Tobacco mosaic virus",
  "NCBITaxon:1282": "Staphylococcus epidermidis",
  "NCBITaxon:694581": "Marseillevirus marseillevirus",
  "NCBITaxon:523849": "Thermococcus litoralis DSM 5473",
  "NCBITaxon:2919548": "Thermus phage P23-77",
  "NCBITaxon:11041": "Rubella virus",
  "NCBITaxon:243265": "Photorhabdus laumondii subsp. laumondii TTO1",
  "NCBITaxon:663331": "Trichophyton benhamiae CBS 112371",
  "NCBITaxon:425944": "Sulfolobus islandicus L.D.8.5",
  "NCBITaxon:1404": "Priestia megaterium",
  "NCBITaxon:9925": "Capra hircus",
  "NCBITaxon:13373": "Burkholderia mallei",
  "NCBITaxon:3635": "Gossypium hirsutum",
  "NCBITaxon:188937": "Methanosarcina acetivorans C2A",
  "NCBITaxon:33945": "Enterococcus avium",
  "NCBITaxon:655827": "Metarhizium acridum CQMa 102",
  "NCBITaxon:10390": "Gallid alphaherpesvirus 2",
  "NCBITaxon:243161": "Chlamydia muridarum str. Nigg",
  "NCBITaxon:12302": "Brome mosaic virus",
  "NCBITaxon:11577": "La Crosse virus",
  "NCBITaxon:3052317": "Mammarenavirus machupoense",
  "NCBITaxon:11553": "Influenza C virus (C/Ann Arbor/1/50)",
  "NCBITaxon:1890302": "Bacillus wiedmannii",
  "NCBITaxon:291644": "Bacteroides salyersiae",
  "NCBITaxon:28295": "Porcine epidemic diarrhea virus",
  "NCBITaxon:660122": "Fusarium vanettenii 77-13-4",
  "NCBITaxon:186539": "Reston ebolavirus",
  "NCBITaxon:537973": "Lacticaseibacillus paracasei subsp. paracasei 8700:2",
  "NCBITaxon:3988": "Ricinus communis",
  "NCBITaxon:1211579": "Pseudomonas putida NBRC 14164",
  "NCBITaxon:431947": "Porphyromonas gingivalis ATCC 33277",
  "NCBITaxon:11234": "Measles morbillivirus",
  "NCBITaxon:10632": "JC polyomavirus",
  "NCBITaxon:212035": "Acanthamoeba polyphaga mimivirus",
  "NCBITaxon:5061": "Aspergillus niger",
  "NCBITaxon:992212": "SFTS virus HB29",
  "NCBITaxon:87883": "Burkholderia multivorans",
  "NCBITaxon:417368": "Enterococcus thailandicus",
  "NCBITaxon:453591": "Ignicoccus hospitalis KIN4/I",
  "NCBITaxon:10497": "African swine fever virus",
  "NCBITaxon:436907": "Vanderwaltozyma polyspora DSM 70294",
  "NCBITaxon:363745": "Avian leukosis virus - RSA",
  "NCBITaxon:29347": "[Clostridium] scindens",
  "NCBITaxon:95486": "Burkholderia cenocepacia",
  "NCBITaxon:1892": "Streptomyces anulatus",
  "NCBITaxon:648": "Aeromonas caviae",
  "NCBITaxon:59300": "Getah virus",
  "NCBITaxon:36427": "Rotavirus C",
  "NCBITaxon:227984": "SARS coronavirus Tor2",
  "NCBITaxon:2907963": "Aeromonas phage 44RR2.8t",
  "NCBITaxon:1905730": "Pectobacterium parmentieri",
  "NCBITaxon:11569": "Thogotovirus thogotoense",
  "NCBITaxon:3052307": "Mammarenavirus guanaritoense",
  "NCBITaxon:12267": "Red clover necrotic mosaic virus",
  "NCBITaxon:13689": "Sphingomonas paucimobilis",
  "NCBITaxon:35269": "Woodchuck hepatitis virus",
  "NCBITaxon:9209": "Phalacrocorax carbo",
  "NCBITaxon:8839": "Anas platyrhynchos",
  "NCBITaxon:381124": "Zea mays subsp. mays",
  "NCBITaxon:249584": "Lyssavirus caucasicus",
  "NCBITaxon:104628": "Helicobacter suis",
  "NCBITaxon:130308": "Human mastadenovirus E",
  "NCBITaxon:1330524": "Salivirus A",
  "NCBITaxon:1124983": "Pseudomonas protegens CHA0",
  "NCBITaxon:28875": "Rotavirus A",
  "NCBITaxon:2911440": "Staphylococcus phage 80alpha",
  "NCBITaxon:7029": "Acyrthosiphon pisum",
  "NCBITaxon:1894": "Kitasatospora aureofaciens",
  "NCBITaxon:480": "Moraxella catarrhalis",
  "NCBITaxon:864596": "Bat coronavirus BM48-31/BGR/2008",
  "NCBITaxon:211787": "Human papillomavirus type 92",
  "NCBITaxon:661410": "Methylorubrum extorquens DM4",
  "NCBITaxon:46473": "Breda virus",
  "NCBITaxon:5874": "Theileria annulata",
  "NCBITaxon:1434121": "Methanosarcina thermophila CHTI-55",
  "NCBITaxon:11082": "West Nile virus",
  "NCBITaxon:9669": "Mustela putorius furo",
  "NCBITaxon:11047": "Equine arteritis virus",
  "NCBITaxon:165432": "Cucumber leaf spot virus",
  "NCBITaxon:998086": "Pseudomonas phage PhiPA3",
  "NCBITaxon:229533": "Fusarium graminearum PH-1",
  "NCBITaxon:515849": "Podospora anserina S mat+",
  "NCBITaxon:12136": "Cricket paralysis virus",
  "NCBITaxon:69014": "Thermococcus kodakarensis KOD1",
  "NCBITaxon:440266": "WU Polyomavirus",
  "NCBITaxon:157899": "Sulfolobus islandicus rod-shaped virus 2",
  "NCBITaxon:9798": "Equus przewalskii",
  "NCBITaxon:402880": "Methanococcus maripaludis C5",
  "NCBITaxon:331117": "Aspergillus fischeri NRRL 181",
  "NCBITaxon:553239": "Vibrio breoganii",
  "NCBITaxon:42858": "Mammaliicoccus lentus",
  "NCBITaxon:40215": "Acinetobacter junii",
  "NCBITaxon:69656": "Sulfurisphaera ohwakuensis",
  "NCBITaxon:2908095": "Prochlorococcus phage P-SSP7",
  "NCBITaxon:28090": "Acinetobacter lwoffii",
  "NCBITaxon:9534": "Chlorocebus aethiops",
  "NCBITaxon:9531": "Cercocebus atys",
  "NCBITaxon:12287": "Flock House virus",
  "NCBITaxon:696472": "Ostreococcus tauri virus 2",
  "NCBITaxon:61645": "Enterobacter asburiae",
  "NCBITaxon:198110": "Pseudomonas phage 201phi2-1",
  "NCBITaxon:35345": "Lactococcus phage TP901-1",
  "NCBITaxon:91753": "Cucurbit aphid-borne yellows virus",
  "NCBITaxon:1314884": "Lactobacillus acidophilus La-14",
  "NCBITaxon:1756149": "Elizabethkingia bruuniana",
  "NCBITaxon:1744": "Propionibacterium freudenreichii",
  "NCBITaxon:6238": "Caenorhabditis briggsae",
  "NCBITaxon:238": "Elizabethkingia meningoseptica",
  "NCBITaxon:82633": "Cupriavidus pauculus",
  "NCBITaxon:12131": "rhinovirus B14",
  "NCBITaxon:1332244": "Influenza A virus (A/Shanghai/02/2013(H7N9))",
  "NCBITaxon:28377": "Anolis carolinensis",
  "NCBITaxon:81947": "Vagococcus lutrae",
  "NCBITaxon:2905681": "Bacteriophage P2",
  "NCBITaxon:212717": "Clostridium tetani E88",
  "NCBITaxon:518": "Bordetella bronchiseptica",
  "NCBITaxon:138950": "Enterovirus C",
  "NCBITaxon:10617": "Human papillomavirus 4",
  "NCBITaxon:1434114": "Methanosarcina mazei LYC",
  "NCBITaxon:267818": "Lactobacillus kefiranofaciens",
  "NCBITaxon:215158": "Salmonella phage epsilon15",
  "NCBITaxon:154334": "Macacine gammaherpesvirus 5",
  "NCBITaxon:7240": "Drosophila simulans",
  "NCBITaxon:85698": "Achromobacter xylosoxidans",
  "NCBITaxon:399550": "Staphylothermus marinus F1",
  "NCBITaxon:2847087": "GB virus-B",
  "NCBITaxon:1232383": "Corynebacterium glutamicum SCgG2",
  "NCBITaxon:190061": "Fowl aviadenovirus A",
  "NCBITaxon:12327": "Barley stripe mosaic virus",
  "NCBITaxon:871585": "Acinetobacter pittii PHEA-2",
  "NCBITaxon:11855": "Mason-Pfizer monkey virus",
  "NCBITaxon:8502": "Crocodylus porosus",
  "NCBITaxon:32264": "Tetranychus urticae",
  "NCBITaxon:353152": "Cryptosporidium parvum Iowa II",
  "NCBITaxon:12023": "Pseudomonas phage PP7",
  "NCBITaxon:544580": "Actinomyces oris",
  "NCBITaxon:180957": "Pectobacterium brasiliense",
  "NCBITaxon:290008": "Isfahan virus",
  "NCBITaxon:60711": "Chlorocebus sabaeus",
  "NCBITaxon:71451": "Enterococcus malodoratus",
  "NCBITaxon:120086": "Pseudomonas phage phi8",
  "NCBITaxon:1454641": "Salmonella enterica subsp. enterica serovar Typhimurium str. CDC 2010K-1587",
  "NCBITaxon:273133": "Pseudomonas phage EL",
  "NCBITaxon:28037": "Streptococcus mitis",
  "NCBITaxon:59729": "Taeniopygia guttata",
  "NCBITaxon:2738": "Vagococcus fluvialis",
  "NCBITaxon:53346": "Enterococcus mundtii",
  "NCBITaxon:32536": "Acinonyx jubatus",
  "NCBITaxon:11099": "Bovine viral diarrhea virus 1",
  "NCBITaxon:1358": "Lactococcus lactis",
  "NCBITaxon:344021": "Escherichia phage K1F",
  "NCBITaxon:213633": "Providence virus",
  "NCBITaxon:45455": "Macacine gammaherpesvirus 4",
  "NCBITaxon:2905959": "Shigella phage Sf6",
  "NCBITaxon:12161": "Beet yellows virus",
  "NCBITaxon:664683": "Halomonas titanicae",
  "NCBITaxon:356114": "Hepatitis C virus genotype 3",
  "NCBITaxon:5599": "Alternaria alternata",
  "NCBITaxon:431241": "Trichoderma reesei QM6a",
  "NCBITaxon:11795": "Friend murine leukemia virus",
  "NCBITaxon:31033": "Takifugu rubripes",
  "NCBITaxon:10794": "Minute virus of mice",
  "NCBITaxon:655813": "Streptococcus oralis ATCC 35037",
  "NCBITaxon:10381": "Saimiriine gammaherpesvirus 2",
  "NCBITaxon:2681609": "Staphylococcus phage phi 11",
  "NCBITaxon:10224": "Saccoglossus kowalevskii",
  "NCBITaxon:99287": "Salmonella enterica subsp. enterica serovar Typhimurium str. LT2",
  "NCBITaxon:1891762": "Betapolyomavirus hominis",
  "NCBITaxon:694007": "Tylonycteris bat coronavirus HKU4",
  "NCBITaxon:72004": "Bos mutus",
  "NCBITaxon:296": "Pseudomonas fragi",
  "NCBITaxon:445987": "Borreliella valaisiana VS116",
  "NCBITaxon:7897": "Latimeria chalumnae",
  "NCBITaxon:29760": "Vitis vinifera",
  "NCBITaxon:129956": "Murine mastadenovirus A",
  "NCBITaxon:455632": "Streptomyces griseus subsp. griseus NBRC 13350",
  "NCBITaxon:1501662": "Streptococcus parasuis",
  "NCBITaxon:575": "Raoultella planticola",
  "NCBITaxon:571": "Klebsiella oxytoca",
  "NCBITaxon:217203": "Achromobacter spanius",
  "NCBITaxon:573066": "Pseudomonas amygdali pv. tabaci str. ATCC 11528",
  "NCBITaxon:85618": "Ateline gammaherpesvirus 3",
  "NCBITaxon:945711": "Corynebacterium ulcerans 809",
  "NCBITaxon:329": "Ralstonia pickettii",
  "NCBITaxon:390157": "Senecavirus A",
  "NCBITaxon:3885": "Phaseolus vulgaris",
  "NCBITaxon:3880": "Medicago truncatula",
  "NCBITaxon:11292": "Lyssavirus rabies",
  "NCBITaxon:1502": "Clostridium perfringens",
  "NCBITaxon:2907964": "Pseudomonas phage D3112",
  "NCBITaxon:36914": "Lodderomyces elongisporus",
  "NCBITaxon:419612": "Camelus ferus",
  "NCBITaxon:505682": "Ureaplasma parvum serovar 3 str. ATCC 27815",
  "NCBITaxon:3052322": "Mammarenavirus oliverosense",
  "NCBITaxon:247269": "Human papillomavirus type 96",
  "NCBITaxon:11224": "Human parainfluenza virus 4a",
  "NCBITaxon:33745": "Hepatitis C virus genotype 4",
  "NCBITaxon:11588": "Rift Valley fever virus",
  "NCBITaxon:523841": "Haloferax mediterranei ATCC 33500",
  "NCBITaxon:34839": "Chinchilla lanigera",
  "NCBITaxon:35688": "Porphyridium purpureum",
  "NCBITaxon:529": "Brucella anthropi",
  "NCBITaxon:1648923": "Bacillus paralicheniformis",
  "NCBITaxon:8496": "Alligator mississippiensis",
  "NCBITaxon:102862": "Proteus penneri",
  "NCBITaxon:2364647": "Pantoea piersonii",
  "NCBITaxon:2884424": "Bacillus phage phi29",
  "NCBITaxon:1891729": "Alphapolyomavirus mauratus",
  "NCBITaxon:39152": "Methanococcus maripaludis",
  "NCBITaxon:411470": "[Ruminococcus] gnavus ATCC 29149",
  "NCBITaxon:714": "Aggregatibacter actinomycetemcomitans",
  "NCBITaxon:132475": "Yaba-like disease virus",
  "NCBITaxon:627343": "Zymomonas mobilis subsp. mobilis str. CP4 = NRRL B-14023",
  "NCBITaxon:2890317": "Yersinia alsatica",
  "NCBITaxon:2681603": "Escherichia phage Mu",
  "NCBITaxon:284592": "Debaryomyces hansenii CBS767",
  "NCBITaxon:4956": "Zygosaccharomyces rouxii",
  "NCBITaxon:29438": "Pseudomonas savastanoi",
  "NCBITaxon:11128": "Bovine coronavirus",
  "NCBITaxon:2679898": "Bacillus phage GA1",
  "NCBITaxon:7176": "Culex quinquefasciatus",
  "NCBITaxon:310298": "Phocaeicola coprocola",
  "NCBITaxon:11272": "Chandipura virus",
  "NCBITaxon:1105094": "Rickettsia prowazekii str. Chernikova",
  "NCBITaxon:12475": "Hepatitis delta virus",
  "NCBITaxon:333762": "Human papillomavirus type 26",
  "NCBITaxon:11657": "Bovine immunodeficiency virus",
  "NCBITaxon:1886": "Streptomyces albidoflavus",
  "NCBITaxon:28172": "Vibrio metschnikovii",
  "NCBITaxon:12657": "Equid gammaherpesvirus 2",
  "NCBITaxon:12336": "Clostridium phage c-st",
  "NCBITaxon:11970": "Woolly monkey sarcoma virus",
  "NCBITaxon:254785": "Streptococcus halichoeri",
  "NCBITaxon:3708": "Brassica napus",
  "NCBITaxon:847": "Oxalobacter formigenes",
  "NCBITaxon:1605972": "Cricetid gammaherpesvirus 2",
  "NCBITaxon:1220924": "Cyphellophora europaea CBS 101466",
  "NCBITaxon:11039": "Western equine encephalitis virus",
  "NCBITaxon:42631": "Brome streak mosaic virus",
  "NCBITaxon:1125630": "Klebsiella pneumoniae subsp. pneumoniae HS11286",
  "NCBITaxon:2890316": "Yersinia proxima",
  "NCBITaxon:154654": "Mycobacterium montefiorense",
  "NCBITaxon:1295826": "Lactococcus cremoris subsp. cremoris KW2",
  "NCBITaxon:129394": "Xanthomonas oryzae pv. oryzicola",
  "NCBITaxon:296210": "Penicillium stoloniferum virus F",
  "NCBITaxon:204050": "Methanoculleus submarinus",
  "NCBITaxon:905079": "Guillardia theta CCMP2712",
  "NCBITaxon:32604": "Human betaherpesvirus 6B",
  "NCBITaxon:747": "Pasteurella multocida",
  "NCBITaxon:1323664": "Paraburkholderia caribensis MBA4",
  "NCBITaxon:439334": "Mycobacterium avium subsp. hominissuis",
  "NCBITaxon:1223261": "Pseudomonas phage JBD5",
  "NCBITaxon:1223260": "Pseudomonas phage JBD30",
  "NCBITaxon:11053": "dengue virus type 1",
  "NCBITaxon:564": "Escherichia fergusonii",
  "NCBITaxon:47740": "Groundnut rosette virus",
  "NCBITaxon:317": "Pseudomonas syringae",
  "NCBITaxon:480035": "Nocardia wallacei",
  "NCBITaxon:37326": "Nocardia brasiliensis",
  "NCBITaxon:2094": "Mycoplasmopsis arginini",
  "NCBITaxon:10872": "Pseudomonas phage Pf3",
  "NCBITaxon:10759": "Enterobacteria phage T3",
  "NCBITaxon:11020": "Barmah Forest virus",
  "NCBITaxon:425265": "Malassezia globosa CBS 7966",
  "NCBITaxon:56867": "Marchantia paleacea",
  "NCBITaxon:11029": "Ross River virus",
  "NCBITaxon:29378": "Staphylococcus arlettae",
  "NCBITaxon:28737": "Elephantulus edwardii",
  "NCBITaxon:335103": "Adult diarrheal rotavirus strain J19",
  "NCBITaxon:10334": "Felid alphaherpesvirus 1",
  "NCBITaxon:2512240": "Sulfolobus sp. S-194",
  "NCBITaxon:543939": "Sputnik virophage",
  "NCBITaxon:1348662": "Corynebacterium argentoratense DSM 44202",
  "NCBITaxon:240176": "Coprinopsis cinerea okayama7#130",
  "NCBITaxon:90961": "Lyssavirus australis",
  "NCBITaxon:46839": "Colorado tick fever virus",
  "NCBITaxon:7244": "Drosophila virilis",
  "NCBITaxon:12042": "Beet western yellows virus",
  "NCBITaxon:290028": "Human coronavirus HKU1",
  "NCBITaxon:72360": "Bacillus mojavensis",
  "NCBITaxon:1705": "Corynebacterium stationis",
  "NCBITaxon:9597": "Pan paniscus",
  "NCBITaxon:12618": "Chicken anemia virus",
  "NCBITaxon:54262": "Thermococcus chitonophagus",
  "NCBITaxon:348780": "Natronomonas pharaonis DSM 2160",
  "NCBITaxon:1901": "Streptomyces clavuligerus",
  "NCBITaxon:9555": "Papio anubis",
  "NCBITaxon:340047": "Mycoplasma capricolum subsp. capricolum ATCC 27343",
  "NCBITaxon:10623": "Kappapapillomavirus 2",
  "NCBITaxon:1293": "Staphylococcus gallinarum",
  "NCBITaxon:1223561": "CAS virus",
  "NCBITaxon:615": "Serratia marcescens",
  "NCBITaxon:573826": "Candida dubliniensis CD36",
  "NCBITaxon:28300": "Heron hepatitis B virus",
  "NCBITaxon:1529886": "Bacillus atrophaeus subsp. globigii",
  "NCBITaxon:83462": "Corallococcus exiguus",
  "NCBITaxon:2787": "Porphyra purpurea",
  "NCBITaxon:2994495": "Pseudomonas paraeruginosa",
  "NCBITaxon:2593991": "Peste des petits ruminants virus",
  "NCBITaxon:768679": "Thermoproteus tenax Kra 1",
  "NCBITaxon:661": "Photobacterium angustum",
  "NCBITaxon:1308": "Streptococcus thermophilus",
  "NCBITaxon:11665": "Equine infectious anemia virus",
  "NCBITaxon:11709": "Human immunodeficiency virus 2",
  "NCBITaxon:255045": "Bradyrhizobium canariense"
};
function isValidNode(properties) {
  return properties.categories && properties.categories.length > 0 || properties.ids && properties.ids.length > 0;
}
function lookupTaxaName(taxaIdArray) {
  if (!Array.isArray(taxaIdArray) || taxaIdArray.length < 1) return null;
  const firstTaxaCurie = taxaIdArray[0];
  const firstTaxaName = taxaCurieLookup[firstTaxaCurie];
  if (!firstTaxaName) return firstTaxaCurie;
  return firstTaxaName;
}
const { CancelToken } = axios;
let cancel;
function NodeSelector({ id, properties, isReference, setReference, update: update2, title, size, nameresCategoryFilter, options: nodeOptions = {} }) {
  const { includeCuries = true, includeExistingNodes = true, existingNodes = [], includeCategories = true, clearable = true, includeSets = false } = nodeOptions;
  const [loading, toggleLoading] = useState(false);
  const [inputText, updateInputText] = useState("");
  const [open, toggleOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const { displayAlert } = useAlert();
  const { concepts } = useContext(BiolinkContext);
  const searchTerm = useDebounce(inputText, 500);
  async function getOptions() {
    toggleLoading(true);
    const newOptions = isReference ? [{ name: "New Term", key: null }] : [];
    if (includeExistingNodes) {
      newOptions.push(...existingNodes);
    }
    if (includeCategories) {
      let includedCategories = concepts.filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase())).map((category) => ({ categories: [category], name: stringUtils.displayCategory(category) }));
      if (includeSets) {
        includedCategories = concepts.filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase())).flatMap((category) => [
          {
            categories: [category],
            name: stringUtils.displayCategory(category)
          },
          {
            categories: [category],
            name: stringUtils.setify(category),
            is_set: true
          }
        ]);
      }
      newOptions.push(...includedCategories);
    }
    if (includeCuries) {
      if (searchTerm.includes(":")) {
        newOptions.push({ name: searchTerm, ids: [searchTerm] });
      }
      if (cancel) {
        cancel.cancel();
      }
      cancel = CancelToken.source();
      const curies = await fetchCuries(searchTerm, displayAlert, cancel.token, nameresCategoryFilter);
      newOptions.push(...curies);
    }
    toggleLoading(false);
    setOptions(newOptions);
  }
  useEffect(() => {
    if (open && searchTerm.length >= 3) {
      getOptions();
    } else {
      setOptions([]);
    }
  }, [open, searchTerm]);
  useEffect(
    () => () => {
      if (cancel) {
        cancel.cancel();
      }
    },
    []
  );
  function getOptionLabel(opt) {
    let label = "";
    if (opt.key) {
      label += `${opt.key}: `;
    }
    if (opt.name) {
      return label + opt.name;
    }
    if (opt.ids && Array.isArray(opt.ids) && opt.ids.length) {
      return label + opt.ids.join(", ");
    }
    if (opt.categories && Array.isArray(opt.categories)) {
      if (opt.categories.length) {
        return label + opt.categories.join(", ");
      }
      return `${label} Something`;
    }
    return "";
  }
  function handleUpdate(e, v) {
    var _a;
    updateInputText("");
    if (v && "key" in v) {
      setReference((_a = v.key) != null ? _a : null);
    } else {
      update2(id, v);
    }
  }
  const selectorValue = useMemo(() => {
    if (isValidNode(properties)) {
      return properties;
    }
    return null;
  }, [properties]);
  return /* @__PURE__ */ jsx(
    Autocomplete,
    {
      options,
      loading,
      className: `textEditorSelector${isReference ? " referenceNode" : ""} highlight-${id}`,
      getOptionLabel,
      filterOptions: (x) => x,
      autoComplete: true,
      autoHighlight: true,
      clearOnBlur: true,
      blurOnSelect: true,
      disableClearable: !clearable,
      inputValue: inputText,
      value: selectorValue,
      isOptionEqualToValue: (option, value) => option.name === value.name,
      open,
      onChange: handleUpdate,
      onOpen: () => toggleOpen(true),
      onClose: () => toggleOpen(false),
      onInputChange: (_e, v) => updateInputText(v),
      renderOption: (props, option, state) => /* @__PURE__ */ jsx(Option, { ...option, ...props }),
      renderInput: (params) => /* @__PURE__ */ jsx(
        TextField,
        {
          ...params,
          variant: "outlined",
          className: "nodeDropdown",
          label: title || id,
          margin: "dense",
          onFocus: () => {
            highlighter.highlightGraphNode(id);
            highlighter.highlightTextEditorNode(id);
          },
          onBlur: () => {
            highlighter.clearGraphNode(id);
            highlighter.clearTextEditorNode(id);
          },
          InputProps: {
            ...params.InputProps,
            classes: {
              root: `nodeSelector nodeSelector-${id}`
            },
            endAdornment: /* @__PURE__ */ jsxs(Fragment, { children: [
              loading ? /* @__PURE__ */ jsx(CircularProgress, { color: "inherit", size: 20 }) : null,
              params.InputProps.endAdornment
            ] })
          }
        }
      ),
      size: size || "medium"
    }
  );
}
const CustomTooltip = withStyles((theme) => ({
  tooltip: {
    fontSize: theme.typography.pxToRem(14)
  }
}))(Tooltip);
function Option({ name, ids, categories, taxa, ...props }) {
  const taxaName = lookupTaxaName(taxa);
  return /* @__PURE__ */ jsx(
    CustomTooltip,
    {
      arrow: true,
      title: /* @__PURE__ */ jsxs("div", { className: "node-option-tooltip-wrapper", children: [
        Array.isArray(ids) && ids.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: ids[0] }),
          /* @__PURE__ */ jsx(CopyButton, { textToCopy: ids[0] })
        ] }),
        Array.isArray(categories) && categories.length > 0 && /* @__PURE__ */ jsx("span", { children: categories[0] })
      ] }),
      placement: "left",
      children: /* @__PURE__ */ jsxs("div", { ...props, children: [
        name,
        " ",
        taxaName ? `(${taxaName})` : null
      ] })
    }
  );
}
function CopyButton({ textToCopy }) {
  const [hasCopied, setHasCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
  };
  if (typeof navigator.clipboard === "undefined" || typeof navigator.clipboard.writeText !== "function" || typeof textToCopy !== "string") {
    return null;
  }
  return /* @__PURE__ */ jsx(IconButton, { color: "inherit", size: "small", onClick: handleCopy, children: hasCopied ? /* @__PURE__ */ jsx(Check, {}) : /* @__PURE__ */ jsx(FileCopy, {}) });
}
function getCategories(categories) {
  return Array.isArray(categories) && categories.length && categories || ["biolink:NamedThing"];
}
function PredicateSelector({ id }) {
  const biolink = useContext(BiolinkContext);
  const queryBuilder = useQueryBuilderContext();
  const { query_graph } = queryBuilder;
  const edge = query_graph.edges[id];
  function getFilteredPredicateList() {
    if (!biolink || !biolink.predicates || !biolink.predicates.length) {
      return null;
    }
    if (edge.subject === void 0 || edge.object === void 0) {
      return null;
    }
    const subjectNode = query_graph.nodes[edge.subject];
    const objectNode = query_graph.nodes[edge.object];
    const subjectCategories = getCategories(subjectNode.categories);
    const objectCategories = getCategories(objectNode.categories);
    const subjectNodeCategoryHierarchy = subjectCategories.flatMap(
      (subjectCategory) => {
        var _a2;
        var _a;
        return (_a2 = (_a = biolink.ancestorsMap) == null ? void 0 : _a[subjectCategory]) != null ? _a2 : [];
      }
    );
    const objectNodeCategoryHierarchy = objectCategories.flatMap(
      (objectCategory) => {
        var _a2;
        var _a;
        return (_a2 = (_a = biolink.ancestorsMap) == null ? void 0 : _a[objectCategory]) != null ? _a2 : [];
      }
    );
    if (!subjectNodeCategoryHierarchy || !objectNodeCategoryHierarchy) {
      return null;
    }
    return biolink.predicates.map(({ predicate }) => predicate);
  }
  const filteredPredicateList = useMemo(getFilteredPredicateList, [
    // recompute if node categories change
    edge.subject !== void 0 && query_graph.nodes[edge.subject] ? JSON.stringify(query_graph.nodes[edge.subject].categories) : "",
    edge.object !== void 0 && query_graph.nodes[edge.object] ? JSON.stringify(query_graph.nodes[edge.object].categories) : "",
    biolink
  ]) || [];
  function editPredicates(predicates) {
    queryBuilder.dispatch({ type: "editPredicate", payload: { id, predicates } });
  }
  useEffect(() => {
    if (filteredPredicateList && filteredPredicateList.length) {
      const keptPredicates = edge.predicates && edge.predicates.filter((p) => filteredPredicateList.indexOf(p) > -1) || [];
      editPredicates(keptPredicates);
    }
  }, [filteredPredicateList]);
  return /* @__PURE__ */ jsx(
    Autocomplete,
    {
      options: filteredPredicateList,
      className: `textEditorSelector highlight-${id}`,
      value: edge.predicates || [],
      onChange: (e, value) => editPredicates(value),
      renderInput: (params) => /* @__PURE__ */ jsx(
        TextField,
        {
          ...params,
          label: "Predicate",
          variant: "outlined",
          className: "edgeDropdown",
          margin: "dense",
          onFocus: () => {
            highlighter.highlightGraphEdge(id);
            highlighter.highlightTextEditorEdge(id);
          },
          onBlur: () => {
            highlighter.clearGraphEdge(id);
            highlighter.clearTextEditorEdge(id);
          },
          InputProps: {
            ...params.InputProps,
            classes: {
              root: `edgeSelector edgeSelector-${id}`
            }
          }
        }
      ),
      getOptionLabel: (opt) => stringUtils.displayPredicate(opt),
      clearOnBlur: false,
      multiple: true,
      limitTags: 1,
      disableCloseOnSelect: true,
      size: "small"
    }
  );
}
const flattenTree = (root, includeMixins) => {
  const items = [root];
  if (root.children) {
    for (const child of root.children) {
      items.push(...flattenTree(child, includeMixins));
    }
  }
  if (root.mixinChildren && includeMixins === true) ;
  return items;
};
const getQualifierOptions = ({ range, subpropertyOf }) => {
  const options = [];
  if (range) {
    if (range.permissible_values) {
      options.push(...Object.keys(range.permissible_values));
    } else {
      options.push(...flattenTree(range, false).map(({ name }) => name));
    }
  }
  if (subpropertyOf) {
    options.push(...flattenTree(subpropertyOf, false).map(({ name }) => name));
  }
  return options;
};
function QualifiersSelector({ id, associations }) {
  const queryBuilder = useQueryBuilderContext();
  const associationOptions = associations.filter((a) => a.qualifiers.length > 0).map(({ association, qualifiers: qualifiers2 }) => ({
    name: association.name,
    uuid: association.uuid,
    qualifiers: qualifiers2.map((q) => ({
      name: q.qualifier.name,
      options: getQualifierOptions(q)
    }))
  }));
  const [value, setValue] = React.useState(associationOptions[0] || null);
  const [qualifiers, setQualifiers] = React.useState({});
  React.useEffect(() => {
    queryBuilder.dispatch({ type: "editQualifiers", payload: { id, qualifiers } });
  }, [qualifiers]);
  if (associationOptions.length === 0) return null;
  if (associationOptions.length === 1 && associationOptions[0].name === "association") return null;
  if (!value) return null;
  const subjectQualfiers = value.qualifiers.filter(({ name }) => name.includes("subject"));
  const predicateQualifiers = value.qualifiers.filter(({ name }) => name.includes("predicate"));
  const objectQualifiers = value.qualifiers.filter(({ name }) => name.includes("object"));
  const otherQualifiers = value.qualifiers.filter(
    (q) => !subjectQualfiers.includes(q) && !predicateQualifiers.includes(q) && !objectQualifiers.includes(q)
  );
  return /* @__PURE__ */ jsxs("div", { className: "qualifiers-dropdown", children: [
    /* @__PURE__ */ jsxs("div", { style: { marginRight: "2rem" }, children: [
      /* @__PURE__ */ jsx(
        Autocomplete,
        {
          value,
          onChange: (_, newValue) => {
            setValue(newValue);
          },
          disableClearable: true,
          size: "small",
          options: associationOptions,
          getOptionLabel: (option) => option.name,
          isOptionEqualToValue: (opt, val) => opt.uuid === val.uuid,
          style: { width: 300 },
          renderInput: (params) => /* @__PURE__ */ jsx(TextField, { ...params, label: "Association", variant: "outlined" })
        }
      ),
      otherQualifiers.length > 0 && /* @__PURE__ */ jsx("hr", {}),
      /* @__PURE__ */ jsx(
        QualifiersList,
        {
          value: otherQualifiers,
          qualifiers,
          setQualifiers
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      QualifiersList,
      {
        value: subjectQualfiers,
        qualifiers,
        setQualifiers
      }
    ),
    /* @__PURE__ */ jsx(
      QualifiersList,
      {
        value: predicateQualifiers,
        qualifiers,
        setQualifiers
      }
    ),
    /* @__PURE__ */ jsx(
      QualifiersList,
      {
        value: objectQualifiers,
        qualifiers,
        setQualifiers
      }
    )
  ] });
}
function QualifiersList({ value, qualifiers, setQualifiers }) {
  if (value.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "qualifiers-list", children: value.map(({ name, options }) => /* @__PURE__ */ jsx(
    Autocomplete,
    {
      value: qualifiers[name] || null,
      onChange: (_, newValue) => {
        if (newValue === null) {
          setQualifiers((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
          });
        } else {
          setQualifiers((prev) => ({ ...prev, [name]: newValue || null }));
        }
      },
      options,
      renderInput: (params) => /* @__PURE__ */ jsx(TextField, { ...params, label: name, variant: "outlined" }),
      size: "small"
    },
    name
  )) });
}
function getValidAssociations(s, p, o, model) {
  const validAssociations = [];
  const subject = model.classes.lookup.get(s);
  const predicate = model.slots.lookup.get(p);
  const object = model.classes.lookup.get(o);
  const isInRange = (n, range) => {
    const traverse2 = (nodes, search) => {
      for (const node of nodes) {
        if (node === search) return true;
        if (node.parent) {
          if (traverse2([node.parent], search)) return true;
        }
        if (node.mixinParents) {
          if (traverse2(node.mixinParents, search)) return true;
        }
      }
      return false;
    };
    return traverse2([n], range);
  };
  const isInDomain = (n, domain) => {
    const traverse2 = (nodes, search) => {
      for (const node of nodes) {
        if (node === search) return true;
        if (node.parent) {
          if (traverse2([node.parent], search)) return true;
        }
        if (node.mixinParents) {
          if (traverse2(node.mixinParents, search)) return true;
        }
      }
      return false;
    };
    return traverse2([domain], n);
  };
  const getInheritedSPORanges = (association) => {
    const namedThing = model.classes.lookup.get("named thing");
    const relatedTo = model.slots.lookup.get("related to");
    const traverse2 = (nodes, part) => {
      for (const node of nodes) {
        if (node.slotUsage && node.slotUsage[part]) return node.slotUsage[part];
        if (node.parent) {
          const discoveredType = traverse2([node.parent], part);
          if (discoveredType !== null) return discoveredType;
        }
        if (node.mixinParents) {
          const discoveredType = traverse2(node.mixinParents, part);
          if (discoveredType !== null) return discoveredType;
        }
      }
      return null;
    };
    const sub = traverse2([association], "subject") || namedThing;
    const pred = traverse2([association], "predicate") || relatedTo;
    const obj = traverse2([association], "object") || namedThing;
    return { subject: sub, predicate: pred, object: obj };
  };
  const traverse = (nodes, level = 0) => {
    for (const association of nodes) {
      if (association.slotUsage && !association.abstract) {
        const inherited = getInheritedSPORanges(association);
        const validSubject = isInRange(subject, inherited.subject) || isInDomain(subject, inherited.subject);
        const validObject = isInRange(object, inherited.object) || isInDomain(object, inherited.object);
        const validPredicate = isInRange(predicate, inherited.predicate) || isInDomain(predicate, inherited.predicate);
        const qualifiers = Object.entries(association.slotUsage).map(([qualifierName, properties]) => {
          if (properties === null) return null;
          const qualifier = model.slots.lookup.get(qualifierName);
          if (!qualifier || !isInRange(qualifier, model.qualifiers)) return null;
          let range;
          if (properties && properties.range) {
            const potentialEnum = model.enums[properties.range];
            const potentialClassNode = model.classes.lookup.get(properties.range);
            if (potentialEnum) range = potentialEnum;
            if (potentialClassNode) range = potentialClassNode;
          }
          let subpropertyOf;
          if (properties && properties.subproperty_of && model.slots.lookup.has(properties.subproperty_of)) {
            subpropertyOf = model.slots.lookup.get(properties.subproperty_of);
          }
          return {
            qualifier,
            range,
            subpropertyOf
          };
        }).filter((q) => q !== null);
        if (validSubject && validObject && validPredicate) {
          validAssociations.push({
            association,
            inheritedRanges: inherited,
            level,
            qualifiers
          });
        }
      }
      if (association.children) traverse(association.children, level + 1);
    }
  };
  traverse([model.associations]);
  validAssociations.sort((a, b) => b.level - a.level);
  return validAssociations;
}
function TextEditorRow({ row, index }) {
  var _a2;
  var _a, _b, _c, _d, _e, _f;
  const queryBuilder = useQueryBuilderContext();
  const { model } = useContext(BiolinkContext);
  const [isOpen, setIsOpen] = useState(false);
  if (!model) return "Loading...";
  const { query_graph } = queryBuilder;
  const edge = query_graph.edges[row.edgeId];
  if (!edge) return null;
  const hasQualifiers = Array.isArray(edge == null ? void 0 : edge.qualifier_constraints) && edge.qualifier_constraints.length > 0 && Array.isArray((_a = edge.qualifier_constraints[0]) == null ? void 0 : _a.qualifier_set) && edge.qualifier_constraints[0].qualifier_set.length > 0;
  const { edgeId, subjectIsReference, objectIsReference } = row;
  function getNodeCategory(nodeId) {
    if (!nodeId) return "biolink:NamedThing";
    const node = query_graph.nodes[nodeId];
    if (node && Array.isArray(node.categories) && node.categories[0]) {
      return node.categories[0];
    }
    return "biolink:NamedThing";
  }
  const subject = ((_b = getNodeCategory(edge.subject).replace("biolink:", "").match(/[A-Z][a-z]+/g)) == null ? void 0 : _b.join(" ").toLowerCase()) || "named thing";
  const predicate = (edge.subject && ((_c = query_graph.nodes[edge.subject]) == null ? void 0 : _c.categories) && ((_d = edge.predicates) == null ? void 0 : _d[0]) || "biolink:related_to").replace("biolink:", "").replace(/_/g, " ");
  const object = ((_e = getNodeCategory(edge.object).replace("biolink:", "").match(/[A-Z][a-z]+/g)) == null ? void 0 : _e.join(" ").toLowerCase()) || "named thing";
  const validAssociations = getValidAssociations(subject, predicate, object, model);
  function deleteEdge() {
    queryBuilder.dispatch({ type: "deleteEdge", payload: { id: edgeId } });
  }
  function setReference(edgeEnd, nodeId) {
    queryBuilder.dispatch({ type: "editEdge", payload: { edgeId, endpoint: edgeEnd, nodeId } });
  }
  function editNode(id, value) {
    if (!value) return;
    queryBuilder.dispatch({ type: "editNode", payload: { id, node: value } });
  }
  function addHop() {
    queryBuilder.dispatch({ type: "addHop", payload: { nodeId: edge.object } });
  }
  return /* @__PURE__ */ jsxs("div", { className: "editor-row-wrapper", children: [
    /* @__PURE__ */ jsxs("div", { className: "textEditorRow", children: [
      /* @__PURE__ */ jsx(
        IconButton,
        {
          onClick: deleteEdge,
          className: "textEditorIconButton",
          disabled: ((_a2 = (_f = queryBuilder.textEditorRows) == null ? void 0 : _f.length) != null ? _a2 : 0) < 2,
          children: /* @__PURE__ */ jsx(IndeterminateCheckBoxOutlinedIcon, {})
        }
      ),
      /* @__PURE__ */ jsxs("p", { children: [
        index === 0 && "Find",
        index === 1 && "where",
        index > 1 && "and where"
      ] }),
      /* @__PURE__ */ jsx(
        NodeSelector,
        {
          id: edge.subject,
          properties: edge.subject ? query_graph.nodes[edge.subject] : "",
          setReference: (nodeId) => setReference("subject", nodeId),
          update: subjectIsReference ? () => setReference("subject", null) : editNode,
          isReference: subjectIsReference,
          options: {
            includeCuries: !subjectIsReference,
            includeCategories: !subjectIsReference,
            includeExistingNodes: index !== 0,
            existingNodes: Object.keys(query_graph.nodes).filter((key) => key !== edge.object).map((key) => ({
              ...query_graph.nodes[key],
              key,
              name: query_graph.nodes[key].name || key
            }))
          }
        }
      ),
      /* @__PURE__ */ jsx(PredicateSelector, { id: edgeId }),
      /* @__PURE__ */ jsx(
        NodeSelector,
        {
          id: edge.object,
          properties: edge.object ? query_graph.nodes[edge.object] : "",
          setReference: (nodeId) => setReference("object", nodeId),
          update: objectIsReference ? () => setReference("object", null) : editNode,
          isReference: objectIsReference,
          options: {
            includeCuries: !objectIsReference,
            includeCategories: !objectIsReference,
            includeExistingNodes: index !== 0,
            existingNodes: Object.keys(query_graph.nodes).filter((key) => key !== edge.subject).map((key) => ({
              ...query_graph.nodes[key],
              key,
              name: query_graph.nodes[key].name || key
            }))
          }
        }
      ),
      /* @__PURE__ */ jsx(IconButton, { onClick: addHop, className: "textEditorIconButton", children: /* @__PURE__ */ jsx(AddBoxOutlinedIcon, {}) })
    ] }),
    /* @__PURE__ */ jsx(Collapse, { in: isOpen, children: /* @__PURE__ */ jsx("div", { className: "qualifiers-wrapper", children: /* @__PURE__ */ jsx(QualifiersSelector, { id: edgeId, associations: validAssociations }) }) }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "dropdown-toggle",
        onClick: () => {
          setIsOpen((p) => !p);
        },
        style: { color: "#333" },
        children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8em" }, children: isOpen ? "\u25B2" : "\u25BC" }),
          /* @__PURE__ */ jsxs(
            "span",
            {
              style: hasQualifiers ? {
                fontWeight: "bold",
                fontStyle: "italic"
              } : void 0,
              children: [
                " Qualifiers",
                hasQualifiers && "*"
              ]
            }
          )
        ]
      }
    )
  ] });
}
function TextEditor({ rows }) {
  return /* @__PURE__ */ jsx("div", { id: "queryTextEditor", children: rows.map((row, i) => /* @__PURE__ */ jsx(TextEditorRow, { row, index: i }, row.edgeId)) });
}
const rectSize = {
  w: 50,
  h: 25
};
const deleteRectOffset = {
  x: -54,
  y: -90
};
const deleteTextOffset = {
  x: (deleteRectOffset.x + (deleteRectOffset.x + rectSize.w)) / 2,
  y: (deleteRectOffset.y + (deleteRectOffset.y + rectSize.h)) / 2
};
const editRectOffset = {
  x: 4,
  y: -90
};
const editTextOffset = {
  x: (editRectOffset.x + (editRectOffset.x + rectSize.w)) / 2,
  y: (editRectOffset.y + (editRectOffset.y + rectSize.h)) / 2
};
function enter(node, args) {
  const { nodeRadius: nodeRadius2, colorMap } = args;
  return node.append("g").attr("class", "node").attr("id", (d) => d.id).call(
    (nodeCircle) => nodeCircle.append("circle").attr("class", (d) => `nodeCircle node-${d.id}`).attr("r", nodeRadius2).attr("fill", (d) => colorMap(d.categories)[1]).style("cursor", "pointer").call(
      (n) => n.append("title").text((d) => {
        let title = d.id;
        if (d.name) {
          title += `: ${d.name}`;
        }
        return title;
      })
    )
  ).call(
    (nodeLabel) => nodeLabel.append("text").attr("class", "nodeLabel").style("pointer-events", "none").attr("text-anchor", "middle").style("font-weight", 600).attr("alignment-baseline", "middle").text((d) => {
      const { name } = d;
      return name || "Something";
    }).each(graphUtils.fitTextIntoCircle)
  ).call(
    (nodeDelete) => nodeDelete.append("rect").attr("rx", 5).attr("ry", 5).attr("transform", `translate(${deleteRectOffset.x},${deleteRectOffset.y})`).attr("width", rectSize.w).attr("height", rectSize.h).attr("stroke", "black").attr("fill", "white").style("filter", "url(#buttonShadow)").style("display", "none").attr("class", (d) => `${d.id} deleteRect`)
  ).call(
    (nodeDeleteLabel) => nodeDeleteLabel.append("text").attr("dx", deleteTextOffset.x).attr("dy", deleteTextOffset.y).style("pointer-events", "none").attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("class", (d) => `${d.id} deleteLabel`).style("display", "none").text("delete")
  ).call(
    (nodeEdit) => nodeEdit.append("rect").attr("rx", 5).attr("ry", 5).attr("transform", `translate(${editRectOffset.x},${editRectOffset.y})`).attr("width", rectSize.w).attr("height", rectSize.h).attr("stroke", "black").attr("fill", "white").style("filter", "url(#buttonShadow)").style("display", "none").attr("class", (d) => `${d.id} editRect`)
  ).call(
    (nodeEditLabel) => nodeEditLabel.append("text").attr("dx", editTextOffset.x).attr("dy", editTextOffset.y).style("pointer-events", "none").attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("class", (d) => `${d.id} editLabel`).style("display", "none").text("edit")
  );
}
function update(node, args) {
  const { colorMap } = args;
  return node.call(
    (n) => n.select(".nodeCircle").attr("fill", (d) => colorMap(d.categories)[1])
  ).style("filter", (d) => d.is_set ? "url(#setShadow)" : "").call(
    (nodeCircle) => nodeCircle.select("title").text((d) => {
      let title = d.id;
      if (d.name) {
        title += `: ${d.name}`;
      }
      return title;
    })
  ).call(
    (l) => l.select(".nodeLabel").text((d) => {
      const { name } = d;
      return name || "Something";
    }).each(graphUtils.fitTextIntoCircle)
  );
}
function exit(node) {
  return node.transition().ease(d3.easeCircle).duration(1e3).attr("transform", (d) => `translate(${d.x},-40)`).call((e) => e.select("circle").attr("fill", "red")).remove();
}
function attachConnectionClick(addNodeToConnection) {
  d3.selectAll(".nodeCircle").on("click", function(e, d) {
    e.stopPropagation();
    d3.select(this).attr("stroke", "#e0dfdf").attr("stroke-width", "5");
    addNodeToConnection(d.id);
  });
}
function attachNodeClick(clickedId, setClickedId) {
  d3.selectAll(".nodeCircle").on("click", (e, d) => {
    const { id } = d;
    d3.select("#nodeContainer").raise();
    d3.select(`#${id}`).raise();
    if (clickedId !== id) {
      e.stopPropagation();
      d3.selectAll(".deleteRect,.deleteLabel,.editRect,.editLabel").style("display", "none");
      d3.selectAll(`.${id}`).style("display", "inherit").raise();
      setClickedId(id);
      highlighter.clearAllNodes();
      highlighter.clearAllEdges();
      highlighter.highlightTextEditorNode(d.id);
      highlighter.highlightGraphNode(d.id);
    } else {
      setClickedId("");
      d3.select("#edgeContainer").raise();
    }
  });
}
function clickNode(id) {
  d3.select(`.nodeCircle.node-${id}`).dispatch("click");
}
function attachDeleteClick(deleteNode, setClickedId) {
  d3.selectAll(".deleteRect").on("click", (e, d) => {
    const { id } = d;
    d3.select("#edgeContainer").raise();
    setClickedId("");
    deleteNode(id);
  });
}
function attachEditClick(openEditor, setClickedId) {
  d3.selectAll(".editRect").on("click", (e, d) => {
    const { id } = d;
    const nodeAnchor = d3.select(`#${id} > .nodeCircle`).node();
    d3.select("#edgeContainer").raise();
    setClickedId("");
    openEditor(id, nodeAnchor, "editNode");
  });
}
function attachMouseHover(clickedId) {
  d3.selectAll(".nodeCircle").on("mouseover", (e, d) => {
    if (clickedId === d.id || !clickedId) {
      highlighter.highlightTextEditorNode(d.id);
      highlighter.highlightGraphNode(d.id);
    }
  }).on("mouseout", (e, d) => {
    if (clickedId !== d.id || !clickedId) {
      highlighter.clearTextEditorNode(d.id);
      highlighter.clearGraphNode(d.id);
    }
  });
}
function attachDrag(simulation, width2, height2, nodeRadius2) {
  d3.selectAll(".node").call(dragUtils.dragNode(simulation));
}
function removeClicks() {
  d3.selectAll(".nodeCircle").on("click", null);
}
function removeMouseHover() {
  d3.selectAll(".nodeCircle").on("mouseover", null).on("mouseout", null);
}
function removeBorder() {
  d3.selectAll(".nodeCircle").transition().delay(2e3).duration(1e3).attr("stroke-width", "0");
}
const nodeUtils = {
  enter,
  update,
  exit,
  attachConnectionClick,
  attachNodeClick,
  attachEditClick,
  attachDeleteClick,
  attachMouseHover,
  attachDrag,
  removeClicks,
  removeMouseHover,
  removeBorder,
  clickNode
};
const nodeRadius = 48;
const edgeLength = 225;
function QueryGraph({
  height: height2,
  width: width2,
  clickState,
  updateClickState
}) {
  var _a;
  const { colorMap, predicates = [] } = useContext(BiolinkContext);
  const symmetricPredicates = (_a = predicates == null ? void 0 : predicates.filter((predicate) => predicate == null ? void 0 : predicate.symmetric)) == null ? void 0 : _a.map((predicate) => predicate == null ? void 0 : predicate.predicate);
  const queryBuilder = useQueryBuilderContext();
  const { query_graph } = queryBuilder;
  const { nodes, edges } = useMemo(
    () => queryGraphUtils.getNodeAndEdgeListsForDisplay(query_graph),
    [queryBuilder.state]
  );
  const node = useRef(null);
  const edge = useRef(null);
  const svgRef = useRef(null);
  const svg = useRef(null);
  const simulation = useRef(null);
  const nodeArgs = {
    nodeRadius,
    colorMap: colorMap || (() => ["", ""])
  };
  useEffect(() => {
    svg.current = d3.select(svgRef.current).attr("width", width2).attr("height", height2).attr("border", "1px solid black").attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", [0, 0, width2, height2]);
  }, []);
  useEffect(() => {
    if (svg.current.select("#nodeContainer").empty()) {
      svg.current.append("g").attr("id", "nodeContainer");
    }
    if (svg.current.select("#edgeContainer").empty()) {
      svg.current.append("g").attr("id", "edgeContainer");
    }
    edge.current = svg.current.select("#edgeContainer").selectAll("g");
    node.current = svg.current.select("#nodeContainer").selectAll("g");
  }, []);
  useEffect(() => {
    if (svg.current.select("defs").empty()) {
      const defs = svg.current.append("defs");
      defs.append("marker").attr("id", "arrow").attr("viewBox", [0, 0, 20, 13]).attr("refX", 20).attr("refY", 6.5).attr("markerWidth", 6.5).attr("markerHeight", 25).attr("orient", "auto-start-reverse").append("path").attr(
        "d",
        d3.line()([
          [0, 0],
          [0, 13],
          [25, 6.5]
        ])
      ).attr("fill", "#999");
      const shadow = defs.append("filter").attr("id", "setShadow").attr("width", "250%").attr("height", "250%");
      shadow.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 5).attr("result", "blur");
      shadow.append("feOffset").attr("in", "blur").attr("dx", 0).attr("dy", 0).attr("result", "offsetBlur");
      let feMerge = shadow.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "offsetBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
      const buttonShadow = defs.append("filter").attr("id", "buttonShadow").attr("width", "130%").attr("height", "130%");
      buttonShadow.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 1).attr("result", "blur");
      buttonShadow.append("feOffset").attr("in", "blur").attr("dx", 2).attr("dy", 2).attr("result", "offsetBlur");
      feMerge = buttonShadow.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "offsetBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }
  }, []);
  useEffect(() => {
    simulation.current = d3.forceSimulation().force("collide", d3.forceCollide().radius(nodeRadius)).force(
      "link",
      d3.forceLink().id((d) => d.id).distance(edgeLength).strength(1)
    ).force("center", d3.forceCenter(width2 / 2, height2 / 2).strength(0.05)).on("tick", ticked);
  }, []);
  function ticked() {
    if (node.current) {
      node.current.attr("transform", (d) => {
        let padding = nodeRadius;
        if (d.fx !== null && d.fx !== void 0) {
          padding *= 0.5;
        }
        d.x = graphUtils.getBoundedValue(d.x || 0, width2 - padding, padding);
        d.y = graphUtils.getBoundedValue(d.y || 0, height2 - padding, padding);
        return `translate(${d.x},${d.y})`;
      });
    }
    if (edge.current) {
      edge.current.select(".edgePath").attr("d", (d) => {
        var _a2, _b, _c, _d;
        const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
          ((_a2 = d.source) == null ? void 0 : _a2.x) || 0,
          ((_b = d.source) == null ? void 0 : _b.y) || 0,
          ((_c = d.target) == null ? void 0 : _c.x) || 0,
          ((_d = d.target) == null ? void 0 : _d.y) || 0,
          d.numEdges || 1,
          d.index || 0,
          nodeRadius
        );
        return `M${x1},${y1}Q${qx},${qy} ${x2},${y2}`;
      });
      edge.current.select(".edgeTransparent").attr("d", (d) => {
        var _a2, _b, _c, _d;
        const { x1, y1, qx, qy, x2, y2 } = graphUtils.getCurvedEdgePos(
          ((_a2 = d.source) == null ? void 0 : _a2.x) || 0,
          ((_b = d.source) == null ? void 0 : _b.y) || 0,
          ((_c = d.target) == null ? void 0 : _c.x) || 0,
          ((_d = d.target) == null ? void 0 : _d.y) || 0,
          d.numEdges || 1,
          d.index || 0,
          nodeRadius
        );
        const leftNode = x1 > x2 ? `${x2},${y2}` : `${x1},${y1}`;
        const rightNode = x1 > x2 ? `${x1},${y1}` : `${x2},${y2}`;
        return `M${leftNode}Q${qx},${qy} ${rightNode}`;
      });
      edge.current.select(".source").attr("cx", (d) => {
        var _a2, _b, _c, _d;
        const { x1 } = graphUtils.getCurvedEdgePos(
          ((_a2 = d.source) == null ? void 0 : _a2.x) || 0,
          ((_b = d.source) == null ? void 0 : _b.y) || 0,
          ((_c = d.target) == null ? void 0 : _c.x) || 0,
          ((_d = d.target) == null ? void 0 : _d.y) || 0,
          d.numEdges || 1,
          d.index || 0,
          nodeRadius
        );
        const boundedVal = graphUtils.getBoundedValue(x1, width2);
        d.x = boundedVal;
        return boundedVal;
      }).attr("cy", (d) => {
        var _a2, _b, _c, _d;
        const { y1 } = graphUtils.getCurvedEdgePos(
          ((_a2 = d.source) == null ? void 0 : _a2.x) || 0,
          ((_b = d.source) == null ? void 0 : _b.y) || 0,
          ((_c = d.target) == null ? void 0 : _c.x) || 0,
          ((_d = d.target) == null ? void 0 : _d.y) || 0,
          d.numEdges || 1,
          d.index || 0,
          nodeRadius
        );
        const boundedVal = graphUtils.getBoundedValue(y1, height2);
        d.y = boundedVal;
        return boundedVal;
      });
      edge.current.select(".target").attr("cx", (d) => {
        var _a2, _b, _c, _d;
        const { x2 } = graphUtils.getCurvedEdgePos(
          ((_a2 = d.source) == null ? void 0 : _a2.x) || 0,
          ((_b = d.source) == null ? void 0 : _b.y) || 0,
          ((_c = d.target) == null ? void 0 : _c.x) || 0,
          ((_d = d.target) == null ? void 0 : _d.y) || 0,
          d.numEdges || 1,
          d.index || 0,
          nodeRadius
        );
        const boundedVal = graphUtils.getBoundedValue(x2, width2);
        d.x = boundedVal;
        return boundedVal;
      }).attr("cy", (d) => {
        var _a2, _b, _c, _d;
        const { y2 } = graphUtils.getCurvedEdgePos(
          ((_a2 = d.source) == null ? void 0 : _a2.x) || 0,
          ((_b = d.source) == null ? void 0 : _b.y) || 0,
          ((_c = d.target) == null ? void 0 : _c.x) || 0,
          ((_d = d.target) == null ? void 0 : _d.y) || 0,
          d.numEdges || 1,
          d.index || 0,
          nodeRadius
        );
        const boundedVal = graphUtils.getBoundedValue(y2, height2);
        d.y = boundedVal;
        return boundedVal;
      });
      edge.current.select(".edgeButtons").attr("transform", (d) => {
        const { x, y } = graphUtils.getEdgeMidpoint(d);
        return `translate(${x},${y})`;
      });
    }
  }
  useEffect(() => {
    var _a2;
    const oldNodes = new Map(
      node.current.data().map((d) => [d.id, { x: d.x, y: d.y }])
    );
    const newNodes = nodes.map(
      (d) => Object.assign(
        oldNodes.get(d.id) || { x: Math.random() * width2, y: Math.random() * height2 },
        d
      )
    );
    const newEdges = edges.map((d) => ({ ...d }));
    simulation.current.nodes(newNodes);
    (_a2 = simulation.current.force("link")) == null ? void 0 : _a2.links(newEdges);
    simulation.current.alpha(1).restart();
    node.current = node.current.data(newNodes, (d) => d.id).join(
      (n) => nodeUtils.enter(n, nodeArgs),
      (n) => nodeUtils.update(n, nodeArgs),
      (n) => nodeUtils.exit(n)
    );
    const edgesWithCurves = edgeUtils.addEdgeCurveProperties(newEdges);
    edgesWithCurves.forEach((e) => {
      e.symmetric = symmetricPredicates;
    });
    edge.current = edge.current.data(edgesWithCurves, (d) => d.id).join(edgeUtils.enter, edgeUtils.update, edgeUtils.exit);
  }, [nodes, edges]);
  function updateEdge(edgeId, endpoint, nodeId) {
    var _a2;
    queryBuilder.dispatch({ type: "editEdge", payload: { edgeId, endpoint, nodeId } });
    if (!queryBuilder.state.isValid) {
      (_a2 = simulation.current) == null ? void 0 : _a2.alpha(1e-3).restart();
    }
  }
  useEffect(() => {
    if (clickState.creatingConnection) {
      const addNodeToConnection = (id) => updateClickState({ type: "connectTerm", payload: { id } });
      nodeUtils.attachConnectionClick(addNodeToConnection);
      nodeUtils.removeMouseHover();
      edgeUtils.removeClicks();
      edgeUtils.removeMouseHover();
    } else {
      const { clickedId } = clickState;
      const setClickedId = (id) => updateClickState({ type: "click", payload: { id } });
      const openEditor = (id, anchor, type) => updateClickState({ type: "openEditor", payload: { id, anchor, type } });
      nodeUtils.attachNodeClick(clickedId, setClickedId);
      nodeUtils.attachEditClick(openEditor, setClickedId);
      nodeUtils.attachDeleteClick(
        (id) => queryBuilder.dispatch({ type: "deleteNode", payload: { id } }),
        setClickedId
      );
      nodeUtils.attachMouseHover(clickedId);
      nodeUtils.attachDrag(simulation.current, width2, height2, nodeRadius);
      edgeUtils.attachEdgeClick(clickedId, setClickedId);
      edgeUtils.attachEditClick(openEditor, setClickedId);
      edgeUtils.attachDeleteClick(
        (id) => queryBuilder.dispatch({ type: "deleteEdge", payload: { id } }),
        setClickedId
      );
      edgeUtils.attachMouseHover(clickedId);
      edgeUtils.attachDrag(simulation.current, width2, height2, nodeRadius, updateEdge);
    }
    svg.current.on("click", (e) => {
      d3.selectAll(".deleteRect,.deleteLabel,.editRect,.editLabel").style("display", "none");
      d3.select("#edgeContainer").raise();
      highlighter.clearAllNodes();
      highlighter.clearAllEdges();
      if (clickState.clickedId !== "") {
        updateClickState({ type: "click", payload: { id: "" } });
      }
      e.stopPropagation();
    });
  }, [clickState, nodes, edges]);
  return /* @__PURE__ */ jsx("svg", { ref: svgRef });
}
function SaveQuery({ show, close }) {
  const { displayAlert } = useAlert();
  const queryBuilder = useQueryBuilderContext();
  const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);
  const [queryName, setQueryName] = useState("");
  const queryData = { message: { query_graph: prunedQueryGraph } };
  useEffect(() => {
    if (!show) setQueryName("");
  }, [show]);
  const handleCancel = () => {
    close();
  };
  const handleSave = () => {
    authApi.post(routes.queryRoutes.base, {
      name: queryName,
      query: queryData
    }).then(() => {
      displayAlert("success", "Query bookmarked successfully");
      close();
    }).catch((error) => {
      console.error("Error saving query:", error);
    });
  };
  return /* @__PURE__ */ jsxs(Dialog, { open: show, onClose: close, fullWidth: true, maxWidth: "sm", children: [
    /* @__PURE__ */ jsx(DialogTitle, { children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ jsx("p", { style: { margin: 0 }, children: "Bookmark Query" }),
      /* @__PURE__ */ jsx(
        IconButton,
        {
          style: {
            fontSize: "18px"
          },
          title: "Close Editor",
          onClick: close,
          children: /* @__PURE__ */ jsx(CloseIcon, {})
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsx(
      TextField,
      {
        label: "Query name",
        fullWidth: true,
        value: queryName,
        onChange: (e) => setQueryName(e.target.value),
        autoFocus: true
      }
    ) }),
    /* @__PURE__ */ jsxs(DialogActions, { children: [
      /* @__PURE__ */ jsx(Button, { onClick: handleCancel, color: "secondary", children: "Cancel" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleSave,
          color: "primary",
          variant: "contained",
          disabled: !queryName.trim(),
          children: "Save"
        }
      )
    ] })
  ] });
}
const width = 600;
const height = 400;
function clickReducer(state, action) {
  switch (action.type) {
    case "startConnection": {
      const { anchor } = action.payload;
      state.creatingConnection = true;
      state.popoverId = "";
      state.popoverAnchor = anchor;
      state.popoverType = "newEdge";
      break;
    }
    case "connectTerm": {
      const { id } = action.payload;
      state.chosenTerms = [...state.chosenTerms, id];
      break;
    }
    case "connectionMade": {
      state.creatingConnection = false;
      state.chosenTerms = [];
      break;
    }
    case "click": {
      const { id } = action.payload;
      state.clickedId = id;
      break;
    }
    case "openEditor": {
      const { id, type, anchor } = action.payload;
      state.popoverId = id;
      state.popoverType = type;
      state.popoverAnchor = anchor;
      break;
    }
    case "closeEditor": {
      state.popoverId = "";
      state.popoverType = "";
      state.popoverAnchor = null;
      break;
    }
    default: {
      return state;
    }
  }
  return { ...state };
}
function GraphEditor() {
  const queryBuilder = useQueryBuilderContext();
  const { user } = useAuth();
  const { query_graph } = queryBuilder;
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [showSaveQuery, toggleSaveQuery] = useState(false);
  const [clickState, clickDispatch] = useReducer(clickReducer, {
    creatingConnection: false,
    chosenTerms: [],
    clickedId: "",
    popoverId: "",
    popoverAnchor: null,
    popoverType: ""
  });
  function addEdge() {
    queryBuilder.dispatch({ type: "addEdge", payload: clickState.chosenTerms });
  }
  function addHop() {
    if (!Object.keys(query_graph.nodes).length) {
      queryBuilder.dispatch({ type: "addNode", payload: {} });
    } else {
      queryBuilder.dispatch({ type: "addHop", payload: {} });
    }
  }
  function editNode(id, node) {
    queryBuilder.dispatch({ type: "editNode", payload: { id, node } });
  }
  useEffect(() => {
    if (clickState.creatingConnection && clickState.chosenTerms.length >= 2) {
      addEdge();
      clickDispatch({ type: "connectionMade" });
      nodeUtils.removeBorder();
    }
  }, [clickState]);
  return /* @__PURE__ */ jsx("div", { id: "queryGraphEditor", children: /* @__PURE__ */ jsxs("div", { id: "graphContainer", style: { height: height + 50, width }, children: [
    /* @__PURE__ */ jsx(
      QueryGraph,
      {
        height,
        width,
        clickState,
        updateClickState: clickDispatch
      }
    ),
    /* @__PURE__ */ jsxs("div", { id: "graphBottomButtons", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: () => {
            addHop();
          },
          children: "Add New Term"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: (e) => {
            clickDispatch({ type: "startConnection", payload: { anchor: e.currentTarget } });
            setTimeout(() => {
              clickDispatch({ type: "closeEditor" });
            }, 5e3);
          },
          children: "Connect Terms"
        }
      ),
      /* @__PURE__ */ jsx(Tooltip, { title: user ? "" : "Login to save your query", children: /* @__PURE__ */ jsx("span", { style: { display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx(Button, { onClick: () => toggleSaveQuery(true), disabled: !user, children: "Bookmark Graph" }) }) })
    ] }),
    /* @__PURE__ */ jsxs(
      Popover,
      {
        open: Boolean(clickState.popoverAnchor),
        anchorEl: clickState.popoverAnchor,
        onClose: () => clickDispatch({ type: "closeEditor" }),
        anchorOrigin: {
          vertical: "top",
          horizontal: "left"
        },
        transformOrigin: {
          vertical: "bottom",
          horizontal: "left"
        },
        children: [
          (clickState.popoverType === "editNode" || clickState.popoverType === "newNode") && /* @__PURE__ */ jsx(
            NodeSelector,
            {
              properties: query_graph.nodes[clickState.popoverId],
              id: clickState.popoverId,
              update: (id, node) => editNode(id, node),
              isReference: false,
              setReference: () => {
              },
              options: {
                includeExistingNodes: false
              }
            }
          ),
          clickState.popoverType === "editEdge" && /* @__PURE__ */ jsx(PredicateSelector, { id: clickState.popoverId }),
          clickState.popoverType === "newEdge" && /* @__PURE__ */ jsx(Paper, { style: { padding: "10px" }, children: /* @__PURE__ */ jsx("p", { children: "Select two terms to connect!" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      DownloadDialog,
      {
        open: downloadOpen,
        setOpen: setDownloadOpen,
        message: queryBuilder.query_graph,
        download_type: "query"
      }
    ),
    /* @__PURE__ */ jsx(SaveQuery, { show: showSaveQuery, close: () => toggleSaveQuery(false) })
  ] }) });
}
const examples = [
  {
    type: "template",
    tags: "AOP",
    template: [
      {
        type: "text",
        text: "What adverse outcome pathways (AOPs) may explain the relationship between "
      },
      {
        type: "node",
        id: "n0",
        name: "chemical exposure",
        filterType: "biolink:ChemicalEntity"
      },
      {
        type: "text",
        text: " and "
      },
      {
        type: "node",
        id: "n4",
        name: "disease",
        filterType: "biolink:DiseaseOrPhenotypicFeature"
      },
      {
        type: "text",
        text: "?"
      }
    ],
    structure: {
      nodes: {
        n1: {
          name: "Gene",
          category: "biolink:Gene"
        },
        n2: {
          name: "Biological Process",
          category: "biolink:BiologicalProcessOrActivity"
        },
        n3: {
          name: "Phenotypic Feature",
          category: "biolink:PhenotypicFeature"
        }
      },
      edges: {
        e0: {
          subject: "n0",
          object: "n1",
          predicate: "biolink:related_to"
        },
        e1: {
          subject: "n1",
          object: "n2",
          predicate: "biolink:related_to"
        },
        e3: {
          subject: "n2",
          object: "n3",
          predicate: "biolink:related_to"
        },
        e4: {
          subject: "n3",
          object: "n4",
          predicate: "biolink:related_to"
        }
      }
    }
  },
  {
    type: "template",
    tags: "COP",
    template: [
      {
        type: "text",
        text: "What clinical outcome pathways (COPs) may explain the relationship between "
      },
      {
        type: "node",
        id: "n0",
        name: "drug",
        filterType: "biolink:Drug"
      },
      {
        type: "text",
        text: " and "
      },
      {
        type: "node",
        id: "n4",
        name: "disease",
        filterType: "biolink:DiseaseOrPhenotypicFeature"
      },
      {
        type: "text",
        text: "?"
      }
    ],
    structure: {
      nodes: {
        n1: {
          name: "Gene",
          category: "biolink:Gene"
        },
        n2: {
          name: "Biological Process",
          category: "biolink:BiologicalProcessOrActivity"
        },
        n3: {
          name: "Phenotypic Feature",
          category: "biolink:PhenotypicFeature"
        }
      },
      edges: {
        e0: {
          subject: "n0",
          object: "n1",
          predicate: "biolink:related_to"
        },
        e1: {
          subject: "n1",
          object: "n2",
          predicate: "biolink:related_to"
        },
        e3: {
          subject: "n2",
          object: "n3",
          predicate: "biolink:related_to"
        },
        e4: {
          subject: "n3",
          object: "n4",
          predicate: "biolink:related_to"
        }
      }
    }
  },
  {
    type: "template",
    tags: "AOP",
    template: [
      {
        type: "text",
        text: "What genes may relate "
      },
      {
        type: "node",
        id: "n0",
        name: "chemical exposure",
        filterType: "biolink:ChemicalEntity"
      },
      {
        type: "text",
        text: " and "
      },
      {
        type: "node",
        id: "n2",
        name: "disease",
        filterType: "biolink:DiseaseOrPhenotypicFeature"
      },
      {
        type: "text",
        text: "?"
      }
    ],
    structure: {
      nodes: {
        n1: {
          name: "Gene",
          category: "biolink:Gene"
        }
      },
      edges: {
        e0: {
          subject: "n0",
          object: "n1",
          predicate: "biolink:related_to"
        },
        e1: {
          subject: "n1",
          object: "n2",
          predicate: "biolink:related_to"
        }
      }
    }
  },
  {
    type: "template",
    tags: "COP",
    template: [
      {
        type: "text",
        text: "What genes may relate "
      },
      {
        type: "node",
        id: "n0",
        name: "drug",
        filterType: "biolink:Drug"
      },
      {
        type: "text",
        text: " and "
      },
      {
        type: "node",
        id: "n2",
        name: "disease",
        filterType: "biolink:DiseaseOrPhenotypicFeature"
      },
      {
        type: "text",
        text: "?"
      }
    ],
    structure: {
      nodes: {
        n1: {
          name: "Gene",
          category: "biolink:Gene"
        }
      },
      edges: {
        e0: {
          subject: "n0",
          object: "n1",
          predicate: "biolink:related_to"
        },
        e1: {
          subject: "n1",
          object: "n2",
          predicate: "biolink:related_to"
        }
      }
    }
  },
  {
    type: "example",
    template: [
      {
        type: "text",
        text: "Chemicals that might ameliorate Huntington's Disease"
      }
    ],
    structure: {
      nodes: {
        n0: {
          name: "Chemical Entity",
          category: "biolink:ChemicalEntity"
        },
        n1: {
          name: "Huntington disease",
          category: "biolink:Disease",
          id: "MONDO:0007739"
        }
      },
      edges: {
        e0: {
          subject: "n0",
          object: "n1",
          predicate: "biolink:treats"
        }
      }
    }
  },
  {
    type: "example",
    template: [
      {
        type: "text",
        text: "Chemicals that interact with a gene related to Castleman disease"
      }
    ],
    structure: {
      nodes: {
        n0: {
          name: "Chemical Entity",
          category: "biolink:ChemicalEntity"
        },
        n1: {
          name: "Gene",
          category: "biolink:Gene"
        },
        n2: {
          name: "Castleman disease",
          category: "biolink:DiseaseOrPhenotypicFeature",
          id: "MONDO:0015564"
        }
      },
      edges: {
        e0: {
          subject: "n0",
          object: "n1",
          predicate: "biolink:interacts_with"
        },
        e1: {
          subject: "n1",
          object: "n2",
          predicate: "biolink:related_to"
        }
      }
    }
  },
  {
    type: "example",
    template: [
      {
        type: "text",
        text: "Genes and chemicals related to GLUT 1 deficiency, and to each other"
      }
    ],
    structure: {
      nodes: {
        n0: {
          name: "Chemical Entity",
          category: "biolink:ChemicalEntity"
        },
        n1: {
          name: "Gene",
          category: "biolink:Gene"
        },
        n2: {
          name: "GLUT 1 deficiency syndrome",
          category: "biolink:DiseaseOrPhenotypicFeature",
          id: "MONDO:0000188"
        }
      },
      edges: {
        e0: {
          subject: "n0",
          object: "n1",
          predicate: "biolink:related_to"
        },
        e1: {
          subject: "n1",
          object: "n2",
          predicate: "biolink:related_to"
        },
        e2: {
          subject: "n2",
          object: "n0",
          predicate: "biolink:related_to"
        }
      }
    }
  },
  {
    type: "example",
    template: [
      {
        type: "text",
        text: "Diseases associated with 2,3,7,8-tetrochlorodibenzo-p-dioxin"
      }
    ],
    structure: {
      nodes: {
        n0: {
          name: "2,3,7,8-tetrochlorodibenzo-p-dioxin",
          category: "biolink:MolecularEntity",
          id: "PUBCHEM.COMPOUND:15625"
        },
        n1: {
          name: "Disease",
          category: "biolink:Disease"
        }
      },
      edges: {
        e0: {
          subject: "n0",
          object: "n1",
          predicate: "biolink:associated_with"
        }
      }
    }
  }
];
const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    display: "flex",
    flexDirection: "row",
    width: 1200,
    height: 900,
    borderRadius: "8px"
  }
}));
function createTemplateDisplay(template) {
  return /* @__PURE__ */ jsx("span", { children: template.map((part, i) => {
    if (part.type === "text") {
      return /* @__PURE__ */ jsx("span", { children: part.text }, i);
    }
    if (part.type === "node") {
      return /* @__PURE__ */ jsx("code", { children: part.name }, i);
    }
    return null;
  }) });
}
function PleaseSelectAnExampleText() {
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.5rem",
        fontStyle: "italic",
        color: "#acacac"
      },
      children: "Please select an example from the list"
    }
  );
}
function exampleToTrapiFormat(example) {
  const templateNodes = example.template.filter((part) => part.type === "node").reduce((obj, { id }) => ({ ...obj, [id]: { categories: [] } }), {});
  const structureNodes = Object.entries(example.structure.nodes).reduce(
    (obj, [id, n]) => ({
      ...obj,
      [id]: { categories: [n.category], name: n.name, ...n.id && { ids: [n.id] } }
    }),
    {}
  );
  const nodesSortedById = Object.entries({ ...templateNodes, ...structureNodes }).sort(([a], [b]) => a.localeCompare(b)).reduce((obj, [id, n]) => ({ ...obj, [id]: n }), {});
  const edges = Object.entries(example.structure.edges).reduce(
    (obj, [id, e]) => ({
      ...obj,
      [id]: { subject: e.subject, object: e.object, predicates: [e.predicate] }
    }),
    {}
  );
  return {
    message: {
      query_graph: {
        nodes: nodesSortedById,
        edges
      }
    }
  };
}
function TemplatedQueriesModal({ open, setOpen }) {
  const classes = useStyles();
  const queryBuilder = useQueryBuilderContext();
  const [selectedExample, setSelectedExample] = useState(null);
  const [queries, setQueries] = useState([]);
  const handleClose = () => {
    setOpen(false);
    setSelectedExample(null);
  };
  const handleSelectExample = (example) => {
    setSelectedExample(example);
    const payload = exampleToTrapiFormat(example);
    queryBuilder.dispatch({ type: "saveGraph", payload });
  };
  const editNode = (id, node) => {
    queryBuilder.dispatch({ type: "editNode", payload: { id, node } });
  };
  const handleSelectBookmarkedQuery = (query_graph) => {
    const example = {
      type: "example",
      template: [
        {
          text: JSON.stringify(query_graph.query.message.query_graph, null, 2),
          type: "json_text"
        }
      ],
      structure: { nodes: {}, edges: {} }
    };
    setSelectedExample(example);
    queryBuilder.dispatch({ type: "saveGraph", payload: query_graph.query });
  };
  useEffect(() => {
    authApi.get(routes.queryRoutes.base).then((response) => {
      setQueries(response.data);
    }).catch(() => {
    });
  }, [open]);
  return /* @__PURE__ */ jsx(Modal, { open, onClose: handleClose, className: classes.modal, children: /* @__PURE__ */ jsxs("div", { className: classes.paper, children: [
    /* @__PURE__ */ jsxs(
      List,
      {
        style: { flexBasis: 350, overflowY: "auto" },
        subheader: /* @__PURE__ */ jsx(
          ListSubheader,
          {
            component: "div",
            style: {
              background: "white",
              borderBottom: "2px solid rgba(0, 0, 0, 0.12)"
            },
            children: "Please select an example below"
          }
        ),
        children: [
          examples.map((example, i) => /* @__PURE__ */ jsx(
            ListItemButton,
            {
              divider: true,
              onClick: () => {
                handleSelectExample(example);
              },
              children: /* @__PURE__ */ jsx(
                ListItemText,
                {
                  primary: /* @__PURE__ */ jsxs(Fragment, { children: [
                    example.tags && /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Chip, { size: "small", label: example.tags }),
                      " "
                    ] }),
                    createTemplateDisplay(example.template)
                  ] })
                }
              )
            },
            i
          )),
          queries.map((query, i) => /* @__PURE__ */ jsx(
            ListItemButton,
            {
              divider: true,
              onClick: () => {
                handleSelectBookmarkedQuery(query);
              },
              children: /* @__PURE__ */ jsx(
                ListItemText,
                {
                  primary: /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Chip, { size: "small", label: "Bookmarked", color: "secondary" }),
                    " ",
                    query.name
                  ] })
                }
              )
            },
            i
          ))
        ]
      }
    ),
    /* @__PURE__ */ jsx(Divider, { orientation: "vertical", flexItem: true }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flex: "1",
          padding: "1rem",
          flexDirection: "column"
        },
        children: [
          /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end" }, children: /* @__PURE__ */ jsx(IconButton, { size: "small", onClick: handleClose, children: /* @__PURE__ */ jsx(CloseIcon, {}) }) }),
          /* @__PURE__ */ jsx("div", { style: { flex: "1" }, children: selectedExample === null ? /* @__PURE__ */ jsx(PleaseSelectAnExampleText, {}) : selectedExample.template.map((part, i) => {
            if (part.type === "text") {
              return /* @__PURE__ */ jsx("span", { style: { fontSize: "16px" }, children: part.text }, i);
            }
            if (part.type === "node") {
              return /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    maxWidth: "300px",
                    display: "inline-flex",
                    transform: "translateY(-16px)",
                    marginLeft: "-1ch",
                    marginRight: "-1ch"
                  },
                  children: /* @__PURE__ */ jsx(
                    NodeSelector,
                    {
                      id: part.id,
                      title: part.name,
                      size: "small",
                      properties: queryBuilder.query_graph.nodes[part.id],
                      nameresCategoryFilter: part.filterType,
                      update: editNode,
                      isReference: false,
                      setReference: () => {
                      },
                      options: {
                        includeCuries: true,
                        includeCategories: false,
                        includeExistingNodes: false
                      }
                    }
                  )
                },
                i
              );
            }
            if (part.type === "json_text") {
              return /* @__PURE__ */ jsx("pre", { id: "resultJSONContainer", children: part.text });
            }
            return null;
          }) }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end" }, children: /* @__PURE__ */ jsx(Button, { variant: "contained", color: "primary", onClick: handleClose, children: "Done" }) })
        ]
      }
    )
  ] }) });
}
function ClipboardButton({
  startIcon,
  displayText,
  clipboardText,
  notificationText,
  disabled
}) {
  const [snackbarNotification, updateSnackbarNotification] = useState("");
  function copyToClipboard() {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = clipboardText();
    document.body.appendChild(textarea);
    textarea.select();
    textarea.focus();
    if (typeof navigator.clipboard !== "undefined" && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(textarea.innerHTML);
    } else {
      document.execCommand("copy");
    }
    textarea.remove();
    updateSnackbarNotification(notificationText);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        startIcon,
        variant: "contained",
        onClick: copyToClipboard,
        disabled,
        children: displayText
      }
    ),
    /* @__PURE__ */ jsx(
      Snackbar,
      {
        open: !!snackbarNotification,
        autoHideDuration: 6e3,
        onClose: () => updateSnackbarNotification(""),
        anchorOrigin: {
          vertical: "top",
          horizontal: "center"
        },
        children: /* @__PURE__ */ jsx(Alert, { severity: "success", children: snackbarNotification })
      }
    )
  ] });
}
function JsonEditor({ show, close }) {
  const queryBuilder = useQueryBuilderContext();
  const [errorMessages, setErrorMessages] = useState([]);
  const { message } = queryBuilder.state;
  const [localMessage, updateLocalMessage] = useState(message);
  const pageStatus = usePageStatus(false, "");
  const { displayAlert } = useAlert();
  function updateJson(e) {
    const data = e.updated_src;
    setErrorMessages(trapiUtils.validateMessage(data));
    updateLocalMessage(data);
  }
  function onUpload(event) {
    const { files } = event.target;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => pageStatus.setLoading("Loading Query Graph");
      fr.onloadend = () => pageStatus.setSuccess();
      fr.onload = (e) => {
        const fileContents = e.target && e.target.result;
        try {
          const graph = JSON.parse(fileContents);
          if (graph.message && graph.message.knowledge_graph) {
            delete graph.message.knowledge_graph;
          }
          if (graph.message && graph.message.results) {
            delete graph.message.results;
          }
          const errors = trapiUtils.validateMessage(graph);
          setErrorMessages(errors);
          if (!errors.length) {
            graph.message.query_graph = queryGraphUtils.toCurrentTRAPI(graph.message.query_graph);
          }
          updateLocalMessage(graph);
        } catch (err) {
          console.error("Error reading query graph file:", err);
          displayAlert(
            "error",
            "Failed to read this query graph. Are you sure this is valid JSON?"
          );
        }
      };
      fr.onerror = () => {
        displayAlert(
          "error",
          "Sorry but there was a problem uploading the file. The file may be invalid JSON."
        );
      };
      fr.readAsText(file);
    });
    event.target.value = "";
  }
  useEffect(() => {
    if (show) {
      setErrorMessages(trapiUtils.validateMessage(message));
      updateLocalMessage(message);
    }
  }, [show]);
  function saveGraph() {
    queryBuilder.dispatch({ type: "saveGraph", payload: localMessage });
  }
  function copyQueryGraph() {
    const prunedQueryGraph = queryGraphUtils.prune(localMessage.message.query_graph);
    return JSON.stringify(
      {
        message: {
          ...localMessage.message,
          query_graph: prunedQueryGraph
        }
      },
      null,
      2
    );
  }
  return /* @__PURE__ */ jsxs(
    Dialog,
    {
      open: show,
      fullWidth: true,
      maxWidth: "lg",
      onClose: () => {
        setErrorMessages([]);
        close();
      },
      children: [
        /* @__PURE__ */ jsx(DialogTitle, { style: { padding: 0 }, children: /* @__PURE__ */ jsxs("div", { id: "jsonEditorTitle", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "jsonEditorUpload", id: "uploadIconLabel", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  accept: ".json",
                  style: { display: "none" },
                  type: "file",
                  id: "jsonEditorUpload",
                  onChange: (e) => onUpload(e),
                  disabled: !pageStatus.displayPage
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  component: "span",
                  variant: "contained",
                  disabled: !pageStatus.displayPage,
                  style: { margin: "0px 10px" },
                  title: "Load Message",
                  startIcon: /* @__PURE__ */ jsx(CloudUploadIcon, {}),
                  children: "Upload"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              ClipboardButton,
              {
                startIcon: /* @__PURE__ */ jsx(FileCopy, {}),
                displayText: "Copy",
                clipboardText: copyQueryGraph,
                notificationText: "Copied JSON to clipboard!",
                disabled: !pageStatus.displayPage
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { style: { color: "#777" }, children: "Query Graph JSON Editor" }),
          /* @__PURE__ */ jsx(
            IconButton,
            {
              style: {
                fontSize: "18px"
              },
              title: "Close Editor",
              onClick: () => {
                setErrorMessages([]);
                close();
              },
              children: /* @__PURE__ */ jsx(CloseIcon, {})
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { dividers: true, style: { padding: 0, height: "10000px" }, children: [
          /* @__PURE__ */ jsx(pageStatus.Display, {}),
          pageStatus.displayPage && /* @__PURE__ */ jsxs("div", { style: { display: "flex", height: "100%" }, children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  overflowY: "auto",
                  paddingBottom: "5px",
                  flexGrow: 1
                },
                children: /* @__PURE__ */ jsx(
                  ReactJsonView,
                  {
                    name: false,
                    theme: "rjv-default",
                    collapseStringsAfterLength: 15,
                    indentWidth: 2,
                    iconStyle: "triangle",
                    enableClipboard: false,
                    displayObjectSize: false,
                    displayDataTypes: false,
                    defaultValue: "",
                    src: localMessage,
                    onEdit: updateJson,
                    onAdd: updateJson,
                    onDelete: updateJson
                  }
                )
              }
            ),
            errorMessages.length > 0 && /* @__PURE__ */ jsxs("div", { style: { flexShrink: 1, paddingRight: "20px" }, children: [
              /* @__PURE__ */ jsx("h4", { children: "This query graph is not valid." }),
              errorMessages.map((err, i) => /* @__PURE__ */ jsx("p", { children: err }, i))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(DialogActions, { children: /* @__PURE__ */ jsx(
          Button,
          {
            startIcon: /* @__PURE__ */ jsx(SaveIcon, {}),
            disabled: errorMessages.length > 0 || !pageStatus.displayPage,
            variant: "contained",
            title: "Save Changes",
            onClick: () => {
              saveGraph();
              close();
            },
            children: "Save"
          }
        ) })
      ]
    }
  );
}
const SubmitButton = withStyles((theme) => ({
  root: {
    marginLeft: "auto",
    color: theme.palette.getContrastText(blue[600]),
    backgroundColor: blue[600],
    "&:hover": {
      backgroundColor: blue[700]
    }
  }
}))(Button);
function QueryBuilder() {
  const queryBuilder = useQueryBuilderContext();
  const pageStatus = usePageStatus(false);
  const { user } = useAuth();
  const { browserSupport } = usePasskey();
  const [showJson, toggleJson] = useState(false);
  const [registerPasskeyOpen, setRegisterPasskeyOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [ara] = useState(aras[0]);
  const { displayAlert } = useAlert();
  const navigate = useNavigate();
  const [exampleQueriesOpen, setExampleQueriesOpen] = useState(false);
  const passkeyPopupDenied = localStorage.getItem("passkeyPopupDenied");
  useEffect(() => {
    var _a;
    if (user && browserSupport) {
      if (((_a = user._count) == null ? void 0 : _a.WebAuthnCredential) === 0 && passkeyPopupDenied !== "true") {
        setRegisterPasskeyOpen(true);
      }
    }
  }, [user, browserSupport, passkeyPopupDenied]);
  async function onQuickSubmit() {
    pageStatus.setLoading("Fetching answer, this may take a while");
    const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);
    const response = await API.ara.getQuickAnswer(ara, {
      message: { query_graph: prunedQueryGraph }
    });
    if (response.status === "error") {
      const failedToAnswer = "Please try asking this question later.";
      displayAlert("error", `${response.message}. ${failedToAnswer}`);
      pageStatus.setSuccess();
    } else {
      set("quick_message", JSON.stringify(response)).then(() => {
        displayAlert("success", "Your answer is ready!");
        navigate({ to: "/answer" });
      }).catch((err) => {
        displayAlert(
          "error",
          `Failed to locally store this answer. Please try again later. Error: ${err}`
        );
        pageStatus.setSuccess();
      });
    }
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(pageStatus.Display, {}),
    pageStatus.displayPage && /* @__PURE__ */ jsx("div", { id: "queryBuilderContainer", children: /* @__PURE__ */ jsxs("div", { id: "queryEditorContainer", children: [
      /* @__PURE__ */ jsx(
        RegisterPasskeyDialog,
        {
          open: registerPasskeyOpen,
          onClose: () => setRegisterPasskeyOpen(false)
        }
      ),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(TextEditor, { rows: queryBuilder.textEditorRows || [] }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(GraphEditor, {}),
        /* @__PURE__ */ jsxs("div", { id: "queryBuilderButtons", children: [
          /* @__PURE__ */ jsx(Button, { onClick: () => setExampleQueriesOpen(true), variant: "outlined", children: "Load Example" }),
          /* @__PURE__ */ jsx(TemplatedQueriesModal, { open: exampleQueriesOpen, setOpen: setExampleQueriesOpen }),
          /* @__PURE__ */ jsx(Button, { onClick: () => toggleJson(true), variant: "outlined", children: "Edit JSON" }),
          /* @__PURE__ */ jsx(Button, { onClick: () => setDownloadOpen(true), variant: "outlined", children: "Download Query" }),
          /* @__PURE__ */ jsx("div", { style: { flexGrow: 1 } }),
          /* @__PURE__ */ jsx(SubmitButton, { onClick: () => onQuickSubmit(), variant: "contained", children: "Submit" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(JsonEditor, { show: showJson, close: () => toggleJson(false) }),
      /* @__PURE__ */ jsx(
        DownloadDialog,
        {
          open: downloadOpen,
          setOpen: setDownloadOpen,
          message: queryBuilder.query_graph,
          download_type: "all_queries"
        }
      )
    ] }) })
  ] });
}
const SplitComponent = function Index() {
  return /* @__PURE__ */ jsx(QueryBuilder, {});
};

export { SplitComponent as component };
//# sourceMappingURL=question-builder-kVcmOFnQ.mjs.map
