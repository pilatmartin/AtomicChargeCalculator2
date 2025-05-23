import Bax from "@acc2/assets/images/bax.png";
import Propofol from "@acc2/assets/images/propofol.png";
import Receptor from "@acc2/assets/images/receptor.png";
import { createSearchParams, useNavigate } from "react-router";

import { Example } from "../example";
import { Section } from "../section";

export const Examples = () => {
  const navigate = useNavigate();

  const goToExample = async (exampleId: string) => {
    void navigate({
      pathname: "/results",
      search: createSearchParams({
        example_id: exampleId,
      }).toString(),
    });
  };

  return (
    <Section title="Examples">
      <div className="grid grid-cols-1 gap-8 h-full xl:grid-cols-3">
        <Example
          title="Dissociating hydrogens"
          image={{ src: Propofol, alt: "Propofol" }}
          actions={[{ name: "Phenols", action: () => goToExample("phenols") }]}
        >
          <p>
            This example focuses on acid dissociation of seven phenolic drugs,
            described in{" "}
            <a
              href="https://www.drugbank.ca/"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              DrugBank
            </a>
            . Their structures were obtained from{" "}
            <a
              href="https://pubchem.ncbi.nlm.nih.gov/"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              PubChem
            </a>
            . During the acid dissociation, these compounds release a hydrogen
            from the phenolic OH group. Using ACC II, we can examine a relation
            between pKa and a charge on the dissociating hydrogen. We found that
            the higher is pKa, the lower charge the hydrogen has (see{" "}
            <a
              href="pka.pdf"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
            >
              table
            </a>
            ). This finding agrees with results published in{" "}
            <a
              href="https://pubs.acs.org/doi/full/10.1021/ci200133w"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              literature
            </a>
            .
          </p>
        </Example>
        <Example
          title="Apoptotic protein activation"
          image={{ src: Bax, alt: "Bax" }}
          actions={[
            { name: "Activated", action: () => goToExample("1f16") },
            { name: "Inactive", action: () => goToExample("2k7w") },
          ]}
        >
          <p>
            BAX protein regulates an apoptosis process. In our example, we show
            inactive BAX (PDB ID{" "}
            <a
              href="https://www.ebi.ac.uk/pdbe/entry/pdb/1f16"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              1f16
            </a>
            ) and activated BAX (PDB ID{" "}
            <a
              href="https://www.ebi.ac.uk/pdbe/entry/pdb/2k7w"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              2k7w
            </a>
            ). The activation causes a charge redistribution that also includes
            C domain{" "}
            <a
              href="bax.pdf"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
            >
              depolarization
            </a>
            . This depolarization causes release of the C domain, which can then
            penetrate mitochondrial membrane and start the apoptosis as
            described in the{" "}
            <a
              href="https://doi.org/10.1371/journal.pcbi.1002565"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              literature
            </a>
            .
          </p>
        </Example>
        <Example
          title="Transmembrane protein"
          image={{ src: Receptor, alt: "Receptor" }}
          actions={[
            { name: "Receptor", action: () => goToExample("receptor") },
          ]}
        >
          <p>
            The nicotinic acetylcholine receptor passes the cell membrane (see
            the{" "}
            <a
              href="receptor.pdf"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
            >
              figure
            </a>
            , part A) and serves as an ion channel (more{" "}
            <a
              href="https://www.sciencedirect.com/science/article/abs/pii/S0022283604016018"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              details
            </a>
            ). We obtained its structure from Protein Data Bank Europe (PDB ID{" "}
            <a
              href="https://www.ebi.ac.uk/pdbe/entry/pdb/2bg9"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              2bg9
            </a>
            ), added missing hydrogens via{" "}
            <a
              href="https://swift.cmbi.umcn.nl/whatif/"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              WHAT IF
            </a>{" "}
            and calculated the partial atomic charges using ACC II with default
            settings. Visualization of partial charges on the surface highlights
            the difference between nonpolar transmembrane part (mostly white due
            to charge around zero) and polar surface of extracellular and
            cytoplasmic parts (with mosaic of blue positive and red negative
            charges). The{" "}
            <a
              href="receptor.pdf"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
            >
              comparison
            </a>{" "}
            demonstrates that this charge distribution agrees with receptor
            membrane position reported in{" "}
            <a
              href="https://www.sciencedirect.com/science/article/pii/S0022283604016018"
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-primary hover:underline"
              rel="noreferrer"
            >
              literature
            </a>
            .
          </p>
        </Example>
      </div>
    </Section>
  );
};
