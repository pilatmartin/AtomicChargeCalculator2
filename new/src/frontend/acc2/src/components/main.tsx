import Image from "@acc2/assets/images/1RLB.png";
import Propofol from "@acc2/assets/images/propofol.png";
import Bax from "@acc2/assets/images/bax.png";
import Receptor from "@acc2/assets/images/receptor.png";
import Elixir from "@acc2/assets/images/elixirlogo.png";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export const Main = () => {
  return (
    <main className="mx-auto w-full selection:text-white selection:bg-primary">
      <div className="flex relative w-4/5 max-w-[750px] mx-auto">
        <div className="my-16 p-2 bg-black bg-opacity-10 w-fit z-30">
          <h1 className="font-muni font-bold text-[#00AF3F] text-6xl">
            <span className="block bg-white w-fit">Atomic</span>
            <span className="block my-2 bg-white w-fit">Charge</span>
            <span className="block bg-white w-fit">Calculator II</span>
          </h1>
        </div>
        <img
          src={Image}
          alt="1RLB"
          className="absolute right-0"
          width={500}
          height={250}
        />
      </div>
      <div className="w-4/5 border mx-auto p-4 max-w-[1400px]">
        <h2 className="text-5xl text-primary font-bold ml-[1/5]">Compute</h2>
        <form>
          <div className="my-4 flex flex-col gap-2">
            <Label className="font-bold text-lg">Upload structure(s)</Label>
            <span className="text-sm text-[#afafaf]">
              Supported filetypes are <span className="font-bold">sdf</span>,
              <span className="font-bold"> mol2</span>,
              <span className="font-bold"> pdb</span>,
              <span className="font-bold"> mmcif</span>. You can upload one or
              multiple files at the same time. Maximum allowed upload size is
              <span className="font-bold"> 250MB</span>.
            </span>
            <Input
              id="files"
              type="file"
              multiple
              className="w-fit border-2 cursor-pointer"
            />
          </div>
          <div className="flex gap-4">
            <Button
              type="submit"
              className="font-bold uppercase border-2 border-primary hover:bg-white hover:text-primary"
            >
              Compute
            </Button>
            <Button
              type="button"
              className="bg-background border-2 border-black text-black font-bold uppercase hover:bg-black  hover:text-white"
            >
              Setup Computation
            </Button>
          </div>
        </form>
      </div>
      <div className="border-b w-screen my-12"></div>
      <div className="w-4/5 mx-auto px-4 max-w-[1400px]">
        <h2 className="text-5xl text-primary font-bold ml-[1/5] mb-4">About</h2>
        <p>
          Atomic Charge Calculator II (
          <span className="font-bold text-primary">ACC II</span>) is an
          application for fast calculation of partial atomic charges. It
          features 20 empirical methods along with parameters from literature.
          Short introduction covers the basic usage of ACC II. All methods and
          parameters are also available in a command-line application that can
          be used in user workflows.
        </p>
      </div>

      <div className="w-4/5 mx-auto px-4 max-w-[1400px] mt-12">
        <h2 className="text-5xl text-primary font-bold ml-[1/5] mb-4">
          Examples
        </h2>
        <div className="mb-12">
          <h3 className="font-bold text-lg mb-8">Dissociating hydrogens</h3>
          <div className="flex gap-8 items-center flex-col lg:flex-row">
            <img src={Propofol} alt="Propofol" />
            <p>
              This example focuses on acid dissociation of seven phenolic drugs,
              described in DrugBank. Their structures were obtained from
              PubChem. During the acid dissociation, these compounds release a
              hydrogen from the phenolic OH group. Using ACC II, we can examine
              a relation between pKa and a charge on the dissociating hydrogen.
              We found that the higher is pKa, the lower charge the hydrogen has
              (see table). This finding agrees with results published in
              literature.
            </p>
            <div>
              <Button
                type="button"
                className="font-bold uppercase border-2 border-primary hover:bg-white hover:text-primary"
              >
                Phenols
              </Button>
            </div>
          </div>
        </div>
        <div className="mb-12">
          <h3 className="font-bold text-lg mb-8">
            Apoptotic protein activation
          </h3>
          <div className="flex gap-8 items-center flex-col lg:flex-row">
            <img src={Bax} alt="Bax" />
            <p>
              BAX protein regulates an apoptosis process. In our example, we
              show inactive BAX (PDB ID 1f16) and activated BAX (PDB ID 2k7w).
              The activation causes a charge redistribution that also includes C
              domain depolarization. This depolarization causes release of the C
              domain, which can then penetrate mitochondrial membrane and start
              the apoptosis as described in the literature.
            </p>
            <div className="flex gap-4 lg:flex-col">
              <Button
                type="button"
                className="font-bold uppercase border-2 border-primary hover:bg-white hover:text-primary"
              >
                Activated
              </Button>
              <Button
                type="button"
                className="font-bold uppercase border-2 border-primary hover:bg-white hover:text-primary"
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-8">Transmembrane protein</h3>
          <div className="flex gap-8 items-center flex-col lg:flex-row">
            <img src={Receptor} alt="Receptor" />
            <p>
              The nicotinic acetylcholine receptor passes the cell membrane (see
              the figure, part A) and serves as an ion channel (more details).
              We obtained its structure from Protein Data Bank Europe (PDB ID
              2bg9), added missing hydrogens via WHAT IF and calculated the
              partial atomic charges using ACC II with default settings.
              Visualization of partial charges on the surface highlights the
              difference between nonpolar transmembrane part (mostly white due
              to charge around zero) and polar surface of extracellular and
              cytoplasmic parts (with mosaic of blue positive and red negative
              charges). The comparison demonstrates that this charge
              distribution agrees with receptor membrane position reported in
              literature.
            </p>
            <div>
              <Button
                type="button"
                className="font-bold uppercase border-2 border-primary hover:bg-white hover:text-primary"
              >
                Receptor
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b w-screen my-12"></div>
      <div className="w-4/5 mx-auto px-4 max-w-[1400px] mt-12">
        <p>
          If you found Atomic Charge Calculator II helpful, please cite: Raček,
          T., Schindler, O., Toušek, D., Horský, V., Berka, K., Koča, J., &
          Svobodová, R. (2020). Atomic Charge Calculator II: web-based tool for
          the calculation of partial atomic charges. Nucleic Acids Research. Are
          you interested in a research collaboration? Feel free to contact us.
        </p>
      </div>
      <div className="border-b w-screen my-12"></div>
      <div className="w-4/5 mx-auto px-4 max-w-[1400px] mt-12 flex flex-col items-center gap-4">
        <img src={Elixir} alt="Elixir logo" />
        <p>
          Atomic Charge Calculator II is a part of services provided by ELIXIR –
          European research infrastructure for biological information. For other
          services provided by ELIXIR's Czech Republic Node visit
          www.elixir-czech.cz/services .
        </p>
      </div>
      <div className="border-b w-screen my-12"></div>
      <div className="w-4/5 mx-auto px-4 max-w-[1400px] mt-12">
        <p>
          Licence conditions in accordance with § 11 of Act No. 130/2002 Coll.
          The owner of the software is Masaryk University, a public university,
          ID: 00216224. Masaryk University allows other companies and
          individuals to use this software free of charge and without
          territorial restrictions in usual way, that does not depreciate its
          value. This permission is granted for the duration of property rights.
          This software is not subject to special information treatment
          according to Act No. 412/2005 Coll., as amended. In case that a person
          who will use the software under this licence offer violates the
          licence terms, the permission to use the software terminates.
        </p>
      </div>
      <div className="border-b w-screen my-12"></div>
    </main>
  );
};
