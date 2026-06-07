import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ITEM_CATEGORIES, ITEM_CATEGORY_LABELS, type ItemCategory } from '../item/categoryOptions'
import { createItem, deleteItem, getCurrentUserItems, updateItem } from '../item/itemService'
import type { ItemSummary } from '../item/types'

type ItemModalMode = 'create' | 'edit' | null

const API_URL = import.meta.env.VITE_API_URL ?? ''

function ProfilePage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [items, setItems] = useState<ItemSummary[]>([])
    const [itemsError, setItemsError] = useState<string | null>(null)
    const [isItemsLoading, setIsItemsLoading] = useState(true)
    const [modalMode, setModalMode] = useState<ItemModalMode>(null)
    const [selectedItem, setSelectedItem] = useState<ItemSummary | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [condition, setCondition] = useState('5')
    const [category, setCategory] = useState<ItemCategory>('OTHER')
    const [startPrice, setStartPrice] = useState('')
    const [endDate, setEndDate] = useState('')
    const [modalError, setModalError] = useState<string | null>(null)
    const [isSavingItem, setIsSavingItem] = useState(false)
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

    useEffect(() => {
        if (!user) {
            return
        }

        void loadItems()
    }, [user])

    const itemCount = items.length

    async function loadItems() {
        try {
            setIsItemsLoading(true)
            setItemsError(null)
            const response = await getCurrentUserItems()
            setItems(response.items)
        } catch (error) {
            setItemsError(error instanceof Error ? error.message : 'Failed to load your items.')
        } finally {
            setIsItemsLoading(false)
        }
    }

    function openCreateModal() {
        setModalError(null)
        setSelectedItem(null)
        setTitle('')
        setDescription('')
        setCondition('5')
        setCategory('OTHER')
        setStartPrice('')
        setEndDate('')
        setModalMode('create')
    }

    function openEditModal(item: ItemSummary) {
        setModalError(null)
        setSelectedItem(item)
        setTitle(item.title)
        setDescription(item.description)
        setCondition(String(item.condition))
        setCategory(item.category)
        setStartPrice('')
        setEndDate('')
        setModalMode('edit')
    }

    function closeModal() {
        if (isSavingItem) {
            return
        }

        setModalMode(null)
        setSelectedItem(null)
        setModalError(null)
    }

    async function handleItemSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setModalError(null)

        const trimmedTitle = title.trim()
        const trimmedDescription = description.trim()
        const parsedCondition = Number(condition)

        if (!trimmedTitle || !trimmedDescription) {
            setModalError('Provide both a title and a description.')
            return
        }

        if (!Number.isInteger(parsedCondition) || parsedCondition < 1 || parsedCondition > 10) {
            setModalError('Provide a condition between 1 and 10.')
            return
        }

        try {
            setIsSavingItem(true)

            if (modalMode === 'edit' && selectedItem) {
                await updateItem(selectedItem.id, {
                    title: trimmedTitle,
                    description: trimmedDescription,
                    condition: parsedCondition,
                    category,
                })
            } else {
                const parsedStartPrice = Number(startPrice)

                if (!Number.isFinite(parsedStartPrice) || parsedStartPrice <= 0) {
                    setModalError('Provide a valid start price greater than 0.')
                    setIsSavingItem(false)
                    return
                }

                if (!endDate) {
                    setModalError('Provide an auction end date.')
                    setIsSavingItem(false)
                    return
                }

                await createItem({
                    title: trimmedTitle,
                    description: trimmedDescription,
                    condition: parsedCondition,
                    category,
                    startPrice: parsedStartPrice,
                    endDate: new Date(endDate).toISOString(),
                })
            }

            await loadItems()
            setModalMode(null)
            setSelectedItem(null)
            setModalError(null)
        } catch (error) {
            setModalError(error instanceof Error ? error.message : 'Failed to save item.')
        } finally {
            setIsSavingItem(false)
        }
    }

    async function handleDeleteItem(item: ItemSummary) {
        const shouldDelete = window.confirm(`Delete "${item.title}"?`)

        if (!shouldDelete) {
            return
        }

        try {
            setDeletingItemId(item.id)
            setItemsError(null)
            await deleteItem(item.id)
            await loadItems()
        } catch (error) {
            setItemsError(error instanceof Error ? error.message : 'Failed to delete item.')
        } finally {
            setDeletingItemId(null)
        }
    }

    if (!user) {
        return <p>Loading profile...</p>
    }

    return (
      <section className="profile-page">
        <div className="profile-page-header">
          <div>
            <h1 id="heading">Profile</h1>
            <div className="form">
              <div className="profile-avatar-section">
                {user.avatarUrl ? (
                  <img
                    className="avatar-img"
                    src={`${API_URL}${user.avatarUrl}`}
                    alt={`${user.username} avatar`}
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <p className="profile-text">
                <span className="profile-label">Username:</span> {user.username}
              </p>
              <p className="profile-text">
                <span className="profile-label">User ID:</span> {user.userId}
              </p>
              <button type="button" className="btn btn-primary button btn-update" onClick={() => navigate('/profile/update')}>
                Update profile
              </button>
            </div>
          </div>
        </div>

        <div className="profile-section-header">
          <h2>My items</h2>
          <button type="button" className="btn button-secondary" onClick={openCreateModal}>
            New
          </button>
        </div>

        {(isItemsLoading || itemsError) && (
          <div className="items-status">
            {isItemsLoading ? <p>Loading your items...</p> : null}
            {itemsError ? <p className="alert alert-danger error-message" role="alert">{itemsError}</p> : null}
          </div>
        )}

        {!isItemsLoading && !itemsError && (
          itemCount > 0 ? (
            <div className="item-grid">
              {items.map((item) => (
                <article key={item.id} className="item-card">
                  <div className="item-card-body">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="item-card-meta">
                    <span>Category: {ITEM_CATEGORY_LABELS[item.category]}</span>
                    <span>Condition: {item.condition}/10</span>
                    {item.auction ? (
                      <>
                        <span>Start price: {item.auction.startPrice}</span>
                        <span>Status: {item.auction.status}</span>
                        <span>Current price: {item.auction.currentPrice}</span>
                      </>
                    ) : (
                      <span>No auction yet</span>
                    )}
                  </div>
                  <div className="item-card-actions">
                    <button type="button" className="btn item-button item-button--primary" onClick={() => openEditModal(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn item-button item-button--danger"
                      onClick={() => void handleDeleteItem(item)}
                      disabled={deletingItemId === item.id}
                    >
                      {deletingItemId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                    {item.auction ? (
                      <Link to={`/auction/${item.auction.id}/chat`}>Enter chat room</Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You have not created any items yet.</p>
            </div>
          )
        )}

        {modalMode ? (
          <div className="modal-backdrop" role="presentation" onClick={closeModal}>
            <div
              className="modal-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="item-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-header">
                <h2 id="item-modal-title">{modalMode === 'edit' ? 'Edit item' : 'Create listing'}</h2>
              </div>

              <form onSubmit={handleItemSubmit} className="modal-form" noValidate>
                <label>
                  Title
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                    placeholder="Listing title"
                  />
                </label>

                <label>
                  Description
                  <textarea
                    className="form-control"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={5}
                    placeholder="Describe your item"
                  />
                </label>

                <label>
                  Condition (1-10)
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="10"
                    step="1"
                    value={condition}
                    onChange={(event) => setCondition(event.target.value)}
                    placeholder="Condition out of 10"
                  />
                </label>

                <label>
                  Category
                  <select
                    className="form-control"
                    value={category}
                    onChange={(event) => setCategory(event.target.value as ItemCategory)}
                  >
                    {ITEM_CATEGORIES.map((itemCategory) => (
                      <option key={itemCategory} value={itemCategory}>
                        {ITEM_CATEGORY_LABELS[itemCategory]}
                      </option>
                    ))}
                  </select>
                </label>

                {modalMode === 'create' ? (
                  <>
                    <label>
                      Start price
                      <input
                        type="number"
                        className="form-control"
                        min="0.01"
                        step="0.01"
                        value={startPrice}
                        onChange={(event) => setStartPrice(event.target.value)}
                        placeholder="Start price"
                      />
                    </label>

                    <label>
                      Auction end date
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                      />
                    </label>
                  </>
                ) : null}

                {modalError ? <p className="alert alert-danger modal-error-message" role="alert">{modalError}</p> : null}

                <div className="modal-actions">
                  <button type="button" className="btn item-button item-button--cancel" onClick={closeModal} disabled={isSavingItem}>
                    Cancel
                  </button>
                  <button type="submit" className="btn item-button item-button--primary" disabled={isSavingItem}>
                    {isSavingItem ? (modalMode === 'edit' ? 'Saving...' : 'Creating...') : (modalMode === 'edit' ? 'Save changes' : 'Create listing')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </section>
    )
}
export default ProfilePage
