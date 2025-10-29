import classNames from 'classnames/bind';
import styles from '../../assets/styles/admins/adminCVList.module.scss';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { Col, Row, Badge, ReviewModal } from '../layouts';
import { fetchCVsByPosition, getCVPreviewUrl } from '../../shared/api/cvApi';
import type { CandidateCV } from '../../shared/interfaces/adminInterface';
import { FaPen, FaTrash } from 'react-icons/fa';

const cx = classNames.bind(styles);

type ColumnName = 'Candidate Name' | 'Position' | 'Status' | 'Email' | 'Score' | 'Action';
type ModalType = 'CV_DETAILS' | 'CLOSE_MODAL' | null;

interface AdminCVListProps {
    disableColumns?: ColumnName[];
}

interface SelectedCVModal {
    candidate: CandidateCV;
    modalType: ModalType;
}

const initSelectedCVValue: SelectedCVModal = { candidate: {} as CandidateCV, modalType: null };

interface Filter {
    sortBy: 'ASCENDING' | 'DESCENDING';
    candidateName: string;
    minimumScore: number;
}

type Action =
    | { type: 'SORT_BY'; payload: 'ASCENDING' | 'DESCENDING' }
    | { type: 'CANDIDATE_NAME'; payload: string }
    | { type: 'MINIMUM_SCORE'; payload: number }
    | { type: 'RESET' };

const initFilterValue: Filter = {
    sortBy: 'DESCENDING',
    candidateName: '',
    minimumScore: 0,
};

const filterReducer = (state: Filter, action: Action): Filter => {
    switch (action.type) {
        case 'SORT_BY':
            return { ...state, sortBy: action.payload };
        case 'CANDIDATE_NAME':
            return { ...state, candidateName: action.payload };
        case 'MINIMUM_SCORE':
            return { ...state, minimumScore: action.payload };
        case 'RESET':
            return initFilterValue;
        default:
            return state;
    }
};

