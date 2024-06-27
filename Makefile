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


get-data: raw_data/contours-bv.topojson raw_data/candidats_results.csv raw_data/general_results.csv

raw_data/contours-bv.topojson:
	curl https://static.data.gouv.fr/resources/proposition-de-contours-des-bureaux-de-vote-selon-la-methode-de-linsee/20240626-071520/contours-bureaux-vote.json -o raw_data/contours-bv.topojson

raw_data/candidats_results.csv:
	curl https://object.files.data.gouv.fr/data-pipeline-open/prod/elections/candidats_results.csv -o raw_data/candidats_results.csv

raw_data/general_results.csv:
	curl https://object.files.data.gouv.fr/data-pipeline-open/prod/elections/general_results.csv -o raw_data/general_results.csv

mapshaper: src/static/bureaux_vote_et_communes.topojson

src/static/bureaux_vote_et_communes.topojson: raw_data/contours-bv.topojson
	mkdir -p src/static
	npx mapshaper raw_data/contours-bv.topojson snap name=bureaux_vote \
	-clean rewind \
	-simplify 5% visvalingam keep-shapes \
	-clean  \
	-filter-fields codeBureauVote,codeDepartement,codeCommune,numeroBureauVote,nomCommune \
	-dissolve codeCommune,nomCommune,codeDepartement + name=communes \
	-o format=topojson src/static/bureaux_vote_et_communes.topojson target=* quantization=1e6 fix-geometry

clean:
	rm -rf src/.observablehq/cache

distclean: clean
	rm -rf src/.observablehq/
	rm -rf dist renv/library renv/staging .Rhistory
	rm -rf .netlify node_modules raw_data generated src/static
