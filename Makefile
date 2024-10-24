.PHONY: all build init dev staging deploy get-data mapshaper clean distclean
all: build

build: init get-data mapshaper
	npm run build

init:
	npm install
	# npm audit fix
	Rscript -e "renv::restore()"
	mkdir -p raw_data

dev: init get-data mapshaper
	npm run dev

staging: build
	npx netlify deploy --dir=dist

deploy: build
	npx netlify deploy --dir=dist --prod


get-data: raw_data/contours-bv.topojson raw_data/candidats_results.csv raw_data/general_results.csv raw_data/res_2024_legi_t1.csv raw_data/res_2024_legi_t2.csv

raw_data/contours-bv.topojson:
	curl https://static.data.gouv.fr/resources/proposition-de-contours-des-bureaux-de-vote-selon-la-methode-de-linsee/20240711-174028/contours-bureaux-vote.json -o raw_data/contours-bv.topojson

raw_data/candidats_results.csv:
	curl https://object.files.data.gouv.fr/data-pipeline-open/prod/elections/candidats_results.csv -o raw_data/candidats_results.csv

raw_data/general_results.csv:
	curl https://object.files.data.gouv.fr/data-pipeline-open/prod/elections/general_results.csv -o raw_data/general_results.csv

# résultats législatives 2024
raw_data/res_2024_legi_t1.csv:
	curl https://static.data.gouv.fr/resources/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-provisoires-du-1er-tour/20240701-155452/resultats-provisoires-par-bureau-de-votevmn.csv -o raw_data/res_2024_legi_t1.csv

# résultats législatives 2024
raw_data/res_2024_legi_t2.csv:
	curl https://static.data.gouv.fr/resources/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-provisoires-du-2nd-tour/20240708-165335/resultats-provisoires-par-bureau-de-vote.csv -o raw_data/res_2024_legi_t2.csv


mapshaper: src/static/bureaux_vote_et_communes.topojson

src/static/bureaux_vote_et_communes.topojson: raw_data/contours-bv.topojson
	mkdir -p src/static
	npx mapshaper raw_data/contours-bv.topojson snap name=bureaux_vote \
	-clean rewind \
	-simplify 5% visvalingam keep-shapes \
	-clean  \
	-dissolve codeCommune,nomCommune,codeDepartement + name=communes target=bureaux_vote \
	-dissolve codeCirco,nomCirco,codeDepartement + name=circos target=bureaux_vote \
	-dissolve codeDepartement,nomDepartement + name=departements target=bureaux_vote \
	-o format=topojson src/static/bureaux_vote_et_communes.topojson target=* quantization=1e6 fix-geometry

clean:
	rm -rf src/.observablehq/cache

distclean: clean
	rm -rf src/.observablehq/
	rm -rf dist renv/library renv/staging .Rhistory
	rm -rf .netlify node_modules raw_data generated src/static
