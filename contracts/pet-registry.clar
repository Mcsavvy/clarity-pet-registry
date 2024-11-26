;; Define data structure for a pet
(define-map pets
    { pet-id: uint }
    {
        owner: principal,
        name: (string-ascii 50),
        species: (string-ascii 50),
        breed: (string-ascii 50),
        birth-date: uint,
        registration-date: uint
    }
)

;; Keep track of total pets registered
(define-data-var total-pets uint u0)

;; Error constants
(define-constant err-pet-not-found (err u100))
(define-constant err-not-owner (err u101))
(define-constant err-invalid-data (err u102))

;; Register a new pet
(define-public (register-pet 
    (name (string-ascii 50))
    (species (string-ascii 50))
    (breed (string-ascii 50))
    (birth-date uint))
    (let
        (
            (new-id (+ (var-get total-pets) u1))
        )
        (map-insert pets
            { pet-id: new-id }
            {
                owner: tx-sender,
                name: name,
                species: species,
                breed: breed,
                birth-date: birth-date,
                registration-date: block-height
            }
        )
        (var-set total-pets new-id)
        (ok new-id)
    )
)

;; Transfer pet ownership
(define-public (transfer-pet (pet-id uint) (new-owner principal))
    (let
        (
            (pet-data (unwrap! (map-get? pets { pet-id: pet-id }) err-pet-not-found))
        )
        (asserts! (is-eq tx-sender (get owner pet-data)) err-not-owner)
        (map-set pets
            { pet-id: pet-id }
            (merge pet-data { owner: new-owner })
        )
        (ok true)
    )
)

;; Get pet details
(define-read-only (get-pet-details (pet-id uint))
    (ok (map-get? pets { pet-id: pet-id }))
)

;; Get total number of registered pets
(define-read-only (get-total-pets)
    (ok (var-get total-pets))
)

;; Check if principal is pet owner
(define-read-only (is-pet-owner (pet-id uint) (address principal))
    (let
        (
            (pet-data (unwrap! (map-get? pets { pet-id: pet-id }) err-pet-not-found))
        )
        (ok (is-eq address (get owner pet-data)))
    )
)