const AdminCVList = ({ disableColumns = [] }: AdminCVListProps) => {
    const [cvs, setCVs] = useState<CandidateCV[]>([]);
    const [filter, dispatch] = useReducer(filterReducer, initFilterValue);
    const [selectedCVModal, setSelectedCVModal] = useState<SelectedCVModal>(initSelectedCVValue);

    useEffect(() => {
        const fetchCVs = async (position: string = '') => {
            try {
                const data: typeof cvs = await fetchCVsByPosition(position);
                setCVs(data);
            } catch (error) {
                console.error('Failed to fetch candidate application:', error);
            }
        };

        fetchCVs();
    }, []);

    const filteredCVs = useMemo<typeof cvs>(() => {
        const filteredCVs = cvs.filter(
            (cv) => cv.candidate_name.toLowerCase().includes(filter.candidateName.toLowerCase()) && cv.matched_score >= filter.minimumScore,
        );
        filteredCVs.sort((a, b) => {
            const scoreA = a.matched_score ?? 0;
            const scoreB = b.matched_score ?? 0;
            return filter.sortBy === 'ASCENDING' ? scoreA - scoreB : scoreB - scoreA;
        });
        return filteredCVs;
    }, [filter, cvs]);

    const handleOpenModal = (type: ModalType, cv: CandidateCV = {} as CandidateCV): void => {
        if (type === 'CLOSE_MODAL') {
            setSelectedCVModal(initSelectedCVValue);
        } else {
            if (Object.keys(cv).length !== 0) {
                setSelectedCVModal({ candidate: cv, modalType: type });
            } else {
                console.error('Missing a candidate CV');
            }
        }
    };

    return (
        <div className={cx('admin-cv-list')}>
            <div className={cx('cv-list-header')}>
                <h2 className={cx('cv-list-header__title')}>CV List</h2>
                <p className={cx('cv-list-header__subtitle')}>Manage all candidateCVs submitted to the system.</p>
            </div>

            <div className={cx('cv-list-body')}>
                <Row space={10} className={cx('cv-list-filter')}>
                    <Col size={{ sm: 5, md: 3, lg: 2, xl: 1 }}>
                        <button
                            className={cx('cv-list-filter__sort-btn')}
                            onClick={() => dispatch({ type: 'SORT_BY', payload: filter.sortBy === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING' })}
                        >
                            Sort by {filter.sortBy.toLowerCase()}
                            <span
                                className={cx('cv-list-filter__sort-btn-arrow', { 'cv-list-filter__sort-btn-arrow--active': filter.sortBy === 'DESCENDING' })}
                            >
                                ▲
                            </span>
                        </button>
                    </Col>
                    <Col size={{ sm: 5, md: 3, lg: 3, xl: 3 }}>
                        <input
                            type="text"
                            placeholder="Search by candidate name"
                            className={cx('cv-list-filter__input')}
                            onChange={(e) => dispatch({ type: 'CANDIDATE_NAME', payload: e.target.value })}
                        />
                    </Col>
                    <Col size={{ sm: 5, md: 3, lg: 3, xl: 3 }}>
                        <input
                            type="number"
                            placeholder="Minimum Score"
                            className={cx('cv-list-filter__input')}
                            min={0}
                            onChange={(e) => dispatch({ type: 'MINIMUM_SCORE', payload: Number(e.target.value) })}
                        />
                    </Col>
                </Row>

                <table className={cx('cv-list-table')}>
                    <thead>
                        <tr>
                            {!disableColumns.includes('Candidate Name') && <th className={cx('cv-list-table__title')}>Candidate Name</th>}
                            {!disableColumns.includes('Position') && <th className={cx('cv-list-table__title')}>Position</th>}
                            {!disableColumns.includes('Status') && <th className={cx('cv-list-table__title')}>Status</th>}
                            {!disableColumns.includes('Email') && <th className={cx('cv-list-table__title')}>Email</th>}
                            {!disableColumns.includes('Score') && <th className={cx('cv-list-table__title')}>Score</th>}
                            {!disableColumns.includes('Action') && <th className={cx('cv-list-table__title')}>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCVs.map((cv) => (
                            <tr key={cv.id}>
                                {!disableColumns.includes('Candidate Name') && <td className={cx('cv-list-table__value')}>{cv.candidate_name}</td>}
                                {!disableColumns.includes('Position') && <td className={cx('cv-list-table__value')}>{cv.position}</td>}
                                {!disableColumns.includes('Status') && (
                                    <td className={cx('cv-list-table__value')}>
                                        <Badge type={cv.status} label={cv.status} />
                                    </td>
                                )}
                                {!disableColumns.includes('Email') && <td className={cx('cv-list-table__value')}>{cv.email}</td>}
                                {!disableColumns.includes('Score') && (
                                    <td className={cx('cv-list-table__value')}>
                                        <a onClick={() => handleOpenModal('CV_DETAILS', cv)}>{cv.matched_score}</a>
                                    </td>
                                )}
                                {!disableColumns.includes('Action') && (
                                    <td className={cx('cv-list-table__value')}>
                                        <div className={cx('cv-list-table__action')}>
                                            <button className={cx('cv-list-table__action-btn')} onClick={() => console.log('status')} title="Edit">
                                                <FaPen />
                                            </button>
                                            <button
                                                className={cx('cv-list-table__action-btn', 'cv-list-table__action-btn--delete')}
                                                onClick={() => console.log('status')}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ReviewModal open={selectedCVModal.modalType === 'CV_DETAILS'} title="Candidate Details" onClose={() => handleOpenModal('CLOSE_MODAL')}>
                {Object.keys(selectedCVModal.candidate).length !== 0 && (
                    <>
                        <div className={cx('cv-modal-header')}>
                            <p className={cx('cv-modal-header__personal-data')}>
                                <strong>Name:</strong> {selectedCVModal.candidate.candidate_name}
                            </p>
                            <p className={cx('cv-modal-header__personal-data')}>
                                <strong>Email:</strong> {selectedCVModal.candidate.email}
                            </p>
                            <p className={cx('cv-modal-header__personal-data')}>
                                <strong>Position:</strong> {selectedCVModal.candidate.position}
                            </p>
                            <p className={cx('cv-modal-header__personal-data')}>
                                <strong>Score:</strong> {selectedCVModal.candidate.matched_score}
                            </p>
                        </div>
                        <hr />
                        <div className={cx('cv-modal-body')}>
                            <h3>Reviewed by AI</h3>
                            <div className={cx('cv-modal-body__assessment')}>
                                {selectedCVModal.candidate.justification.split('\n').map((line, idx) => (
                                    <span key={idx}>
                                        {line}
                                        <br />
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="admin-cv-preview__iframe-container" style={{ marginTop: '1rem' }}>
                            <iframe
                                src={getCVPreviewUrl(selectedCVModal.candidate.id)}
                                title="CV Preview"
                                width="100%"
                                height="600px"
                                style={{ border: '1px solid #ccc' }}
                            />
                        </div>
                    </>
                )}
            </ReviewModal>
        </div>
    );
};

export default AdminCVList;
