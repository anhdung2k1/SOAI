import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { getInterviews } from '../../services/api/interviewApis';
import { Button, Col, Row } from '../layouts';
import type { Interview } from '../../shared/types/adminTypes';
import classNames from 'classnames/bind';
import styles from '../../assets/styles/admins/adminInterviewList.module.scss';
import frameStyles from '../../assets/styles/admins/adminFrame.module.scss';

const cx = classNames.bind({ ...frameStyles, ...styles });

interface Filter {
    candidateName: string;
}

const initFilterValue: Filter = {
    candidateName: '',
};

type FilterAction = { type: 'CANDIDATE_NAME'; payload: string };

const filterReducer = (state: Filter, action: FilterAction): Filter => {
    switch (action.type) {
        case 'CANDIDATE_NAME':
            return { ...state, candidateName: action.payload };
        default:
            return state;
    }
};

const AdminInterviewList = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [filter, dispatchFilter] = useReducer(filterReducer, initFilterValue);

    const fetchInterviews = useCallback(async () => {
        try {
            const result = await getInterviews();
            setInterviews(result);
        } catch (error) {
            console.error('Failed to fetch interview session:', error);
        }
    }, []);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    const filteredInterviews = useMemo<typeof interviews>(() => {
        const filteredInterviews = interviews.filter((interview) => interview.candidate_name.toLowerCase().includes(filter.candidateName.toLowerCase()));
        return filteredInterviews;
    }, [filter.candidateName, interviews]);

    console.log(interviews);

    return (
        <div className={cx('admin-frame')}>
            <div className={cx('admin-frame-header')}>
                <h2 className={cx('admin-frame-header__title')}>Interview Management</h2>
                <p className={cx('admin-frame-header__subtitle')}>Setup interview sessions with approved CVs by the system.</p>
            </div>

            <Row space={10} className={cx('admin-frame-filter')}>
                <Col size={{ sm: 5, md: 3, lg: 3, xl: 3 }}>
                    <input
                        id="candidate-name"
                        type="text"
                        placeholder="Search by candidate name"
                        className={cx('admin-frame-filter__entry')}
                        onChange={(e) => dispatchFilter({ type: 'CANDIDATE_NAME', payload: e.target.value })}
                    />
                </Col>
            </Row>

            <Row space={20} className={cx('interview')}>
                <Col size={{ md: 4, lg: 4, xl: 4 }} className={cx('interview-col')}>
                    <h3 className={cx('interview-col__title', 'interview-col__title--pending')}>Scheduling Interviews</h3>

                    <section className={cx('interview-col__section')}>
                        {filteredInterviews.map(
                            (interview) =>
                                interview.status === 'Pending' && (
                                    <div key={interview.id} className={cx('interview-col__card')}>
                                        <div className={cx('interview-col__card-header')}>
                                            <h3>{interview.candidate_name}</h3>
                                            <Button
                                                type="menu"
                                                onClick={() => {
                                                    console.log('Menu Card');
                                                }}
                                            />
                                        </div>

                                        <div className={cx('interview-col__card-content')}>
                                            <p className={cx('interview-col__card-content-item')}>
                                                <strong>Position:</strong> React Web Developer (Frontend)
                                            </p>
                                            <p className={cx('interview-col__card-content-item')}>
                                                <strong>Interviewer:</strong> {interview.interviewer_name}
                                            </p>
                                            <p className={cx('interview-col__card-content-item')}>
                                                <strong>Venue:</strong> Online - MS Teams
                                            </p>
                                            <p className={cx('interview-col__card-content-item')}>
                                                <strong>Time:</strong> {new Date(interview.interview_datetime).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ),
                        )}
                    </section>
                </Col>
                <Col size={{ md: 4, lg: 4, xl: 4 }} className={cx('interview-col')}>
                    <h3 className={cx('interview-col__title', 'interview-col__title--accepted')}>Upcoming Interviews</h3>
                </Col>
                <Col size={{ md: 4, lg: 4, xl: 4 }} className={cx('interview-col')}>
                    <h3 className={cx('interview-col__title', 'interview-col__title--result')}>Result of Interviews</h3>
                </Col>
            </Row>
        </div>
    );
};

export default AdminInterviewList;
