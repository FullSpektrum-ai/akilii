# FlowState provenance and publication gate

## Verified upstream

- Repository: `https://github.com/baphled/FlowState`
- Author recorded by the package: Yomi Colledge
- Inspected branch: `feature/dockerise`
- Inspected commit: `40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d`
- Commit author at the inspected revision: Yomi Colledge

The akilii runtime adapter is pinned to that exact upstream revision. Do not
replace it with an unpinned branch or silently copy FlowState source into the
akilii repository.

## Local augmentation still awaiting upstream review

The separate local FlowState checkout contains uncommitted changes to:

- `Dockerfile.backend`
- `Dockerfile.ui`
- `Makefile`
- `docker-compose.yml`

At the time of recording, the binary diff SHA-256 was:

`eac547570a0e8b601e5024a2012d2ead4fb49eaa7b11021180df771255242b12`

The changes adapt the Docker build to the current local checkout, update the Go
builder, select the current branch by default and ensure backend initialisation
completes before the UI starts. They have not been committed, attributed as
Yomi's work or represented as upstream-approved.

FlowState's repository rules require commits to use its `make ai-commit` process
and include a `Reviewed-By` trailer for Yomi. That trailer must not be added until
Yomi has actually reviewed the change. For that reason the local augmentation
must remain uncommitted until review, or be proposed through a route Yomi agrees
is appropriate.

## Licence blocker

The inspected repository has no tracked root licence file. Its README says MIT,
while `package.json` says BUSL-1.1. These are materially different licences.

Before public repository publication or redistribution of FlowState-derived
source or packaged FlowState binaries, obtain a written determination from Yomi
covering:

1. The authoritative licence and exact licence text.
2. Whether the local Docker augmentation may be published.
3. Whether FullSpektrum should use an upstream contribution, a public fork, a
   private fork or a patch maintained outside the akilii repository.
4. Required copyright and attribution wording.
5. Whether commercial demonstration and hosted use are permitted under the
   selected licence.

Do not infer permission from repository visibility or from attribution alone.

## Recommended integration history

After licence confirmation and review:

1. Preserve FlowState's original Git history in a dedicated fork.
2. Apply the local Docker augmentation as a small commit authored by the person
   making the changes.
3. Attribute Yomi and the upstream repository in the commit body and notice.
4. Use `Co-authored-by` only if Yomi materially co-authored that exact commit and
   agrees to the trailer.
5. Pin akilii to the reviewed commit rather than a moving branch.
6. Record any future local patches and their upstream disposition.

## Publication gate

FlowState attribution is prepared, but the licence and local augmentation are
not cleared for public redistribution. GitHub publication of akilii may proceed
only if it does not vendor or distribute uncleared FlowState material, or after
the licence questions above are resolved.
